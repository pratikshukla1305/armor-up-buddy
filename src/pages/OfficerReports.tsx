
import React, { useState, useEffect } from 'react';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import ReportsList from '@/components/officer/ReportsList';
import { toast } from 'sonner';
import { Loader2, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import { useNavigate } from 'react-router-dom';

const OfficerReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { officer, isAuthenticated, isLoading: authLoading } = useOfficerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    if (!authLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      toast.error("Please log in to access the officer portal");
      navigate("/officer-login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Update the last refresh timestamp
    setLastRefresh(new Date());
    
    // Simulate refresh with a small delay
    setTimeout(() => {
      toast.success("Reports refreshed successfully");
      setIsLoading(false);
    }, 800);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading officer portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access the officer portal.</p>
          <Button 
            onClick={() => navigate("/officer-login")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
            <p className="text-gray-600">Review and manage user submitted reports and evidence</p>
            <p className="text-xs text-gray-500 mt-1">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <Button 
            className="flex items-center gap-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" />
                <span>Refresh Reports</span>
              </>
            )}
          </Button>
        </div>
        
        <ReportsList key={lastRefresh.getTime()} />
      </div>
    </div>
  );
};

export default OfficerReports;
