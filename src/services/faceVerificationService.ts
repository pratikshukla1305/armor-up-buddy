
import { supabase } from '@/integrations/supabase/client';

export interface FaceVerificationSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  reference_face_url?: string;
  verification_attempts: number;
  last_verification_time?: string;
  device_info: any;
  created_at: string;
  updated_at: string;
}

export interface FaceDetection {
  id: string;
  session_id: string;
  user_id: string;
  detection_time: string;
  face_detected: boolean;
  confidence_score?: number;
  face_match?: boolean;
  face_coordinates?: any;
  created_at: string;
}

// Type guard to ensure verification_status is valid
const isValidVerificationStatus = (status: string): status is FaceVerificationSession['verification_status'] => {
  return ['pending', 'verified', 'failed', 'expired'].includes(status);
};

// Helper function to transform database row to FaceVerificationSession
const transformToFaceVerificationSession = (row: any): FaceVerificationSession => {
  const status = row.verification_status;
  
  return {
    ...row,
    verification_status: isValidVerificationStatus(status) ? status : 'pending'
  } as FaceVerificationSession;
};

export const createFaceVerificationSession = async (
  userId: string,
  referenceFaceUrl?: string
): Promise<FaceVerificationSession | null> => {
  try {
    console.log('Creating face verification session for user:', userId);
    
    const deviceInfo = {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    const { data, error } = await supabase
      .from('face_verification_sessions')
      .insert({
        user_id: userId,
        reference_face_url: referenceFaceUrl,
        device_info: deviceInfo,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating face verification session:', error);
      return null;
    }

    console.log('Face verification session created:', data);
    return transformToFaceVerificationSession(data);
  } catch (error) {
    console.error('Error in createFaceVerificationSession:', error);
    return null;
  }
};

export const updateFaceVerificationSession = async (
  sessionId: string,
  updates: Partial<FaceVerificationSession>
): Promise<boolean> => {
  try {
    console.log('Updating face verification session:', sessionId, updates);
    
    const { error } = await supabase
      .from('face_verification_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating face verification session:', error);
      return false;
    }

    console.log('Face verification session updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateFaceVerificationSession:', error);
    return false;
  }
};

export const recordFaceDetection = async (
  sessionId: string,
  userId: string,
  faceDetected: boolean,
  confidenceScore?: number,
  faceMatch?: boolean,
  faceCoordinates?: any
): Promise<boolean> => {
  try {
    console.log('Recording face detection:', {
      sessionId,
      userId,
      faceDetected,
      confidenceScore,
      faceMatch
    });

    const { error } = await supabase
      .from('face_detections')
      .insert({
        session_id: sessionId,
        user_id: userId,
        face_detected: faceDetected,
        confidence_score: confidenceScore,
        face_match: faceMatch,
        face_coordinates: faceCoordinates
      });

    if (error) {
      console.error('Error recording face detection:', error);
      return false;
    }

    console.log('Face detection recorded successfully');
    return true;
  } catch (error) {
    console.error('Error in recordFaceDetection:', error);
    return false;
  }
};

export const endFaceVerificationSession = async (
  sessionId: string,
  status: 'verified' | 'failed' | 'expired'
): Promise<boolean> => {
  try {
    console.log('Ending face verification session:', sessionId, status);
    
    return await updateFaceVerificationSession(sessionId, {
      session_end: new Date().toISOString(),
      verification_status: status
    });
  } catch (error) {
    console.error('Error in endFaceVerificationSession:', error);
    return false;
  }
};

export const getUserActiveSession = async (userId: string): Promise<FaceVerificationSession | null> => {
  try {
    console.log('Getting active session for user:', userId);
    
    const { data, error } = await supabase
      .from('face_verification_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error getting active session:', error);
      return null;
    }

    if (!data) {
      console.log('No active session found');
      return null;
    }

    console.log('Active session found:', data);
    return transformToFaceVerificationSession(data);
  } catch (error) {
    console.error('Error in getUserActiveSession:', error);
    return null;
  }
};
