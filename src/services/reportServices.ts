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
    console.log("Fetching officer reports via edge function...");

    // Prefer edge function (service role) to bypass RLS for officer views
    try {
      const { data: fnRes, error: fnError } = await supabase.functions.invoke('get-officer-reports', {
        body: { limit: 200 },
      });

      if (!fnError && fnRes?.data && Array.isArray(fnRes.data)) {
        console.log("Edge function returned", fnRes.data.length, "reports");
        // Ensure consistent shape with mock enhancer
        return addMockEvidenceToReports(fnRes.data);
      } else if (fnError) {
        console.warn("Edge function get-officer-reports error:", fnError);
      }
    } catch (edgeErr) {
      console.warn("Failed to fetch via edge function, falling back:", edgeErr);
    }
    
    // Fallback: direct client queries (may be limited by RLS)
    let reports: any[] = [];

    const { data: fetchedReports, error: reportsError } = await supabase
      .from('crime_reports')
      .select('*')
      .in('status', ['submitted', 'processing', 'completed'])
      .order('updated_at', { ascending: false });
    
    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      toast.error("Error loading reports. Using sample data instead.");
    } else {
      console.log("Raw reports data:", fetchedReports);
      reports = fetchedReports || [];
    }
    
    if (reports.length === 0) {
      console.log("No reports found with matching status, using mock data");
      const mockReport = {
        id: "mock-report-id-123",
        title: "Mock Traffic Violation Report",
        description: "This is a mock report for demonstration purposes. It shows a vehicle running a red light at an intersection.",
        location: "Main Street & 5th Avenue",
        detailed_location: "Northeast corner of the intersection near the grocery store",
        status: "submitted",
        report_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "mock-user-123",
        evidence: [
          {
            id: "mock-evidence-1",
            report_id: "mock-report-id-123",
            title: "Dashcam Footage",
            description: "Dashcam video showing the incident from my vehicle",
            type: "video",
            storage_path: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            uploaded_at: new Date().toISOString()
          },
          {
            id: "mock-evidence-2",
            report_id: "mock-report-id-123",
            title: "Location Photo",
            description: "Photo of the intersection where the incident occurred",
            type: "image",
            storage_path: "https://images.unsplash.com/photo-1523464862212-d6631d073194",
            uploaded_at: new Date().toISOString()
          }
        ],
        report_pdfs: [
          {
            id: "mock-pdf-1",
            report_id: "mock-report-id-123",
            file_name: "incident_report.pdf",
            file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            is_official: true,
            created_at: new Date().toISOString()
          }
        ]
      };
      
      return [mockReport];
    }
    
    const reportIds = reports.map(report => report.id);
    let allEvidence: any[] = [];
    
    const { data: fetchedEvidence, error: evidenceError } = await supabase
      .from('evidence')
      .select('*')
      .in('report_id', reportIds);
    
    if (evidenceError) {
      console.error("Error fetching evidence:", evidenceError);
      toast.error("Error loading evidence for reports.");
    } else {
      allEvidence = fetchedEvidence || [];
      console.log("Fetched evidence:", allEvidence);
    }
    
    let allPdfs: any[] = [];
    
    const { data: fetchedPdfs, error: pdfsError } = await supabase
      .from('report_pdfs')
      .select('*')
      .in('report_id', reportIds);
    
    if (pdfsError) {
      console.error("Error fetching PDFs:", pdfsError);
      toast.error("Error loading PDFs for reports.");
    } else {
      allPdfs = fetchedPdfs || [];
      console.log("Fetched PDFs:", allPdfs);
    }
    
    const evidenceByReportId: Record<string, any[]> = {};
    const pdfsByReportId: Record<string, any[]> = {};
    
    if (allEvidence.length > 0) {
      allEvidence.forEach(item => {
        if (!evidenceByReportId[item.report_id]) {
          evidenceByReportId[item.report_id] = [];
        }
        evidenceByReportId[item.report_id].push(item);
      });
    }
    
    if (allPdfs.length > 0) {
      allPdfs.forEach(item => {
        if (!pdfsByReportId[item.report_id]) {
          pdfsByReportId[item.report_id] = [];
        }
        pdfsByReportId[item.report_id].push(item);
      });
    }
    
    const reportsWithRelations = reports.map(report => ({
      ...report,
      evidence: evidenceByReportId[report.id] || [],
      report_pdfs: pdfsByReportId[report.id] || []
    }));
    
    console.log("Reports with evidence:", reportsWithRelations);
    
    return addMockEvidenceToReports(reportsWithRelations);
  } catch (error: any) {
    console.error('Error fetching officer reports:', error);
    toast.error("Failed to load reports. Using sample data instead.");
    return addMockEvidenceToReports([]);
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
