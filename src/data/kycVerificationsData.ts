// This file acts as a shared data store for KYC verifications between officer and user portals

// Define the KYC verification status type
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'none';

// Define the KYC verification type
export interface KycVerification {
  id: string;
  userId: string;
  name: string;
  email: string;
  document: string;
  photo: string;
  status: VerificationStatus;
  submissionDate: string;
  reviewDate?: string;
  reviewedBy?: string;
}

// Initial verifications data
let kycVerifications: KycVerification[] = [
  {
    id: "kyc-001",
    userId: "user-123",
    name: "James Wilson",
    email: "james.wilson@example.com",
    document: "https://images.unsplash.com/photo-1609743522653-52354461eb27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
    status: "pending",
    submissionDate: "2023-09-15T10:30:00Z"
  },
  {
    id: "kyc-002",
    userId: "user-456",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    document: "https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
    status: "pending",
    submissionDate: "2023-09-16T14:45:00Z"
  },
  {
    id: "kyc-003",
    userId: "user-789",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    document: "https://images.unsplash.com/photo-1580824456266-c578ed421d08?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
    status: "pending",
    submissionDate: "2023-09-18T09:15:00Z"
  }
];

// Get all KYC verifications
export const getAllKycVerifications = (): KycVerification[] => {
  return [...kycVerifications];
};

// Get KYC verification by ID
export const getKycVerificationById = (id: string): KycVerification | undefined => {
  return kycVerifications.find(verification => verification.id === id);
};

// Get KYC verification by user ID
export const getKycVerificationByUserId = (userId: string): KycVerification | undefined => {
  return kycVerifications.find(verification => verification.userId === userId);
};

// Update KYC verification status
export const updateKycVerificationStatus = (
  id: string, 
  status: VerificationStatus, 
  reviewedBy?: string
): KycVerification | null => {
  const index = kycVerifications.findIndex(verification => verification.id === id);
  
  if (index === -1) return null;
  
  const updatedVerification = {
    ...kycVerifications[index],
    status,
    reviewDate: new Date().toISOString(),
    reviewedBy: reviewedBy || kycVerifications[index].reviewedBy
  };
  
  kycVerifications[index] = updatedVerification;
  return updatedVerification;
};

// Add a new KYC verification
export const addKycVerification = (verification: Omit<KycVerification, 'id'>): KycVerification => {
  const newVerification = {
    id: `kyc-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    ...verification
  };
  
  kycVerifications.unshift(newVerification);
  return newVerification;
};

// For demo/testing: Get the verification status for a specific user
export const getUserVerificationStatus = (userId: string): VerificationStatus | 'none' => {
  const verification = kycVerifications.find(v => v.userId === userId);
  return verification ? verification.status : 'none';
};

// For demo/testing: Reset verification data
export const resetKycVerifications = (): void => {
  kycVerifications = [
    {
      id: "kyc-001",
      userId: "user-123",
      name: "James Wilson",
      email: "james.wilson@example.com",
      document: "https://images.unsplash.com/photo-1609743522653-52354461eb27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      status: "pending",
      submissionDate: "2023-09-15T10:30:00Z"
    },
    {
      id: "kyc-002",
      userId: "user-456",
      name: "Emma Thompson",
      email: "emma.thompson@example.com",
      document: "https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      status: "pending",
      submissionDate: "2023-09-16T14:45:00Z"
    },
    {
      id: "kyc-003",
      userId: "user-789",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      document: "https://images.unsplash.com/photo-1580824456266-c578ed421d08?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=250&q=80",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80",
      status: "pending",
      submissionDate: "2023-09-18T09:15:00Z"
    }
  ];
};
