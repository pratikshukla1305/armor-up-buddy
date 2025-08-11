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
      console.warn('Missing Authorization header for update-report-status')
    }

    const { reportId, status, officerNotes } = await req.json()

    if (!reportId || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'reportId and status are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader ?? '' } },
    })

    console.log(`Updating report ${reportId} to status ${status}`)

    // Update the report
    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (officerNotes) updateData.officer_notes = officerNotes

    const { data: updated, error: updateError } = await supabase
      .from('crime_reports')
      .update(updateData)
      .eq('id', reportId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Update failed:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Fetch user_id for notifications
    const userId = updated?.user_id
    if (userId) {
      const { error: notifError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          report_id: reportId,
          notification_type: 'officer_action',
          is_read: false,
          message: `An officer has updated your report status to: ${status}`,
        })
      if (notifError) console.warn('Failed to insert user notification:', notifError)
    }

    return new Response(
      JSON.stringify({ success: true, data: updated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('Unhandled error in update-report-status:', err)
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Unexpected error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
