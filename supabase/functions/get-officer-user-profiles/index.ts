import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.warn('Missing Authorization header for get-officer-user-profiles')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader ?? '' } },
    })

    // Prefer fetching all auth users (admin) and enrich with profiles
    let adminUsers: any[] = []
    try {
      const { data: adminData, error: adminErr }: any = await (supabase as any).auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (adminErr) console.warn('admin.listUsers error:', adminErr)
      else adminUsers = adminData?.users || []
    } catch (e) {
      console.warn('admin.listUsers failed:', e)
    }

    let baseUsers: any[] = []
    let userIds: string[] = []

    if (adminUsers.length > 0) {
      userIds = adminUsers.map((u: any) => u.id)
      const { data: profs, error: profErr } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at, updated_at')
        .in('id', userIds)
      if (profErr) console.warn('profilesError:', profErr)
      const profilesById = new Map((profs || []).map((p: any) => [p.id, p]))

      baseUsers = adminUsers.map((u: any) => {
        const p: any = profilesById.get(u.id) || {}
        return {
          id: u.id,
          email: p.email || u.email,
          full_name: p.full_name || u.user_metadata?.full_name || null,
          created_at: p.created_at || u.created_at,
          updated_at: p.updated_at || u.updated_at,
        }
      })
    } else {
      // Fallback: profiles table only
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at, updated_at')

      if (profilesError) {
        console.error('profilesError:', profilesError)
        return new Response(
          JSON.stringify({ success: false, error: profilesError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      baseUsers = profiles || []
      userIds = (profiles ?? []).map((p) => p.id)
    }

    // Fetch reports for all users
    let reports: any[] = []
    if (userIds.length > 0) {
      const { data, error } = await supabase
        .from('crime_reports')
        .select('id, user_id, status, updated_at, report_date')
        .in('user_id', userIds)
      if (!error && data) reports = data
      else if (error) console.warn('reportsError:', error)
    }

    // Fetch alerts for all users
    let alerts: any[] = []
    if (userIds.length > 0) {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('alert_id, reported_by, status, reported_time')
        .in('reported_by', userIds as any)
      if (!error && data) alerts = data
      else if (error) console.warn('alertsError:', error)
    }

    // Fetch KYC verifications for all users (as text)
    let kycs: any[] = []
    if (userIds.length > 0) {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('id, user_id, status, created_at, submission_date')
        .in('user_id', userIds.map((id) => id as any))
      if (!error && data) kycs = data
      else if (error) console.warn('kycError:', error)
    }

    const byUserReports = new Map<string, any[]>()
    for (const r of reports) {
      const arr = byUserReports.get(r.user_id) ?? []
      arr.push(r)
      byUserReports.set(r.user_id, arr)
    }

    const byUserAlerts = new Map<string, any[]>()
    for (const a of alerts) {
      const arr = byUserAlerts.get(a.reported_by) ?? []
      arr.push(a)
      byUserAlerts.set(a.reported_by, arr)
    }

    const anyApprovedByUser = new Map<string, boolean>()
    for (const k of kycs) {
      const s = (k.status || '').toString().toLowerCase()
      if (s === 'approved' || s === 'verified') anyApprovedByUser.set(k.user_id, true)
      else if (!anyApprovedByUser.has(k.user_id)) anyApprovedByUser.set(k.user_id, false)
    }

    const result = (baseUsers ?? []).map((profile) => {
      const r = byUserReports.get(profile.id) ?? []
      const a = byUserAlerts.get(profile.id) ?? []
      const kycVerified = anyApprovedByUser.get(profile.id) === true

      const approved = r.filter((x) => (x.status || '').toLowerCase() === 'approved').length
      const rejected = r.filter((x) => (x.status || '').toLowerCase() === 'rejected').length
      const confirmedAlerts = a.filter((x) => (x.status || '').toLowerCase() === 'confirmed').length

      return {
        ...profile,
        reports_submitted: r.length,
        reports_approved: approved,
        reports_rejected: rejected,
        alerts_submitted: a.length,
        alerts_confirmed: confirmedAlerts,
        kyc_verified: kycVerified,
        last_active: profile.updated_at ?? profile.created_at,
      }
    })

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('Unhandled error in get-officer-user-profiles:', err)
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
