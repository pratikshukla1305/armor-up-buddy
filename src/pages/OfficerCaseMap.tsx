
import React from 'react';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import OfficerCaseMapComponent from '@/components/officer/OfficerCaseMap';

const OfficerCaseMap = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case Map</h1>
            <p className="text-gray-600">View geographical distribution of crime reports and incidents</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <OfficerCaseMapComponent />
        </div>
      </div>
    </div>
  );
};

export default OfficerCaseMap;
