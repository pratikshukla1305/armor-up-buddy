
// This file contains mock data for wanted individuals
// In a real application, this would likely come from a backend API

export interface WantedIndividual {
  id: string;
  name: string;
  age: string;
  height: string;
  weight: string;
  photoUrl: string;
  charges: string;
  dangerLevel: 'Low' | 'Medium' | 'High';
  lastKnownLocation: string;
  caseNumber: string;
  description?: string;
}

// Initial data
let wantedIndividualsData: WantedIndividual[] = [
  {
    id: '1',
    name: 'Dwiz Bharadwaj',
    age: '35',
    height: '6\'2"',
    weight: '190 lbs',
    photoUrl: 'https://unsplash.com/photos/smiling-man-standing-near-green-trees-VVEwJJRRHgk',
    charges: 'Armed Robbery, Assault with a Deadly Weapon',
    dangerLevel: 'High',
    lastKnownLocation: 'Kattankulathur',
    caseNumber: 'CR-2023-00145',
    description: 'Suspect in multiple armed robberies of convenience stores. Known to be armed and dangerous.'
  },
  {
    id: '2',
    name: 'Vishal',
    age: '28',
    height: '5\'7"',
    weight: '135 lbs',
    photoUrl: 'https://unsplash.com/photos/man-in-maroon-dress-shirt-lying-on-green-grass-field-eq6EJSdpHUQ',
    charges: 'Assault',
    dangerLevel: 'Medium',
    lastKnownLocation: 'Potheri',
    caseNumber: 'CR-2023-00187',
    description: 'High Risk no right to live.'
  },
  {
    id: '3',
    name: 'Sittul Mishra',
    age: '42',
    height: '5\'10"',
    weight: '210 lbs',
    photoUrl: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Frandom-people&psig=AOvVaw3nVJTIdPiMyp4k55vX3fWP&ust=1745343807515000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIDWi8DW6YwDFQAAAAAdAAAAABAI',
    charges: 'Abuse',
    dangerLevel: 'Medium',
    lastKnownLocation: 'M block',
    caseNumber: 'CR-2023-00219',
    description: 'Abuse everyone in her surrounding.'
  },
  /*{
    id: '4',
    name: '',
    age: '31',
    height: '6\'0"',
    weight: '180 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    charges: 'Burglary, Possession of Stolen Property',
    dangerLevel: 'Low',
    lastKnownLocation: 'North Suburbs',
    caseNumber: 'CR-2023-00254',
    description: 'Suspected in a series of residential burglaries targeting unoccupied homes.'
  },
  {
    id: '5',
    name: 'Sarah Davis',
    age: '26',
    height: '5\'5"',
    weight: '120 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
    charges: 'Fraud, Embezzlement',
    dangerLevel: 'Low',
    lastKnownLocation: 'Financial District',
    caseNumber: 'CR-2023-00278',
    description: 'Wanted for corporate embezzlement and financial fraud schemes.'
  },
  {
    id: '6',
    name: 'David Brown',
    age: '38',
    height: '5\'11"',
    weight: '195 lbs',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
    charges: 'Assault, Criminal Threats',
    dangerLevel: 'High',
    lastKnownLocation: 'West End Neighborhood',
    caseNumber: 'CR-2023-00312',
    description: 'Has a history of violence and should not be approached by the public.'
  }*/
];

// Getter for the wanted individuals data
export const getWantedIndividuals = (): WantedIndividual[] => {
  return [...wantedIndividualsData];
};

// Setter for the wanted individuals data
export const updateWantedIndividuals = (newData: WantedIndividual[]): void => {
  wantedIndividualsData = [...newData];
};

// Function to add a new wanted individual
export const addWantedIndividual = (individual: WantedIndividual): void => {
  wantedIndividualsData = [...wantedIndividualsData, individual];
};

// Function to update an existing wanted individual
export const updateWantedIndividual = (individual: WantedIndividual): void => {
  wantedIndividualsData = wantedIndividualsData.map(item => 
    item.id === individual.id ? individual : item
  );
};

// Function to delete a wanted individual
export const deleteWantedIndividual = (id: string): void => {
  wantedIndividualsData = wantedIndividualsData.filter(individual => individual.id !== id);
};

// Export the current data for backward compatibility
export const wantedIndividuals = getWantedIndividuals();
