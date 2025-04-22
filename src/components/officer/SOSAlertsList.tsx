
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSosAlerts, updateSosAlertStatus } from '@/services/officerServices';
import { SOSAlert } from '@/types/officer';
import AlertCard from './AlertCard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SOSAlertsListProps {
  limit?: number;
}

const SOSAlertsList: React.FC<SOSAlertsListProps> = ({ limit }) => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast: toastHook } = useToast();

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      console.log("Starting SOS alert fetch...");
      const data = await getSosAlerts();
      console.log("Fetched SOS alerts:", data);
      const limitedData = limit ? data.slice(0, limit) : data;
      setAlerts(limitedData);
      if (data.length === 0) {
        console.log("No SOS alerts found in database");
      }
    } catch (error: any) {
      console.error("Error fetching SOS alerts:", error);
      toastHook({
        title: "Error fetching alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time subscriptions for SOS alerts and voice recordings
  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to changes in sos_alerts table
    const sosChannel = supabase
      .channel('sos-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all changes
          schema: 'public',
          table: 'sos_alerts'
        },
        (payload) => {
          console.log('Real-time SOS alert change detected:', payload);
          
          // Refresh the alerts when any change occurs
          fetchAlerts();
          
          // Show notification for new alerts
          if (payload.eventType === 'INSERT') {
            toast("New SOS Alert", {
              description: "A new emergency alert has been received",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('SOS alerts subscription status:', status);
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to SOS alerts channel');
        }
      });
    
    // Subscribe to changes in voice_recordings table
    const voiceChannel = supabase
      .channel('voice-recording-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voice_recordings'
        },
        (payload) => {
          console.log('Real-time voice recording change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Show notification for new voice recordings
            toast("New Voice Recording", {
              description: "A voice recording has been added to an SOS alert",
            });
          }
          
          fetchAlerts(); // Refresh to get updated voice recordings
        }
      )
      .subscribe((status) => {
        console.log('Voice recordings subscription status:', status);
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to voice recordings channel');
        }
      });

    // Subscribe to criminal tips changes
    const tipsChannel = supabase
      .channel('criminal-tips-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'criminal_tips'
        },
        (payload) => {
          console.log('Real-time criminal tip change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Show notification for new tips
            toast("New Criminal Sighting Report", {
              description: "A new criminal sighting has been reported",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Criminal tips subscription status:', status);
      });

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up Supabase channels');
      supabase.removeChannel(sosChannel);
      supabase.removeChannel(voiceChannel);
      supabase.removeChannel(tipsChannel);
    };
  }, [limit, toastHook]);

  const handleStatusUpdate = async (alertId: string, status: string) => {
    try {
      await updateSosAlertStatus(alertId, status);
      toastHook({
        title: "Status updated",
        description: `Alert status updated to ${status}`,
      });
      fetchAlerts(); // Refresh the alerts after updating
    } catch (error: any) {
      console.error("Error updating SOS alert status:", error);
      toastHook({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-shield-blue mb-2" />
          <p className="text-sm text-gray-500">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">No SOS alerts found</p>
        <p className="text-sm text-gray-400 mt-1">New alerts will appear here automatically</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard 
          key={alert.alert_id} 
          alert={alert} 
          onStatusUpdate={handleStatusUpdate} 
        />
      ))}
    </div>
  );
};

export default SOSAlertsList;
