import React, { useState, useRef, useEffect } from 'react';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mic, 
  MicOff,
  Send, 
  MapPin, 
  Phone,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Play,
  Pause,
  StopCircle,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { policeStations } from '@/data/policeStations';
import { calculateDistance } from '@/utils/locationUtils';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface SOSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLocation: { lat: number; lng: number } | null;
}

const SOSModal = ({ open, onOpenChange, userLocation }: SOSModalProps) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [nearestStation, setNearestStation] = useState<any | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (userLocation && policeStations.length > 0) {
      let nearest = policeStations[0];
      let minDistance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        nearest.coordinates.lat,
        nearest.coordinates.lng
      );

      policeStations.forEach(station => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          station.coordinates.lat,
          station.coordinates.lng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = station;
        }
      });

      setNearestStation(nearest);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!open) {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingTime(0);
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setRecordedAudio(null);
      setAudioUrl(null);
      setTextMessage('');
      setStatus('idle');
      audioChunksRef.current = [];
    }
  }, [open, isRecording, audioUrl]);

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000);
      setIsRecording(true);
      
      setRecordingTime(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success("Recording started", {
        description: "Speak clearly into your microphone"
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied", {
        description: "Please allow microphone access to record audio messages"
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast.success("Recording stopped", {
        description: "Voice message recorded successfully"
      });
    }
  };

  const handlePlayPauseAudio = () => {
    if (!audioElementRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          toast.error("Could not play the recording");
        });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const uploadVoiceRecording = async (blob: Blob, userId: string, alertId: string): Promise<string | null> => {
    try {
      const fileName = `${alertId}.webm`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sos-audio')
        .upload(filePath, blob, {
          contentType: 'audio/webm',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading voice recording:', uploadError);
        throw uploadError;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('sos-audio')
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for voice recording');
      }
      
      console.log('Voice recording uploaded successfully:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadVoiceRecording:', error);
      return null;
    }
  };

  const handleSendSOS = async () => {
    if (!userLocation) {
      toast.error("Location unavailable", {
        description: "We couldn't determine your location. Please try again."
      });
      return;
    }
    
    if (!textMessage && !recordedAudio) {
      toast.error("No message to send", {
        description: "Please record a voice message or type a text message"
      });
      return;
    }
    
    if (!user) {
      toast.error("Authentication required", {
        description: "You must be signed in to send an SOS alert"
      });
      return;
    }
    
    setStatus('sending');
    
    try {
      const alertId = uuidv4();
      let voiceUrl = null;
      
      if (recordedAudio && user) {
        voiceUrl = await uploadVoiceRecording(recordedAudio, user.id, alertId);
        
        if (!voiceUrl) {
          toast.error("Failed to upload voice recording", {
            description: "The alert will be sent without the voice recording"
          });
        } else {
          console.log("Voice recording uploaded to:", voiceUrl);
        }
      }
      
      const { error } = await supabase
        .from('sos_alerts')
        .insert({
          alert_id: alertId,
          reported_by: user.id,
          contact_info: user?.email || null,
          reported_time: new Date().toISOString(),
          status: 'New',
          location: nearestStation?.name || 'Unknown location',
          longitude: userLocation.lng,
          latitude: userLocation.lat,
          message: textMessage,
          voice_recording: voiceUrl,
          urgency_level: 'High',
          contact_user: true
        });
      
      if (error) {
        console.error("SOS alert error:", error);
        toast.error("Failed to send SOS alert", {
          description: error.message
        });
        throw error;
      }
      
      if (voiceUrl) {
        const { error: recordingError } = await supabase.from('voice_recordings').insert({
          alert_id: alertId,
          recording_url: voiceUrl
        });
        
        if (recordingError) {
          console.error("Error saving voice recording reference:", recordingError);
        }
      }
      
      setStatus('sent');
      
      toast.success("SOS Alert Sent", {
        description: `Your alert has been sent to ${nearestStation?.name || 'the nearest police station'}`
      });
      
      setTimeout(() => {
        onOpenChange(false);
        setStatus('idle');
        setTextMessage('');
        setRecordedAudio(null);
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }
      }, 3000);
    } catch (error: any) {
      console.error("Error sending SOS alert:", error);
      setStatus('error');
      
      toast.error("Failed to send SOS", {
        description: `Error: ${error.message}`
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="bg-red-50">
          <DrawerTitle className="text-xl font-bold text-red-600 flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Emergency SOS Alert
          </DrawerTitle>
          <p className="text-gray-600 mt-2">
            Send your location and message to the nearest police station
          </p>
        </DrawerHeader>
        
        <div className="p-6 space-y-6">
          {nearestStation && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Nearest Police Station</h3>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">{nearestStation.name}</p>
                  <p className="text-sm text-gray-600">{nearestStation.address}</p>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Phone className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                <p className="text-sm">{nearestStation.phone}</p>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-2">Your Location</h3>
            <div className="bg-gray-100 p-3 rounded-lg flex items-center">
              <MapPin className="h-5 w-5 text-gray-600 mr-2" />
              {userLocation ? (
                <p className="text-sm">
                  Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-red-500">Location unavailable</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Voice Message</h3>
            <div className="flex items-center space-x-2">
              {!recordedAudio ? (
                <>
                  {isRecording ? (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="bg-red-100 p-2 rounded-lg flex items-center flex-1">
                        <Mic className="h-5 w-5 text-red-600 mr-2 animate-pulse" />
                        <span className="text-sm text-red-600 font-medium">Recording... {formatRecordingTime(recordingTime)}</span>
                      </div>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={handleStopRecording}
                        className="whitespace-nowrap"
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleStartRecording}
                      className="flex-1"
                      disabled={status === 'sending' || status === 'sent'}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Record Voice Message
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex-1 bg-green-50 p-2 rounded-lg flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm">Voice message recorded</span>
                  
                  {audioUrl && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-2"
                        onClick={handlePlayPauseAudio}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <audio 
                        ref={audioElementRef}
                        src={audioUrl}
                        onEnded={handleAudioEnded}
                        className="hidden"
                      />
                    </>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => {
                      if (audioUrl) {
                        URL.revokeObjectURL(audioUrl);
                      }
                      setRecordedAudio(null);
                      setAudioUrl(null);
                      setIsPlaying(false);
                    }}
                    disabled={status === 'sending' || status === 'sent'}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Text Message</h3>
            <Textarea
              placeholder="Describe your emergency situation..."
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              className="w-full resize-none"
              rows={3}
              disabled={status === 'sending' || status === 'sent'}
            />
          </div>
        </div>
        
        <DrawerFooter className="border-t">
          <Button 
            onClick={handleSendSOS} 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={status === 'sending' || status === 'sent' || !user}
          >
            {status === 'idle' && (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send SOS Alert
              </>
            )}
            {status === 'sending' && (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Alert...
              </>
            )}
            {status === 'sent' && (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Alert Sent
              </>
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={status === 'sending'}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SOSModal;
