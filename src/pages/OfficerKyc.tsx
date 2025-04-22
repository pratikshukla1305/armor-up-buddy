
import React from 'react';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import KycVerificationList from '@/components/officer/KycVerificationList';

const OfficerKyc = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KYC Verifications</h1>
            <p className="text-gray-600">Verify user identity documents and manage KYC submissions</p>
          </div>
        </div>
        
        <KycVerificationList />
      </div>
    </div>
  );
};

export default OfficerKyc;
