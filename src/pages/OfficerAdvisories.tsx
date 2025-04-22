
import React from 'react';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import OfficerAdvisoryPanel from '@/components/officer/OfficerAdvisoryPanel';

const OfficerAdvisories = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advisories Management</h1>
            <p className="text-gray-600">Create and manage public safety advisories and notifications</p>
          </div>
        </div>
        
        <OfficerAdvisoryPanel />
      </div>
    </div>
  );
};

export default OfficerAdvisories;
