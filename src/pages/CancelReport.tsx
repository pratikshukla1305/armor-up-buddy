
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CancelReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Extract report ID from query params
  const searchParams = new URLSearchParams(location.search);
  const reportId = searchParams.get('id');

  const handleCancel = async () => {
    if (!reportId) {
      toast.error("No report ID found");
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete the report from the database
      const { error } = await supabase
        .from('crime_reports')
        .delete()
        .eq('id', reportId);
      
      if (error) throw error;
      
      // Delete any associated evidence
      const { error: evidenceError } = await supabase
        .from('evidence')
        .delete()
        .eq('report_id', reportId);
      
      if (evidenceError) {
        console.error("Error deleting evidence:", evidenceError);
        // Continue with the process even if evidence deletion fails
      }
      
      // Clear any stored images
      sessionStorage.removeItem('uploadedImages');
      
      toast.success("Report cancelled successfully");
      
      // Redirect to home or another appropriate page
      navigate('/');
      
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-24 pb-16">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Cancel Report</h1>
              <p className="text-gray-600">
                Are you sure you want to cancel this report? All progress will be permanently lost.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Warning</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>This action cannot be undone. Report {reportId ? `#${reportId}` : ''} will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Home
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full bg-red-500 hover:bg-red-600 transition-all"
                onClick={handleCancel}
                disabled={isDeleting}
              >
                <X className="mr-2 h-4 w-4" /> {isDeleting ? "Cancelling..." : "Yes, Cancel Report"}
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default CancelReport;
