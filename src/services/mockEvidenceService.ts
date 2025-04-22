import { v4 as uuidv4 } from 'uuid';

const mockEvidence = [
  { type: 'image', url: 'https://source.unsplash.com/800x600/?crime' },
  { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { type: 'document', url: 'https://www.africau.edu/images/default/sample.pdf' }
];

const generateMockEvidence = () => {
  return mockEvidence.map((item, index) => ({
    id: uuidv4(),
    file_name: `Evidence ${index + 1}`,
    file_type: item.type,
    file_url: item.url,
    created_at: new Date().toISOString()
  }));
};

export const addMockEvidenceToReports = (reports: any[]) => {
  if (!reports || reports.length === 0) {
    console.log("No reports to add mock evidence to");
    
    // Create mock report with evidence for demo purposes
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

  return reports.map(report => {
    // If the report already has evidence, return it unchanged
    if (report.evidence && report.evidence.length > 0) {
      return report;
    }
    
    // Otherwise, add mock evidence
    const mockEvidence = [
      {
        id: `mock-${report.id}-1`,
        report_id: report.id,
        title: "Vehicle Recording",
        description: "Video evidence of the incident",
        type: "video",
        storage_path: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        uploaded_at: new Date().toISOString()
      },
      {
        id: `mock-${report.id}-2`,
        report_id: report.id,
        title: "Incident Photo",
        description: "Photo taken at the scene",
        type: "image",
        storage_path: "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1",
        uploaded_at: new Date().toISOString()
      }
    ];
    
    return {
      ...report,
      evidence: mockEvidence
    };
  });
};
