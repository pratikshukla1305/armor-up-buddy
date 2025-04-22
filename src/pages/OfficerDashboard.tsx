import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, UserCheck, FileWarning, Bell, AlertTriangle, Users, 
  Map, PlusCircle, FileText, MessageSquare 
} from 'lucide-react';
import SOSAlertsList from '@/components/officer/SOSAlertsList';
import KycVerificationList from '@/components/officer/KycVerificationList';
import OfficerCriminalPanel from '@/components/officer/OfficerCriminalPanel';
import OfficerCaseMap from '@/components/officer/OfficerCaseMap';
import ReportsList from '@/components/officer/ReportsList';
import EvidenceRequestForm from '@/components/officer/EvidenceRequestForm';
import EvidenceRequestsList from '@/components/officer/EvidenceRequestsList';
import { getOfficerReports } from '@/services/reportServices';
import { getSosAlerts, getKycVerifications } from '@/services/officerServices';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const OfficerDashboard = () => {
  const { officer, isAuthenticated } = useOfficerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('alerts');
  const [alertsCount, setAlertsCount] = useState({ total: 0, highPriority: 0 });
  const [kycCount, setKycCount] = useState({ total: 0, lastUpdated: '' });
  const [reportsCount, setReportsCount] = useState({ total: 0, todaySubmissions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [newCaseDialogOpen, setNewCaseDialogOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    crime_type: 'theft',
    address: ''
  });
  const [isSubmittingCase, setIsSubmittingCase] = useState(false);
  
  // Add new state for evidence requests
  const [activeEvidenceTab, setActiveEvidenceTab] = useState('list');
  const [evidenceRequestsCount, setEvidenceRequestsCount] = useState({ total: 0, newResponses: 0 });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/officer-login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        
        const alertsData = await getSosAlerts();
        const highPriorityAlerts = alertsData.filter(alert => 
          alert.urgency_level?.toLowerCase() === 'high' && 
          alert.status?.toLowerCase() !== 'resolved').length;
        setAlertsCount({
          total: alertsData.filter(alert => alert.status?.toLowerCase() !== 'resolved').length,
          highPriority: highPriorityAlerts
        });

        const kycData = await getKycVerifications();
        const pendingKyc = kycData.filter(kyc => 
          kyc.status?.toLowerCase() === 'pending').length;
        
        let lastUpdated = 'N/A';
        if (kycData.length > 0) {
          const mostRecent = new Date(Math.max(...kycData.map(k => new Date(k.submission_date).getTime())));
          const now = new Date();
          const diffMs = now.getTime() - mostRecent.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          
          if (diffHrs < 1) {
            lastUpdated = 'Just now';
          } else if (diffHrs === 1) {
            lastUpdated = '1 hour ago';
          } else if (diffHrs < 24) {
            lastUpdated = `${diffHrs} hours ago`;
          } else {
            const diffDays = Math.floor(diffHrs / 24);
            lastUpdated = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          }
        }
        
        setKycCount({
          total: pendingKyc,
          lastUpdated
        });

        const reportsData = await getOfficerReports();
        
        const today = new Date().toISOString().split('T')[0];
        const todaySubmissions = reportsData.filter(report => {
          const reportDate = new Date(report.report_date).toISOString().split('T')[0];
          return reportDate === today && report.status?.toLowerCase() === 'submitted';
        }).length;

        const activeReports = reportsData.filter(report => 
          report.status?.toLowerCase() !== 'completed').length;

        setReportsCount({
          total: activeReports,
          todaySubmissions
        });
        
        // Mock evidence requests count (would be a real Supabase query in production)
        setEvidenceRequestsCount({
          total: 3,
          newResponses: 4
        });
        
      } catch (error) {
        console.error("Error fetching counts:", error);
        toast.error("Error fetching dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
    
    const intervalId = setInterval(fetchCounts, 3 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
  };
  
  const handleNewCaseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCase({ ...newCase, [name]: value });
  };
  
  const handleCrimeTypeChange = (value: string) => {
    setNewCase({ ...newCase, crime_type: value });
  };
  
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewCase({
            ...newCase,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
          toast.success("Current location detected");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not detect location. Please enter coordinates manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };
  
  const handleSubmitNewCase = async () => {
    if (!newCase.title || !newCase.latitude || !newCase.longitude || !newCase.crime_type) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmittingCase(true);
    
    try {
      const caseNumber = `CASE-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const today = new Date();
      
      // Insert into cases table first to get the case_id
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert([{
          case_number: caseNumber,
          description: newCase.description,
          status: 'open',
          reporter_id: officer?.id?.toString() || null,
          region: "Default Region",
          case_date: today.toISOString().split('T')[0],
          case_time: today.toTimeString().split(' ')[0],
          case_type: newCase.crime_type,
          address: newCase.address || "Unknown Address",
          latitude: parseFloat(newCase.latitude),
          longitude: parseFloat(newCase.longitude)
        }])
        .select();
      
      if (caseError) throw caseError;
      
      if (caseData && caseData.length > 0) {
        // Then insert into crime_map_locations table with the case_id
        const { error: locationError } = await supabase
          .from('crime_map_locations')
          .insert([{
            case_id: caseData[0].case_id,
            latitude: parseFloat(newCase.latitude),
            longitude: parseFloat(newCase.longitude),
            title: newCase.title,
            description: newCase.description,
            crime_type: newCase.crime_type
          }]);
        
        if (locationError) throw locationError;
        
        toast.success("New case added successfully");
        setNewCaseDialogOpen(false);
        
        setNewCase({
          title: '',
          description: '',
          latitude: '',
          longitude: '',
          crime_type: 'theft',
          address: ''
        });
        
        if (activeTab === 'map') {
          handleTabChange('map');
        }
      }
    } catch (error) {
      console.error("Error adding new case:", error);
      toast.error("Failed to add new case");
    } finally {
      setIsSubmittingCase(false);
    }
  };

  return (
    <div className="min-h-screen stripe-dashboard-bg">
      <OfficerNavbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stripe-slate">Officer Dashboard</h1>
          <p className="text-stripe-slate-light">
            Welcome back, Officer {officer?.full_name || ''}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="stripe-dashboard-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-stripe-slate">
                <AlertTriangle className="mr-2 h-5 w-5 text-stripe-coral" />
                Alerts
              </CardTitle>
              <CardDescription>
                Handle emergency SOS alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-stripe-gray rounded"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-stripe-slate">{alertsCount.total}</p>
                  <p className="text-sm text-stripe-coral">
                    {alertsCount.highPriority > 0 ? `${alertsCount.highPriority} high priority` : 'No high priority alerts'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="stripe-dashboard-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-stripe-slate">
                <FileText className="mr-2 h-5 w-5 text-[#0D2644]" />
                Reports
              </CardTitle>
              <CardDescription>
                Citizen-submitted reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-stripe-gray rounded"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-stripe-slate">{reportsCount.total}</p>
                  <p className="text-sm text-stripe-slate-light">
                    {reportsCount.todaySubmissions > 0 ? `${reportsCount.todaySubmissions} submitted today` : 'No submissions today'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="stripe-dashboard-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-stripe-slate">
                <MessageSquare className="mr-2 h-5 w-5 text-[#0D2644]" />
                Evidence Requests
              </CardTitle>
              <CardDescription>
                Public requests for evidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-stripe-gray rounded"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-stripe-slate">{evidenceRequestsCount.total}</p>
                  <p className="text-sm text-[#0D2644]">
                    {evidenceRequestsCount.newResponses > 0 ? `${evidenceRequestsCount.newResponses} new responses` : 'No new responses'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="stripe-dashboard-card overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-stripe-slate">
                <UserCheck className="mr-2 h-5 w-5 text-green-600" />
                KYC Verifications
              </CardTitle>
              <CardDescription>
                Pending verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-stripe-gray rounded"></div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-stripe-slate">{kycCount.total}</p>
                  <p className="text-sm text-stripe-slate-light">Last updated {kycCount.lastUpdated}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="w-full max-w-md grid grid-cols-6 bg-stripe-gray rounded-full p-1">
            <TabsTrigger value="alerts" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-stripe-slate data-[state=active]:shadow-sm">SOS Alerts</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-stripe-slate data-[state=active]:shadow-sm">Reports</TabsTrigger>
            <TabsTrigger value="evidence" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-stripe-slate data-[state=active]:shadow-sm">Evidence</TabsTrigger>
            <TabsTrigger value="kyc" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-stripe-slate data-[state=active]:shadow-sm">KYC</TabsTrigger>
            <TabsTrigger value="criminals" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-stripe-slate data-[state=active]:shadow-sm">Criminals</TabsTrigger>
            <TabsTrigger value="map" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-stripe-slate data-[state=active]:shadow-sm">Map</TabsTrigger>
          </TabsList>
          
          <div className="pt-6">
            <TabsContent value="alerts">
              <Card className="stripe-dashboard-card border-0 shadow-stripe-card">
                <CardHeader>
                  <CardTitle className="text-stripe-slate">Recent SOS Alerts</CardTitle>
                  <CardDescription>
                    Manage and respond to emergency alerts from citizens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SOSAlertsList limit={5} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card className="stripe-dashboard-card border-0 shadow-stripe-card">
                <CardHeader>
                  <CardTitle className="text-stripe-slate">Citizen Reports</CardTitle>
                  <CardDescription>
                    Review and process reports submitted by citizens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportsList limit={10} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="evidence">
              <Card className="stripe-dashboard-card border-0 shadow-stripe-card">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <CardTitle className="text-stripe-slate">Evidence Requests</CardTitle>
                    <CardDescription>
                      Request evidence from citizens for ongoing investigations
                    </CardDescription>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Tabs value={activeEvidenceTab} onValueChange={setActiveEvidenceTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="list">Requests</TabsTrigger>
                        <TabsTrigger value="create">Create New</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeEvidenceTab === 'list' ? (
                    <EvidenceRequestsList limit={5} />
                  ) : (
                    <EvidenceRequestForm />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="kyc">
              <Card className="stripe-dashboard-card border-0 shadow-stripe-card">
                <CardHeader>
                  <CardTitle className="text-stripe-slate">KYC Verifications</CardTitle>
                  <CardDescription>
                    Review and approve user identity verification requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KycVerificationList limit={5} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="criminals">
              <Card className="stripe-dashboard-card border-0 shadow-stripe-card">
                <CardHeader>
                  <CardTitle className="text-stripe-slate">Criminal Profiles</CardTitle>
                  <CardDescription>
                    Manage wanted criminal profiles and tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OfficerCriminalPanel />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="map">
              <Card className="stripe-dashboard-card border-0 shadow-stripe-card overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <CardTitle className="text-stripe-slate">Crime Map</CardTitle>
                    <CardDescription>
                      View geographical distribution of crime reports
                    </CardDescription>
                  </div>
                  <Button 
                    className="mt-2 sm:mt-0 bg-[#0D2644] hover:bg-[#0D2644]/90 rounded-full"
                    onClick={() => setNewCaseDialogOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Case
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px]">
                    <OfficerCaseMap />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <Dialog open={newCaseDialogOpen} onOpenChange={setNewCaseDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-stripe-slate text-xl">Add New Case to Crime Map</DialogTitle>
            <DialogDescription>
              Enter the details of the crime case to add it to the map.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                name="title"
                value={newCase.title}
                onChange={handleNewCaseInputChange}
                placeholder="Enter case title"
                required
                className="stripe-input"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newCase.description}
                onChange={handleNewCaseInputChange}
                placeholder="Enter case description"
                className="min-h-[100px] rounded-lg border border-stripe-border px-4 py-3 focus:ring-2 focus:ring-stripe-purple focus:border-transparent transition-colors duration-200"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="crimeType">Crime Type *</Label>
              <Select 
                value={newCase.crime_type} 
                onValueChange={handleCrimeTypeChange}
              >
                <SelectTrigger className="h-11 rounded-lg border border-stripe-border">
                  <SelectValue placeholder="Select crime type" />
                </SelectTrigger>
                <SelectContent className="border border-stripe-border rounded-lg shadow-stripe-dropdown">
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="burglary">Burglary</SelectItem>
                  <SelectItem value="robbery">Robbery</SelectItem>
                  <SelectItem value="vandalism">Vandalism</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="drug_related">Drug Related</SelectItem>
                  <SelectItem value="homicide">Homicide</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  value={newCase.latitude}
                  onChange={handleNewCaseInputChange}
                  placeholder="Enter latitude"
                  required
                  className="stripe-input"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  onChange={handleNewCaseInputChange}
                  value={newCase.longitude}
                  placeholder="Enter longitude"
                  required
                  className="stripe-input"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="stripe-outline" 
                onClick={getCurrentLocation}
                type="button"
                className="rounded-full"
              >
                Get Current Location
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                name="address"
                value={newCase.address}
                onChange={handleNewCaseInputChange}
                placeholder="Enter address"
                className="stripe-input"
              />
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="stripe-outline" onClick={() => setNewCaseDialogOpen(false)} className="rounded-full">Cancel</Button>
            <Button 
              onClick={handleSubmitNewCase}
              disabled={isSubmittingCase}
              className="bg-stripe-purple hover:bg-stripe-purple-light rounded-full"
            >
              {isSubmittingCase ? "Adding..." : "Add to Map"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficerDashboard;
