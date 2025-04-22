
import React, { useState } from 'react';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import ReportsList from '@/components/officer/ReportsList';
import { toast } from 'sonner';

const OfficerReports = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
            <p className="text-gray-600">Review and manage user submitted reports and evidence</p>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => {
              setIsLoading(true);
              // Simulate refresh
              setTimeout(() => {
                toast.success("Reports refreshed");
                window.location.reload();
                setIsLoading(false);
              }, 500);
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Reports'}
          </button>
        </div>
        
        <ReportsList />
      </div>
    </div>
  );
};

export default OfficerReports;
