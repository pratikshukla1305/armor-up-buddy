
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request body
    const requestData = await req.json();
    const { 
      reportId, 
      pdfId = null, 
      pdfName = null, 
      pdfUrl = null,
      pdfIsOfficial = false,
      videoId = null,
      videoName = null,
      videoUrl = null,
      videoStatus = null,
      videoSize = null,
      reportTitle = null,
      reportStatus = null,
      userId = null
    } = requestData;
    
    if (!reportId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Report ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log("Received update request for report materials:", {
      reportId,
      pdfId,
      pdfName,
      videoId,
      videoName,
      userId
    });
    
    // Get report info if not provided
    let title = reportTitle;
    let status = reportStatus;
    let user_id = userId;
    
    if (!title || !status || !user_id) {
      const { data: reportData, error: reportError } = await supabase
        .from('crime_reports')
        .select('title, status, user_id')
        .eq('id', reportId)
        .single();
        
      if (reportError) {
        console.error('Error fetching report info:', reportError);
      } else if (reportData) {
        title = title || reportData.title;
        status = status || reportData.status;
        user_id = user_id || reportData.user_id;
      }
    }
    
    console.log("Report information retrieved:", { title, status, user_id });
    
    // Check if the officer_report_materials table has existing entries for this report
    const { data: existingMaterials, error: materialsError } = await supabase
      .from('officer_report_materials')
      .select('*')
      .eq('report_id', reportId);
      
    if (materialsError) {
      console.error('Error checking existing materials:', materialsError);
    }
    
    console.log("Existing materials:", existingMaterials);
    
    // If there's a PDF update
    if (pdfId && pdfUrl) {
      // Check if this PDF already exists in the materials
      const existingPdf = existingMaterials?.find(m => m.pdf_id === pdfId);
      
      if (existingPdf) {
        // Update existing record
        console.log(`Updating existing PDF record for ID: ${pdfId}`);
        const { error: updateError } = await supabase
          .from('officer_report_materials')
          .update({
            pdf_name: pdfName,
            pdf_url: pdfUrl,
            pdf_is_official: pdfIsOfficial,
            report_title: title,
            report_status: status,
            user_id: user_id
          })
          .eq('pdf_id', pdfId)
          .eq('report_id', reportId);
          
        if (updateError) {
          console.error('Error updating PDF record:', updateError);
        }
      } else {
        // Insert new record
        console.log(`Inserting new PDF record for ID: ${pdfId}`);
        const { error: insertError } = await supabase
          .from('officer_report_materials')
          .insert({
            report_id: reportId,
            pdf_id: pdfId,
            pdf_name: pdfName,
            pdf_url: pdfUrl,
            pdf_is_official: pdfIsOfficial,
            report_title: title,
            report_status: status,
            user_id: user_id
          });
          
        if (insertError) {
          console.error('Error inserting PDF record:', insertError);
        }
      }
    }
    
    // Check for video evidence and sync with officer_report_materials
    if (videoUrl === null && pdfId === null) {
      // Try to get evidence from the report
      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence')
        .select('*')
        .eq('report_id', reportId);
        
      if (evidenceError) {
        console.error('Error fetching evidence:', evidenceError);
      } else if (evidenceData && evidenceData.length > 0) {
        console.log("Found evidence items:", evidenceData.length);
        
        // Add video evidence to officer materials
        for (const evidence of evidenceData) {
          if (evidence.storage_path && 
              (evidence.storage_path.includes('.mp4') || 
               evidence.storage_path.includes('.mov') || 
               evidence.storage_path.includes('video'))) {
            
            console.log("Processing video evidence:", evidence);
            
            // Check if this video already exists in the materials
            const existingVideo = existingMaterials?.find(m => 
              m.video_url === evidence.storage_path
            );
            
            if (!existingVideo) {
              // Insert video evidence into officer_report_materials
              console.log("Inserting new video evidence record");
              const { data: insertData, error: insertError } = await supabase
                .from('officer_report_materials')
                .insert({
                  report_id: reportId,
                  video_url: evidence.storage_path,
                  video_name: evidence.title || 'Video Evidence',
                  report_title: title,
                  report_status: status,
                  user_id: user_id
                });
                
              if (insertError) {
                console.error('Error inserting video evidence:', insertError);
              } else {
                console.log('Successfully added video evidence to officer materials');
              }
            } else {
              console.log("Video evidence already exists in materials, skipping");
            }
          }
        }
      }
    }
    
    // Call the update_officer_report_materials database function
    console.log("Calling RPC function with params:", {
      p_report_id: reportId,
      p_pdf_id: pdfId,
      p_pdf_name: pdfName,
      p_pdf_url: pdfUrl,
      p_pdf_is_official: pdfIsOfficial,
      p_video_id: videoId,
      p_video_name: videoName, 
      p_video_url: videoUrl,
      p_video_status: videoStatus,
      p_video_size: videoSize,
      p_report_title: title,
      p_report_status: status,
      p_user_id: user_id
    });
    
    const { data, error } = await supabase.rpc(
      'update_officer_report_materials',
      {
        p_report_id: reportId,
        p_pdf_id: pdfId,
        p_pdf_name: pdfName,
        p_pdf_url: pdfUrl,
        p_pdf_is_official: pdfIsOfficial,
        p_video_id: videoId,
        p_video_name: videoName, 
        p_video_url: videoUrl,
        p_video_status: videoStatus,
        p_video_size: videoSize,
        p_report_title: title,
        p_report_status: status,
        p_user_id: user_id
      }
    );
    
    if (error) {
      console.error('Error updating officer materials:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Also check if we need to sync PDFs from report_pdfs
    if (!pdfId) {
      console.log("No PDF ID provided, checking report_pdfs table");
      
      const { data: pdfData, error: pdfError } = await supabase
        .from('report_pdfs')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: false });
        
      if (pdfError) {
        console.error('Error fetching PDFs:', pdfError);
      } else if (pdfData && pdfData.length > 0) {
        console.log("Found PDFs in report_pdfs:", pdfData.length);
        
        // Check existing officer materials
        for (const pdf of pdfData) {
          // Check if this PDF already exists in the materials
          const pdfExists = existingMaterials?.some(m => m.pdf_id === pdf.id);
          
          if (!pdfExists) {
            console.log(`Adding PDF ${pdf.id} to officer materials`);
            
            // Add PDF to officer materials
            const { error: insertError } = await supabase
              .from('officer_report_materials')
              .insert({
                report_id: reportId,
                pdf_id: pdf.id,
                pdf_name: pdf.file_name,
                pdf_url: pdf.file_url,
                pdf_is_official: pdf.is_official || false,
                report_title: title,
                report_status: status,
                user_id: user_id
              });
              
            if (insertError) {
              console.error('Error inserting PDF to officer materials:', insertError);
            } else {
              console.log(`Successfully added PDF ${pdf.id} to officer materials`);
            }
          }
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
