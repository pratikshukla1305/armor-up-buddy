
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Ideally this would come from a real API call
const fetchNotificationCount = async () => {
  // Simulate API call
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      resolve(3); // Mock notification count
    }, 500);
  });
};

const NotificationBell = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getNotificationCount = async () => {
      setIsLoading(true);
      try {
        const count = await fetchNotificationCount();
        setNotificationCount(count);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getNotificationCount();
    // Set up interval to check for new notifications
    const interval = setInterval(getNotificationCount, 60000); // every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
          <Bell className="h-5 w-5 text-white" />
          {notificationCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0" 
              variant="destructive"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          <DropdownMenuItem className="flex flex-col items-start cursor-pointer">
            <div className="font-semibold">New SOS Alert</div>
            <div className="text-sm text-muted-foreground">User reported an emergency at Downtown location</div>
            <div className="text-xs text-muted-foreground mt-1">3 minutes ago</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start cursor-pointer">
            <div className="font-semibold">KYC Verification Request</div>
            <div className="text-sm text-muted-foreground">New user verification pending approval</div>
            <div className="text-xs text-muted-foreground mt-1">20 minutes ago</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start cursor-pointer">
            <div className="font-semibold">New Crime Report</div>
            <div className="text-sm text-muted-foreground">Video evidence submitted for review</div>
            <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center text-blue-600">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
