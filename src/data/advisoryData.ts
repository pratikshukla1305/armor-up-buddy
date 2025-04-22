
export interface Advisory {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  type: 'police' | 'government' | 'emergency';
  severity?: 'low' | 'medium' | 'high';
  issueAuthority?: string;
  expiryDate?: string;
  content?: string;
}

export const advisories: Advisory[] = [
  {
    id: '1',
    title: 'Traffic Restrictions During National Day Parade',
    description: 'Due to the upcoming National Day celebrations, several major roads in the downtown area will be closed from 6 PM to midnight on July 15th. Alternative routes have been arranged and additional public transport services will be available.',
    date: 'July 10, 2023',
    location: 'Central Business District',
    imageUrl: 'https://images.unsplash.com/photo-1567942771224-4d4d5fa2c116?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'police',
    severity: 'medium',
    issueAuthority: 'Metropolitan Police Department',
  },
  {
    id: '2',
    title: 'Public Health Advisory: Heat Wave Warning',
    description: 'The National Weather Service has issued a heat wave warning for the upcoming week with temperatures expected to reach 104°F (40°C). Citizens are advised to stay hydrated, avoid direct sun exposure during peak hours, and check on elderly neighbors.',
    date: 'August 5, 2023',
    location: 'Nationwide',
    imageUrl: 'https://images.unsplash.com/photo-1583797227225-4233106c5a2a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'government',
    severity: 'high',
    issueAuthority: 'Department of Public Health',
  },
  {
    id: '3',
    title: 'Mandatory Evacuation Order: Coastal Flood Risk',
    description: 'Due to the approaching tropical storm and expected storm surge, authorities have issued a mandatory evacuation order for all residents in Zones A and B of the Eastern Coastal District. Evacuation centers have been set up at designated schools and community centers.',
    date: 'September 12, 2023',
    location: 'Eastern Coastal District',
    imageUrl: 'https://images.unsplash.com/photo-1520627977056-c307aeb9a625?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'emergency',
    severity: 'high',
    issueAuthority: 'Emergency Management Agency',
  },
  {
    id: '4',
    title: 'New Cybersecurity Requirements for Businesses',
    description: 'The Department of Digital Security has announced new cybersecurity compliance requirements for all businesses with more than 50 employees. The new regulations will take effect from January 1, 2024, with a grace period of three months for implementation.',
    date: 'October 23, 2023',
    location: 'Nationwide',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'government',
    severity: 'medium',
    issueAuthority: 'Department of Digital Security',
  },
  {
    id: '5',
    title: 'Operation Safe Streets: Increased Police Patrols',
    description: 'In response to the recent increase in street crimes, the Metropolitan Police Department is launching Operation Safe Streets with increased patrols in high-risk areas. Citizens are encouraged to report suspicious activities through the SafeCity app or emergency hotline.',
    date: 'November 8, 2023',
    location: 'Metropolitan Area',
    imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'police',
    severity: 'medium',
    issueAuthority: 'Metropolitan Police Department',
  },
  {
    id: '6',
    title: 'Wildfire Alert: Restricted Access to Forest Reserves',
    description: 'Due to extremely dry conditions and high fire risk, all public access to Northern Forest Reserves is prohibited until further notice. Camping permits have been suspended and ongoing camping activities must be concluded by this weekend.',
    date: 'December 2, 2023',
    location: 'Northern Region',
    imageUrl: 'https://images.unsplash.com/photo-1513031300226-c8fb12de9abe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    type: 'emergency',
    severity: 'high',
    issueAuthority: 'Forest Department',
  },
];
