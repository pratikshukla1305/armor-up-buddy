import React, { useState } from 'react';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import KycVerificationList from '@/components/officer/KycVerificationList';
import SOSAlertsList from '@/components/officer/SOSAlertsList';
import OfficerCriminalPanel from '@/components/officer/OfficerCriminalPanel';
import { useOfficerAuth } from '@/contexts/OfficerAuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import EvidenceViewer from '@/components/officer/EvidenceViewer';

const OfficerDashboard = () => {
  const { officer, isAuthenticated, isLoading } = useOfficerAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/officer-login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-shield-blue" />
      </div>
    );
  }

  const OverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>Number of registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">3,457</div>
          <p className="text-sm text-gray-500">+20% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reports Filed</CardTitle>
          <CardDescription>Total number of crime reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">1,234</div>
          <p className="text-sm text-gray-500">+15% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Number of SOS alerts pending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">45</div>
          <p className="text-sm text-gray-500">-5% from last month</p>
        </CardContent>
      </Card>
    </div>
  );

  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage common tasks quickly</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button>Create New Report</Button>
        <Button>Review Pending Alerts</Button>
        <Button>Access User Database</Button>
        <Button>Manage Criminal Profiles</Button>
      </CardContent>
    </Card>
  );

  const RecentActivity = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and actions</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-none space-y-4">
          <li>
            <p className="text-sm font-medium">New user registered</p>
            <p className="text-xs text-gray-500">5 minutes ago</p>
          </li>
          <li>
            <p className="text-sm font-medium">Report #1234 filed</p>
            <p className="text-xs text-gray-500">30 minutes ago</p>
          </li>
          <li>
            <p className="text-sm font-medium">SOS alert received</p>
            <p className="text-xs text-gray-500">1 hour ago</p>
          </li>
        </ul>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stripe-blue-dark">Officer Dashboard</h1>
            <p className="text-gray-600">Welcome back, Officer {officer?.full_name}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => navigate('/officer-user-profiles')}>
              View User Profiles
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="criminals">Criminals</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-8">
              <OverviewCards />
              <QuickActions />
              <RecentActivity />
            </div>
          </TabsContent>
          
          <TabsContent value="requests">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>KYC Verification Requests</CardTitle>
                  <CardDescription>
                    Review and approve identity verification requests from users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KycVerificationList />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>SOS Emergency Alerts</CardTitle>
                  <CardDescription>
                    Monitor and respond to emergency SOS alerts from citizens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SOSAlertsList />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="criminals">
            <Card>
              <CardHeader>
                <CardTitle>Criminal Database</CardTitle>
                <CardDescription>
                  Manage wanted individuals and criminal profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OfficerCriminalPanel />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Repository</CardTitle>
                <CardDescription>
                  View and analyze evidence submitted through reports and requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvidenceViewer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OfficerDashboard;
