
import React, { useState, useEffect } from 'react';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import ReportsList from '@/components/officer/ReportsList';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getOfficerReports } from '@/services/reportServices';

const OfficerReports = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const reports = await getOfficerReports();
        setReportCount(reports.length);
        console.log(`Found ${reports.length} reports`);
      } catch (error) {
        console.error("Error checking connection:", error);
        setHasError(true);
        toast.error("Failed to connect to the database. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, [refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.info("Refreshing reports list...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
            <p className="text-gray-600">
              Review and manage user submitted reports and evidence
              {reportCount > 0 && ` (${reportCount} reports found)`}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="text-sm text-red-700 mt-1">
                  Unable to connect to the database. This could be due to:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 mt-1 space-y-1">
                  <li>Network connectivity issues</li>
                  <li>Missing environment variables in your Vercel deployment</li>
                  <li>Supabase service disruption</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <ReportsList key={refreshKey} />
      </div>
    </div>
  );
};

export default OfficerReports;
