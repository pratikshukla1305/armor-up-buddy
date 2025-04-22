
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Bell, 
  FileText, 
  AlertTriangle, 
  User, 
  MessageSquare, 
  Check, 
  Clock,
  X,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from 'date-fns';
import { getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/services/userNotificationService';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Notifications = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
    }
  }, [user, isLoading, navigate]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoadingNotifications(true);
      const allNotifications = await getUserNotifications(50);
      setNotifications(allNotifications);
      
      if (activeTab === 'all') {
        setFilteredNotifications(allNotifications);
      } else {
        setFilteredNotifications(
          allNotifications.filter(notif => notif.notification_type === activeTab)
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    if (user) {
      const channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}` 
          },
          (payload) => {
            // Add new notification to the list
            setNotifications(prev => [payload.new, ...prev]);
            
            // Update filtered notifications if needed
            if (activeTab === 'all' || payload.new.notification_type === activeTab) {
              setFilteredNotifications(prev => [payload.new, ...prev]);
            }
            
            // Show toast notification
            toast.info("New notification received", {
              description: payload.new.message,
              action: {
                label: "View",
                onClick: () => navigate('/notifications')
              }
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeTab, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter(notif => notif.notification_type === value)
      );
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        
        setFilteredNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        
        toast.success("Notification marked as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        
        setFilteredNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report_update':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'sos_update':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'kyc_update':
        return <User className="h-5 w-5 text-green-500" />;
      case 'criminal_sighting':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return '(unknown time)';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Bell className="h-12 w-12 text-shield-blue animate-pulse" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications</h1>
              <p className="text-gray-600">
                Stay updated on your reports, verifications, and alerts
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchNotifications}
                disabled={isLoadingNotifications}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mb-8" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-5 w-full mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="report_update">Reports</TabsTrigger>
              <TabsTrigger value="kyc_update">KYC</TabsTrigger>
              <TabsTrigger value="sos_update">SOS</TabsTrigger>
              <TabsTrigger value="criminal_sighting">Sightings</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoadingNotifications ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                              <Skeleton className="h-3 w-5/6" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`overflow-hidden transition-colors ${!notification.is_read ? 'bg-blue-50/40 border-blue-200' : ''}`}
                    >
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              {getNotificationIcon(notification.notification_type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className={`text-sm ${!notification.is_read ? 'font-medium' : 'text-gray-600'}`}>
                                  {notification.notification_type === 'report_update' && 'Report Update'}
                                  {notification.notification_type === 'sos_update' && 'SOS Alert Update'}
                                  {notification.notification_type === 'kyc_update' && 'KYC Verification Update'}
                                  {notification.notification_type === 'criminal_sighting' && 'Criminal Sighting Report'}
                                </p>
                                <span className="text-xs text-gray-500">{getNotificationTime(notification.created_at)}</span>
                              </div>
                              
                              <p className="mt-1 text-sm text-gray-800">{notification.message}</p>
                              
                              <div className="mt-3 flex items-center justify-between">
                                {notification.report_id && (
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 h-auto text-shield-blue hover:text-blue-700"
                                    onClick={() => navigate(`/view-draft-report?id=${notification.report_id}`)}
                                  >
                                    View Details
                                    <ChevronRight className="ml-1 h-3 w-3" />
                                  </Button>
                                )}
                                
                                {!notification.is_read && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="ml-auto"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white rounded-lg p-16 text-center">
                  <CardContent className="pt-16">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications</h3>
                    <p className="text-gray-500 mb-6">
                      {activeTab === 'all' 
                        ? "You don't have any notifications yet." 
                        : `You don't have any ${activeTab.replace('_', ' ')} notifications.`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;
