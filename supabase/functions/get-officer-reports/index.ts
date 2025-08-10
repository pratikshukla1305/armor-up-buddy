// Deno Edge Function: get-officer-reports
// Returns officer-facing list of reports with evidence and PDFs.
// Uses service role to bypass RLS while still requiring a valid JWT to call.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    })

    const body = await req.json().catch(() => ({}))
    const limit = typeof body?.limit === 'number' && body.limit > 0 ? body.limit : 100

    // 1) Fetch reports with officer-relevant statuses
    const { data: reports, error: reportsError } = await supabase
      .from('crime_reports')
      .select('id, title, description, location, detailed_location, report_date, updated_at, status, user_id')
      .in('status', ['submitted', 'processing', 'completed'])
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (reportsError) {
      console.error('get-officer-reports: reportsError', reportsError)
      return new Response(JSON.stringify({ error: reportsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (!reports || reports.length === 0) {
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const reportIds = reports.map((r) => r.id)
    const userIds = Array.from(new Set(reports.map((r) => r.user_id).filter(Boolean)))

    // 2) Fetch evidence for these reports
    const { data: evidence, error: evidenceError } = await supabase
      .from('evidence')
      .select('id, report_id, user_id, storage_path, type, title, uploaded_at')
      .in('report_id', reportIds)

    if (evidenceError) {
      console.warn('get-officer-reports: evidenceError', evidenceError)
    }

    // 3) Fetch PDFs for these reports
    const { data: pdfs, error: pdfsError } = await supabase
      .from('report_pdfs')
      .select('id, report_id, file_url, file_name, is_official, created_at')
      .in('report_id', reportIds)

    if (pdfsError) {
      console.warn('get-officer-reports: pdfsError', pdfsError)
    }

    // 4) Fetch minimal user profile info
    let profiles: any[] = []
    if (userIds.length > 0) {
      const { data: profs, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

      if (profilesError) {
        console.warn('get-officer-reports: profilesError', profilesError)
      } else {
        profiles = profs || []
      }
    }

    const evidenceByReport: Record<string, any[]> = {}
    for (const e of evidence || []) {
      if (!evidenceByReport[e.report_id]) evidenceByReport[e.report_id] = []
      evidenceByReport[e.report_id].push(e)
    }

    const pdfsByReport: Record<string, any[]> = {}
    for (const p of pdfs || []) {
      if (!pdfsByReport[p.report_id]) pdfsByReport[p.report_id] = []
      pdfsByReport[p.report_id].push(p)
    }

    const profilesById: Record<string, any> = {}
    for (const p of profiles) {
      profilesById[p.id] = p
    }

    const merged = reports.map((r) => ({
      ...r,
      evidence: evidenceByReport[r.id] || [],
      report_pdfs: pdfsByReport[r.id] || [],
      user_profile: r.user_id ? profilesById[r.user_id] || null : null,
    }))

    return new Response(JSON.stringify({ data: merged }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e: any) {
    console.error('get-officer-reports: unhandled error', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
