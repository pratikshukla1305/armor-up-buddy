
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

export const addMockEvidenceToReports = (reports) => {
  return reports.map(report => {
    // Only add mock evidence if there's no evidence and it's NOT a self-report
    if (report.evidence.length === 0 && !report.is_anonymous && report.title !== 'Self Report') {
      return {
        ...report,
        evidence: generateMockEvidence()
      };
    }
    return report;
  });
};
