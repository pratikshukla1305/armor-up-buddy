
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, FilePlus, FileText, Clock, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;

      try {
        setIsLoadingReports(true);
        const { data, error } = await supabase
          .from('crime_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('report_date', { ascending: false })
          .limit(5);

        if (error) throw error;
        setReports(data || []);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReports();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-gradient-light flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Shield className="h-12 w-12 text-stripe-blue animate-pulse" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-page-dashboard">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.user_metadata?.full_name || 'User'}</h1>
            <p className="text-gray-600">
              Manage your reports, evidence, and profile from your dashboard.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="border border-stripe-border shadow-stripe hover:shadow-stripe-hover transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Create New Report</CardTitle>
                <CardDescription>Upload evidence and document incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-12 flex items-center justify-center rounded-lg bg-stripe-blue/10">
                  <FilePlus className="h-6 w-6 text-stripe-blue" />
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-stripe-blue hover:bg-stripe-blue-dark">
                  <Link to="/continue-report">Start New Report</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border border-stripe-border shadow-stripe hover:shadow-stripe-hover transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">My Reports</CardTitle>
                <CardDescription>View and manage your submitted reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-12 flex items-center justify-center rounded-lg bg-green-100">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="stripe-outline" className="w-full">
                  <Link to="/my-reports">View All Reports</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border border-stripe-border shadow-stripe hover:shadow-stripe-hover transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Profile & KYC</CardTitle>
                <CardDescription>Update your profile and verify identity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-12 flex items-center justify-center rounded-lg bg-blue-100">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="stripe-outline" className="w-full">
                  <Link to="/profile">Manage Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Reports</h2>
              <Link to="/my-reports" className="text-stripe-blue hover:underline flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-stripe border border-stripe-border">
              {isLoadingReports ? (
                <div className="p-8 text-center">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-500">Loading reports...</p>
                </div>
              ) : reports.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{report.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(report.report_date).toLocaleDateString()} • 
                            <span className={`ml-2 ${
                              report.status === 'submitted' ? 'text-blue-600' : 
                              report.status === 'processing' ? 'text-orange-600' : 
                              report.status === 'closed' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/view-draft-report?id=${report.id}`}>
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't created any reports yet.</p>
                  <Button asChild className="mt-4 bg-stripe-blue hover:bg-stripe-blue-dark">
                    <Link to="/continue-report">Create Your First Report</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
