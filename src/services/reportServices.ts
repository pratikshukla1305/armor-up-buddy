
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addMockEvidenceToReports } from './mockEvidenceService';

// Submit a report to officer
export const submitReportToOfficer = async (reportId: string) => {
  try {
    // First check if report exists
    const { data: reportCheck, error: checkError } = await supabase
      .from('crime_reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        throw new Error("Report not found. Please verify the report ID.");
      }
      throw checkError;
    }
    
    // Update report status
    const { data, error } = await supabase
      .from('crime_reports')
      .update({
        status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Create notification in officer_notifications table
    const { error: notificationError } = await supabase
      .from('officer_notifications')
      .insert([
        {
          report_id: reportId,
          notification_type: 'new_report',
          is_read: false,
          message: `New self-report submitted for review - Report ID: ${reportId}`
        }
      ]);
    
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error submitting report to officer:', error);
    toast.error(`Failed to submit report: ${error.message}`);
    throw error;
  }
};

// Get reports for officer
export const getOfficerReports = async () => {
  try {
    console.log("Fetching officer reports...");
    
    // First, fetch reports
    const { data: reports, error: reportsError } = await supabase
      .from('crime_reports')
      .select('*')
      .in('status', ['submitted', 'processing', 'completed'])
      .order('updated_at', { ascending: false });
    
    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      throw reportsError;
    }
    
    console.log("Raw reports data:", reports);
    
    if (!reports || reports.length === 0) {
      console.log("No reports found with matching status");
      return [];
    }
    
    // Fetch all evidence for these reports in a single query
    const reportIds = reports.map(report => report.id);
    const { data: allEvidence, error: evidenceError } = await supabase
      .from('evidence')
      .select('*')
      .in('report_id', reportIds);
    
    if (evidenceError) {
      console.error("Error fetching evidence:", evidenceError);
      // Continue with reports but without evidence
    }
    
    // Fetch all PDFs for these reports in a single query
    const { data: allPdfs, error: pdfsError } = await supabase
      .from('report_pdfs')
      .select('*')
      .in('report_id', reportIds);
    
    if (pdfsError) {
      console.error("Error fetching PDFs:", pdfsError);
      // Continue with reports but without PDFs
    }
    
    // Organize evidence and PDFs by report_id
    const evidenceByReportId: Record<string, any[]> = {};
    const pdfsByReportId: Record<string, any[]> = {};
    
    if (allEvidence && allEvidence.length > 0) {
      allEvidence.forEach(item => {
        if (!evidenceByReportId[item.report_id]) {
          evidenceByReportId[item.report_id] = [];
        }
        evidenceByReportId[item.report_id].push(item);
      });
    }
    
    if (allPdfs && allPdfs.length > 0) {
      allPdfs.forEach(item => {
        if (!pdfsByReportId[item.report_id]) {
          pdfsByReportId[item.report_id] = [];
        }
        pdfsByReportId[item.report_id].push(item);
      });
    }
    
    // Combine data into reports
    const reportsWithRelations = reports.map(report => ({
      ...report,
      evidence: evidenceByReportId[report.id] || [],
      report_pdfs: pdfsByReportId[report.id] || []
    }));
    
    console.log("Reports with evidence:", reportsWithRelations);
    
    // If we still don't have any reports with evidence, add mock evidence
    const reportsWithEvidence = addMockEvidenceToReports(reportsWithRelations);
    
    return reportsWithEvidence;
  } catch (error: any) {
    console.error('Error fetching officer reports:', error);
    throw error;
  }
};

// Update report status by officer
export const updateReportStatus = async (reportId: string, status: string, officerNotes?: string) => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (officerNotes) {
      updateData.officer_notes = officerNotes;
    }
    
    const { data, error } = await supabase
      .from('crime_reports')
      .update(updateData)
      .eq('id', reportId)
      .select();
    
    if (error) {
      throw error;
    }

    // Get the user ID for this report to send notification
    const { data: reportData, error: reportError } = await supabase
      .from('crime_reports')
      .select('user_id')
      .eq('id', reportId)
      .single();
    
    if (!reportError && reportData) {
      // Create user notification
      await supabase
        .from('user_notifications')
        .insert({
          user_id: reportData.user_id,
          report_id: reportId,
          notification_type: 'officer_action',
          is_read: false,
          message: `An officer has updated your report status to: ${status}`
        });
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating report status:', error);
    toast.error(`Failed to update status: ${error.message}`);
    throw error;
  }
};

// Log evidence view to database
export const logEvidenceView = async (evidenceId: string, officerId: string, viewComplete: boolean) => {
  try {
    const { error } = await supabase
      .from('evidence_views')
      .insert({
        evidence_id: evidenceId,
        officer_id: officerId,
        view_complete: viewComplete
      });
      
    if (error) {
      console.error('Error logging evidence view:', error);
    }
  } catch (error) {
    console.error('Failed to log evidence view:', error);
  }
};

// Log PDF download to database
export const logPdfDownload = async (reportId: string, officerId: string, filename: string, success: boolean) => {
  try {
    const { error } = await supabase
      .from('pdf_downloads')
      .insert({
        report_id: reportId,
        officer_id: officerId,
        filename: filename,
        success: success
      });
      
    if (error) {
      console.error('Error logging PDF download:', error);
    }
  } catch (error) {
    console.error('Failed to log PDF download:', error);
  }
};

// Helper function to add watermark to PDF
export const addWatermarkToPdf = (pdf: any, imageUrl: string) => {
  // Add Shield stamp in the center as a watermark
  pdf.addImage(
    imageUrl,
    'PNG',
    pdf.internal.pageSize.width / 2 - 40,
    pdf.internal.pageSize.height / 2 - 40,
    80,
    80
  );
  
  // For the transparent version, we need to use a different approach
  // since setFillOpacity isn't available in all jsPDF versions
  // We'll create a more subtle version by using lighter colors
  const drawParams = pdf.context2d || {};
  if (drawParams.globalAlpha !== undefined) {
    const currentAlpha = drawParams.globalAlpha;
    drawParams.globalAlpha = 0.2;
    
    pdf.addImage(
      imageUrl,
      'PNG',
      pdf.internal.pageSize.width / 2 - 40,
      pdf.internal.pageSize.height / 2 - 40,
      80,
      80
    );
    
    drawParams.globalAlpha = currentAlpha;
  }
};
