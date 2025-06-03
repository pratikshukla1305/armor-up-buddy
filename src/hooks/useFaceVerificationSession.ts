
import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  createFaceVerificationSession,
  updateFaceVerificationSession,
  recordFaceDetection,
  endFaceVerificationSession,
  getUserActiveSession,
  type FaceVerificationSession
} from '@/services/faceVerificationService';

export const useFaceVerificationSession = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<FaceVerificationSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const sessionRef = useRef<FaceVerificationSession | null>(null);

  const startSession = useCallback(async (referenceFaceUrl?: string) => {
    if (!user) {
      console.error('No user found for face verification session');
      return null;
    }

    try {
      console.log('Starting new face verification session');
      
      // Check for existing active session first
      const existingSession = await getUserActiveSession(user.id);
      if (existingSession) {
        console.log('Found existing active session, using it');
        setCurrentSession(existingSession);
        setIsSessionActive(true);
        sessionRef.current = existingSession;
        return existingSession;
      }

      // Create new session
      const session = await createFaceVerificationSession(user.id, referenceFaceUrl);
      if (session) {
        console.log('New face verification session created');
        setCurrentSession(session);
        setIsSessionActive(true);
        sessionRef.current = session;
        return session;
      }
      
      console.error('Failed to create face verification session');
      return null;
    } catch (error) {
      console.error('Error starting face verification session:', error);
      return null;
    }
  }, [user]);

  const updateSession = useCallback(async (updates: Partial<FaceVerificationSession>) => {
    if (!sessionRef.current) {
      console.error('No active session to update');
      return false;
    }

    try {
      const success = await updateFaceVerificationSession(sessionRef.current.id, updates);
      if (success && currentSession) {
        const updatedSession = { ...currentSession, ...updates };
        setCurrentSession(updatedSession);
        sessionRef.current = updatedSession;
      }
      return success;
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }, [currentSession]);

  const recordDetection = useCallback(async (
    faceDetected: boolean,
    confidenceScore?: number,
    faceMatch?: boolean,
    faceCoordinates?: any
  ) => {
    if (!sessionRef.current || !user) {
      console.error('No active session or user for recording detection');
      return false;
    }

    try {
      const success = await recordFaceDetection(
        sessionRef.current.id,
        user.id,
        faceDetected,
        confidenceScore,
        faceMatch,
        faceCoordinates
      );

      // Update session attempts if this was a verification attempt
      if (faceDetected && faceMatch !== undefined) {
        await updateSession({
          verification_attempts: (sessionRef.current.verification_attempts || 0) + 1,
          last_verification_time: new Date().toISOString()
        });
      }

      return success;
    } catch (error) {
      console.error('Error recording detection:', error);
      return false;
    }
  }, [user, updateSession]);

  const endSession = useCallback(async (status: 'verified' | 'failed' | 'expired') => {
    if (!sessionRef.current) {
      console.error('No active session to end');
      return false;
    }

    try {
      console.log('Ending face verification session with status:', status);
      const success = await endFaceVerificationSession(sessionRef.current.id, status);
      
      if (success) {
        setCurrentSession(null);
        setIsSessionActive(false);
        sessionRef.current = null;
      }
      
      return success;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('Cleaning up face verification session');
    setCurrentSession(null);
    setIsSessionActive(false);
    sessionRef.current = null;
  }, []);

  return {
    currentSession,
    isSessionActive,
    startSession,
    updateSession,
    recordDetection,
    endSession,
    cleanup
  };
};
