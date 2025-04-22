
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  UserNotification 
} from '@/services/userNotificationService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const UserNotificationBell = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const notifs = await getUserNotifications(5);
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.is_read).length);
        
        // Store notifications in session storage for persistence
        sessionStorage.setItem('user_notifications', JSON.stringify(notifs));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        
        // Try to load from session storage if available
        const storedNotifications = sessionStorage.getItem('user_notifications');
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          setNotifications(parsedNotifications);
          setUnreadCount(parsedNotifications.filter((n: UserNotification) => !n.is_read).length || 0);
        }
      }
    };

    fetchNotifications();

    // Set up real-time subscription
    if (user) {
      const channel = supabase
        .channel('user-notification-updates')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as UserNotification;
            setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
            setUnreadCount(prev => prev + 1);
            
            // Update session storage
            const currentNotifications = JSON.parse(sessionStorage.getItem('user_notifications') || '[]');
            sessionStorage.setItem(
              'user_notifications', 
              JSON.stringify([newNotification, ...currentNotifications.slice(0, 4)])
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleMarkAsRead = async (id: string, reportId: string | null = null) => {
    try {
      await markNotificationAsRead(id);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update session storage
      const currentNotifications = JSON.parse(sessionStorage.getItem('user_notifications') || '[]');
      const updatedNotifications = currentNotifications.map((n: UserNotification) => 
        n.id === id ? { ...n, is_read: true } : n
      );
      sessionStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
      
      // Navigate to the appropriate page if reportId exists
      if (reportId) {
        navigate(`/view-draft-report?id=${reportId}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      // Update session storage
      const currentNotifications = JSON.parse(sessionStorage.getItem('user_notifications') || '[]');
      const updatedNotifications = currentNotifications.map((n: UserNotification) => ({ ...n, is_read: true }));
      sessionStorage.setItem('user_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle notification click based on its type
  const handleNotificationClick = (notification: UserNotification) => {
    // First mark as read
    handleMarkAsRead(notification.id, notification.report_id);
    
    // Then navigate based on notification type
    switch (notification.notification_type) {
      case 'report_update':
        navigate(`/view-draft-report?id=${notification.report_id}`);
        break;
      case 'officer_action':
        navigate(`/my-reports`);
        break;
      default:
        navigate('/home');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-xs h-auto p-0"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center w-full">
                  <span className="font-medium">
                    {notification.notification_type === 'report_update' 
                      ? 'Report Update'
                      : notification.notification_type === 'officer_action'
                        ? 'Officer Action'
                        : 'Notification'}
                  </span>
                  {!notification.is_read && (
                    <Badge className="ml-2 bg-blue-500">New</Badge>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/my-reports')}
              >
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No new notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNotificationBell;
