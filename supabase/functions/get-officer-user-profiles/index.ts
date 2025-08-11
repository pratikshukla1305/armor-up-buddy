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

    // Fetch all profiles
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

    const userIds = (profiles ?? []).map((p) => p.id)

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

    const latestKycByUser = new Map<string, any>()
    for (const k of kycs) {
      const existing = latestKycByUser.get(k.user_id)
      const kTime = new Date(k.created_at ?? k.submission_date ?? 0).getTime()
      const eTime = existing ? new Date(existing.created_at ?? existing.submission_date ?? 0).getTime() : -1
      if (!existing || kTime > eTime) latestKycByUser.set(k.user_id, k)
    }

    const result = (profiles ?? []).map((profile) => {
      const r = byUserReports.get(profile.id) ?? []
      const a = byUserAlerts.get(profile.id) ?? []
      const k = latestKycByUser.get(profile.id)

      const approved = r.filter((x) => (x.status || '').toLowerCase() === 'approved').length
      const rejected = r.filter((x) => (x.status || '').toLowerCase() === 'rejected').length
      const confirmedAlerts = a.filter((x) => (x.status || '').toLowerCase() === 'confirmed').length

      const kycStatus = (k?.status || '').toString().toLowerCase()
      const kycVerified = kycStatus === 'approved' || kycStatus === 'verified'

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
