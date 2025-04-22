
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface VoiceRecordingPlayerProps {
  recordingUrl: string;
  label?: string;
}

const VoiceRecordingPlayer: React.FC<VoiceRecordingPlayerProps> = ({ 
  recordingUrl, 
  label = 'Voice Recording' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioAvailable, setIsAudioAvailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Make sure to destroy audio element to prevent memory leaks
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    // Create a new audio element if recordingUrl changes
    if (recordingUrl) {
      // Clean up previous audio element if it exists
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      setIsAudioAvailable(false);
      setIsLoading(true);
      
      // Create new audio element
      const audio = new Audio(recordingUrl);
      audioRef.current = audio;
      
      // Log the URL for debugging
      console.log('Loading audio from URL:', recordingUrl);
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        console.log('Audio metadata loaded:', {
          duration: audio.duration,
          readyState: audio.readyState
        });
        setDuration(audio.duration);
        setIsAudioAvailable(true);
        setIsLoading(false);
      });
      
      audio.addEventListener('playing', () => {
        console.log('Audio playing event triggered');
        setIsPlaying(true);
        setIsLoading(false);
      });
      
      audio.addEventListener('pause', () => {
        console.log('Audio paused event triggered');
        setIsPlaying(false);
      });
      
      audio.addEventListener('ended', () => {
        console.log('Audio ended event triggered');
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('error', (e) => {
        const errorDetails = {
          code: audio.error?.code,
          message: audio.error?.message,
          event: e
        };
        console.error('Audio error:', errorDetails);
        
        setIsLoading(false);
        setIsAudioAvailable(false);
        
        let errorMessage = 'Failed to load audio recording';
        
        switch (audio.error?.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio playback was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio format not supported or corrupted';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported by your browser';
            break;
        }
        
        toast.error(errorMessage);
      });
      
      // Preload the audio
      audio.load();
    }
  }, [recordingUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current || !recordingUrl) {
      toast.error('Audio recording not available');
      return;
    }
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setIsLoading(true);
        
        // Make sure src is set before playing
        if (!audioRef.current.src || audioRef.current.src !== recordingUrl) {
          audioRef.current.src = recordingUrl;
        }
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playback started successfully');
              setIsLoading(false);
              
              // Set up interval to update time display
              if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                  if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                  }
                }, 100);
              }
            })
            .catch(error => {
              setIsLoading(false);
              console.error('Error playing audio:', error);
              toast.error('Failed to play recording: ' + (error.message || 'Unknown error'));
            });
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error in togglePlayPause:', error);
      toast.error('Failed to control audio playback');
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // If URL is not provided or is invalid
  if (!recordingUrl || !recordingUrl.trim()) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 p-3 rounded-md">
        <p className="text-gray-500 text-sm">No recording available</p>
      </div>
    );
  }

  return (
    <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
      <div className="flex items-center space-x-2 mb-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={`h-8 w-8 p-0 rounded-full ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}
          onClick={togglePlayPause}
          disabled={isLoading || !isAudioAvailable}
        >
          {isLoading ? (
            <RotateCcw className="h-4 w-4 animate-spin text-gray-500" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 text-stripe-blue-dark" />
          ) : (
            <Play className="h-4 w-4 text-stripe-blue-dark" />
          )}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSliderChange}
            disabled={!isAudioAvailable || isLoading}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 0)}</span>
          </div>
        </div>
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={toggleMute}
          disabled={!isAudioAvailable}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-gray-500" />
          ) : (
            <Volume2 className="h-4 w-4 text-stripe-blue-dark" />
          )}
        </Button>
      </div>
      
      {label && (
        <div className="text-xs text-center text-gray-500">{label}</div>
      )}
    </div>
  );
};

export default VoiceRecordingPlayer;
