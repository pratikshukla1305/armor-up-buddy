import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SOSAlert } from '@/types/officer';
import { AlertTriangle, MapPin, Clock, PhoneCall, MessageSquare, Mic, ExternalLink } from 'lucide-react';
import VoiceRecordingPlayer from './VoiceRecordingPlayer';
import AlertStatusButtons from './AlertStatusButtons';
import { supabase } from '@/integrations/supabase/client';

interface AlertCardProps {
  alert: SOSAlert;
  onStatusUpdate: (alertId: string, status: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onStatusUpdate }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getUrgencyBadge = (level: string | undefined) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      case 'in progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const openMapLocation = () => {
    if (alert.latitude && alert.longitude) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`;
      window.open(mapUrl, '_blank');
    }
  };

  // Validate voice recording URL before displaying the player
  const hasValidVoiceRecording = Boolean(
    alert.voice_recording && 
    typeof alert.voice_recording === 'string' && 
    (alert.voice_recording.startsWith('http://') || alert.voice_recording.startsWith('https://'))
  );
  
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="font-medium text-lg">{alert.contact_info || 'Anonymous'}</h3>
          {alert.urgency_level && getUrgencyBadge(alert.urgency_level)}
          {alert.status && getStatusBadge(alert.status)}
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{formatDate(alert.reported_time)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-start space-x-2">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium">Location</div>
            <div className="text-gray-700 mb-1">{alert.location}</div>
            {alert.latitude && alert.longitude && (
              <div className="flex items-center">
                <div className="text-xs text-gray-500 mr-2">
                  {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-blue-600 hover:text-blue-800"
                  onClick={openMapLocation}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="text-xs">Map</span>
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {alert.contact_info && (
          <div className="flex items-start space-x-2">
            <PhoneCall className="h-5 w-5 text-stripe-blue-dark mt-0.5" />
            <div>
              <div className="font-medium">Contact</div>
              <div className="text-gray-700">{alert.contact_info}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-3 mb-4">
        {hasValidVoiceRecording && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Mic className="h-4 w-4 text-stripe-blue-dark mr-2" />
              <h4 className="text-sm font-medium">Voice Recording</h4>
            </div>
            <VoiceRecordingPlayer 
              recordingUrl={alert.voice_recording as string} 
              label="Emergency Recording"
            />
          </div>
        )}
        
        {alert.message && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-4 w-4 text-stripe-blue-dark mr-2" />
              <h4 className="text-sm font-medium">Message</h4>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{alert.message}</p>
          </div>
        )}
      </div>
      
      <AlertStatusButtons 
        status={alert.status} 
        contactInfo={alert.contact_info}
        onUpdateStatus={(status) => onStatusUpdate(alert.alert_id, status)} 
      />
    </div>
  );
};

export default AlertCard;
