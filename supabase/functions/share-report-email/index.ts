
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    
    if (!resendApiKey) {
      console.error("Missing Resend API key");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Missing email service API key" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    const { reportId, pdfUrl, recipientEmail, subject, message } = await req.json();

    if (!reportId || !pdfUrl || !recipientEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required parameters: reportId, pdfUrl, or recipientEmail" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch report details
    const { data: reportData, error: reportError } = await supabase
      .from("crime_reports")
      .select("*, crime_report_analysis(*)")
      .eq("id", reportId)
      .single();

    if (reportError) {
      console.error("Error fetching report:", reportError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Could not find report details" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Check if the PDF URL is accessible - try to fetch the file
    let pdfBlob;
    try {
      // First try to use the URL directly
      const pdfResponse = await fetch(pdfUrl);
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }
      
      pdfBlob = await pdfResponse.blob();
      console.log("Successfully fetched PDF blob:", pdfBlob.size, "bytes");
    } catch (pdfError) {
      console.error("Error fetching PDF file:", pdfError);
      
      // Return specific error for PDF issues
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Could not access the PDF file. Please generate it again." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Send email with Resend
    let emailResult;
    try {
      emailResult = await resend.emails.send({
        from: "Shield Report <reports@shieldapp.com>",
        to: [recipientEmail],
        subject: subject || "Crime Incident Report",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #0047ab; margin-bottom: 0;">SHIELD</h1>
              <p style="color: #666; margin-top: 5px;">Crime Incident Report</p>
            </div>
            
            <p style="margin-bottom: 15px;">${message || "Please find the attached report for your review."}</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #0047ab; padding: 15px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0; font-size: 18px;">Report Summary</h2>
              <p><strong>Report ID:</strong> ${reportId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              ${reportData.detailed_location ? `<p><strong>Location:</strong> ${reportData.detailed_location}</p>` : ''}
              ${reportData.crime_report_analysis && reportData.crime_report_analysis[0] ? 
                `<p><strong>Incident Type:</strong> ${reportData.crime_report_analysis[0].crime_type}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${pdfUrl}" style="background-color: #0047ab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                View Full Report
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
              <p>This is an automated message from the Shield reporting system.</p>
              <p>© ${new Date().getFullYear()} Shield - Securely report incidents with confidence.</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `Shield-Report-${reportId}.pdf`,
            content: pdfBlob
          }
        ]
      });
      
      console.log("Email sent successfully:", emailResult);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to send email: ${emailError.message}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Record the email sharing in the database using SQL
    // This edge function has admin privileges
    const { error: insertError } = await supabase
      .from("report_shares")
      .insert({
        report_id: reportId,
        shared_to: recipientEmail,
        share_type: "email",
        shared_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error("Error recording share from edge function:", insertError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          messageId: emailResult?.id || "Email sent successfully" 
        } 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in share-report-email function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || "An error occurred while sharing the report" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
