import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerNavbar from '@/components/officer/OfficerNavbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Filter, User, FileCheck, FileX, AlertCircle, Shield, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OfficerUserProfiles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch actual user profiles from the database
  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        setLoading(true);
        
        // Get profiles and join with associated reports and KYC verifications
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) throw profilesError;

        // Fetch reports for each user
        const enhancedProfiles = await Promise.all(
          (profiles || []).map(async (profile) => {
            // Get reports count
            const { data: reports, error: reportsError } = await supabase
              .from('crime_reports')
              .select('id, status')
              .eq('user_id', profile.id);

            if (reportsError) console.error('Error fetching reports:', reportsError);

            // Get alerts count - explicitly request the status field
            const { data: alerts, error: alertsError } = await supabase
              .from('sos_alerts')
              .select('alert_id, status')  // Explicitly include status field
              .eq('reported_by', profile.id);

            if (alertsError) console.error('Error fetching alerts:', alertsError);

            // Get KYC status
            const { data: kyc, error: kycError } = await supabase
              .from('kyc_verifications')
              .select('status')
              .eq('user_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (kycError && kycError.code !== 'PGRST116') {
              console.error('Error fetching KYC:', kycError);
            }

            const approvedReports = reports?.filter(r => r.status === 'approved')?.length || 0;
            const rejectedReports = reports?.filter(r => r.status === 'rejected')?.length || 0;
            
            // Safely access the status property on alerts items
            const confirmedAlerts = alerts?.filter(a => a?.status === 'confirmed')?.length || 0;

            return {
              ...profile,
              reports_submitted: reports?.length || 0,
              reports_approved: approvedReports,
              reports_rejected: rejectedReports,
              alerts_submitted: alerts?.length || 0,
              alerts_confirmed: confirmedAlerts,
              kyc_verified: kyc?.status === 'Approved',
              last_active: profile.updated_at || profile.created_at,
            };
          })
        );
        
        setUserProfiles(enhancedProfiles);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
        toast.error('Failed to load user profiles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfiles();
  }, []);

  const selectedUser = userProfiles.find(user => user.id === selectedUserId);

  // Filter users based on search term
  const filteredUsers = userProfiles.filter(user => 
    (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Update the color theme in JSX elements to match navbar - Just some examples
  // Replace any instances of colors with stripe-blue-dark
  return (
    <div className="min-h-screen bg-gray-50">
      <OfficerNavbar />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stripe-blue-dark">User Profiles</h1>
            <p className="text-gray-600">View and manage user accounts, reports, and verification status</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User list sidebar */}
          <Card className="lg:col-span-1 shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium">
                  {filteredUsers.length} Users
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[calc(100vh-300px)] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-stripe-blue-dark border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-gray-50' : ''}`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback className="bg-stripe-blue-dark text-white">
                            {user.full_name?.split(' ').map(name => name[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || 'Anonymous User'}</p>
                            {user.kyc_verified ? (
                              <Badge className="ml-2 bg-green-500">Verified</Badge>
                            ) : (
                              <Badge className="ml-2 bg-[#FEF7CD] text-amber-700">Pending</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <div className="flex items-center mt-1 gap-3">
                            <span className="flex items-center text-xs text-gray-500">
                              <FileCheck className="h-3 w-3 mr-1 text-green-500" />
                              {user.reports_approved}
                            </span>
                            <span className="flex items-center text-xs text-gray-500">
                              <FileX className="h-3 w-3 mr-1 text-[#ea384c]" />
                              {user.reports_rejected}
                            </span>
                            <span className="flex items-center text-xs text-gray-500">
                              <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                              {user.alerts_submitted}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* User detail panel */}
          {selectedUser ? (
            <Card className="lg:col-span-2 shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarFallback className="bg-stripe-blue-dark text-white text-xl">
                      {selectedUser.full_name?.split(' ').map(name => name[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedUser.full_name || 'Anonymous User'}</CardTitle>
                    <CardDescription>{selectedUser.email}</CardDescription>
                    <div className="flex gap-2 mt-2">
                      {selectedUser.kyc_verified ? (
                        <Badge className="bg-green-500">KYC Verified</Badge>
                      ) : (
                        <Badge className="bg-[#FEF7CD] text-amber-700">KYC Pending</Badge>
                      )}
                      <Badge variant="secondary">
                        Last active: {new Date(selectedUser.last_active).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="verification">Verification</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Total Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedUser.reports_submitted}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedUser.reports_approved} approved · {selectedUser.reports_rejected} rejected
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Alerts Submitted</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedUser.alerts_submitted}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedUser.alerts_confirmed} confirmed
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">KYC Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {selectedUser.kyc_verified ? 'Verified' : 'Pending'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedUser.kyc_verified ? 'Verified user account' : 'Verification in progress'}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedUser.reports_submitted === 0 && selectedUser.alerts_submitted === 0 ? (
                          <div className="text-center py-6">
                            <div className="rounded-full w-12 h-12 bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No activity to display</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedUser.reports_submitted > 0 && (
                              <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FileCheck className="h-4 w-4 text-stripe-blue-dark" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Submitted a report</p>
                                  <p className="text-xs text-gray-500">Recently</p>
                                </div>
                              </div>
                            )}
                            
                            {selectedUser.kyc_verified && (
                              <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <Shield className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Completed KYC verification</p>
                                  <p className="text-xs text-gray-500">Recently</p>
                                </div>
                              </div>
                            )}
                            
                            {selectedUser.alerts_submitted > 0 && (
                              <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Submitted an alert</p>
                                  <p className="text-xs text-gray-500">Recently</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reports">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-medium">Reports History</h3>
                        <Badge variant="outline">{selectedUser.reports_submitted} Total</Badge>
                      </div>
                      
                      {selectedUser.reports_submitted === 0 ? (
                        <div className="border rounded-md p-8 text-center">
                          <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No reports submitted yet</p>
                        </div>
                      ) : (
                        <div className="border rounded-md divide-y">
                          {/* We would fetch and map real reports here */}
                          <div className="p-8 text-center">
                            <p className="text-sm text-gray-500">Report details would be shown here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="alerts">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-medium">Alert History</h3>
                        <Badge variant="outline">{selectedUser.alerts_submitted} Total</Badge>
                      </div>
                      
                      {selectedUser.alerts_submitted === 0 ? (
                        <div className="border rounded-md p-8 text-center">
                          <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No alerts submitted yet</p>
                        </div>
                      ) : (
                        <div className="border rounded-md divide-y">
                          {/* We would fetch and map real alerts here */}
                          <div className="p-8 text-center">
                            <p className="text-sm text-gray-500">Alert details would be shown here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="verification">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-medium">KYC Verification</h3>
                        {selectedUser.kyc_verified ? (
                          <Badge className="bg-green-500">Verified</Badge>
                        ) : (
                          <Badge className="bg-[#FEF7CD] text-amber-700">Pending</Badge>
                        )}
                      </div>
                      
                      {selectedUser.kyc_verified ? (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Full Name</p>
                                  <p className="text-sm text-gray-600">{selectedUser.full_name}</p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Email</p>
                                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="border rounded-md p-8 text-center">
                          <Shield className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">User has not completed KYC verification</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-2 shadow-sm border-gray-200">
              <div className="flex flex-col items-center justify-center h-full py-12">
                <User className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Select a user</h3>
                <p className="text-gray-500 text-center max-w-md mt-2">
                  Choose a user from the list to view their profile details, reports, and verification status.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficerUserProfiles;
