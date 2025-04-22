
export interface CaseDensityData {
  id: string;
  region: string;
  timestamp?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  description?: string;
  caseType?: string; // Will be used in place of 'type'
  caseNumber?: string;
  status?: string;
  reporterId?: string;
  count: number;
  type?: string; // Add this to align with the existing filters in CaseHeatmap
}

export const caseDensityData: CaseDensityData[] = [
  {
    id: 'case-001',
    region: 'Chennai Urban',
    location: {
      address: 'Central Business District',
      lat: 40.712775,
      lng: -74.005973
    },
    description: 'Multiple reports of pickpocketing in crowded areas',
    caseType: 'theft',
    type: 'theft', // Adding this for consistency with the filters
    caseNumber: 'TH-2023-0142',
    status: 'investigating',
    timestamp: new Date('2023-05-15').toISOString(),
    count: 23
  },
  {
    id: 'case-002',
    region: 'North Side',
    location: {
      address: 'Residential Area',
      lat: 40.753060,
      lng: -73.983883
    },
    description: 'Residential break-ins reported in the last month',
    caseType: 'burglary',
    type: 'burglary',
    caseNumber: 'BG-2023-0089',
    status: 'open',
    timestamp: new Date('2023-05-20').toISOString(),
    count: 12
  },
  {
    id: 'case-003',
    region: 'West End',
    location: {
      address: 'Shopping Mall',
      lat: 40.758896,
      lng: -73.985130
    },
    description: 'Vehicle vandalism in parking garages',
    caseType: 'vandalism',
    type: 'vandalism',
    caseNumber: 'VD-2023-0117',
    status: 'investigating',
    timestamp: new Date('2023-05-18').toISOString(),
    count: 8
  },
  {
    id: 'case-004',
    region: 'East Side',
    location: {
      address: 'Financial District',
      lat: 40.703812,
      lng: -74.012166
    },
    description: 'Credit card skimming at ATMs',
    caseType: 'fraud',
    type: 'fraud',
    caseNumber: 'FR-2023-0201',
    status: 'investigating',
    timestamp: new Date('2023-05-14').toISOString(),
    count: 14
  },
  {
    id: 'case-005',
    region: 'South End',
    location: {
      address: 'Entertainment District',
      lat: 40.741895,
      lng: -73.989308
    },
    description: 'Multiple assault reports in nightlife areas',
    caseType: 'assault',
    type: 'assault',
    caseNumber: 'AS-2023-0078',
    status: 'investigating',
    timestamp: new Date('2023-05-21').toISOString(),
    count: 17
  },
  {
    id: 'case-006',
    region: 'Central Park',
    location: {
      address: 'Park Area',
      lat: 40.781327,
      lng: -73.966246
    },
    description: 'Phone thefts from joggers',
    caseType: 'theft',
    type: 'theft',
    caseNumber: 'TH-2023-0158',
    status: 'resolved',
    timestamp: new Date('2023-05-10').toISOString(),
    count: 9
  }
];

