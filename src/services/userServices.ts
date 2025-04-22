import { supabase } from '@/integrations/supabase/client';
import { SOSAlert, KycVerification, Advisory, CriminalProfile, CaseData, CriminalTip, KycDocument } from '@/types/officer';

// SOS Alerts
export const submitSOSAlert = async (alertData: any): Promise<SOSAlert[]> => {
  // Ensure the reported_by field is set to the authenticated user's ID for RLS
  if (!alertData.reported_by) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      alertData.reported_by = user.id;
    } else {
      throw new Error('User must be authenticated to submit an SOS alert');
    }
  }
  
  const { data, error } = await supabase
    .from('sos_alerts')
    .insert([alertData])
    .select();
  
  if (error) {
    throw error;
  }
  
  // If a voice recording URL is provided, store it in the voice_recordings table
  if (alertData.voice_recording) {
    const { error: voiceError } = await supabase
      .from('voice_recordings')
      .insert([
        {
          alert_id: data[0].alert_id,
          recording_url: alertData.voice_recording
        }
      ]);
      
    if (voiceError) {
      console.error("Error saving voice recording:", voiceError);
      // Don't throw here, as the alert was already saved
    }
  }
  
  return data || [];
};

export const getUserSOSAlerts = async (userId: string): Promise<SOSAlert[]> => {
  const { data, error } = await supabase
    .from('sos_alerts')
    .select('*')
    .eq('reported_by', userId)
    .order('reported_time', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

// KYC Verification
export const submitKycVerification = async (verificationData: any): Promise<KycVerification[]> => {
  try {
    // Check if a verification with this email already exists
    const { data: existingVerification, error: checkError } = await supabase
      .from('kyc_verifications')
      .select('id, status')
      .eq('email', verificationData.email)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing verification:', checkError);
      throw checkError;
    }
    
    let data;
    let error;
    
    if (existingVerification) {
      // If verification exists and is not already approved, update it
      if (existingVerification.status !== 'Approved') {
        const updateData = {
          full_name: verificationData.fullName,
          submission_date: new Date().toISOString(),
          status: 'Pending', // Reset to pending for review
          id_front: verificationData.idFront,
          id_back: verificationData.idBack,
          selfie: verificationData.selfie
        };
        
        const result = await supabase
          .from('kyc_verifications')
          .update(updateData)
          .eq('id', existingVerification.id)
          .select();
          
        data = result.data;
        error = result.error;
      } else {
        // If already approved, just return the existing verification
        return [{
          ...existingVerification,
          full_name: verificationData.fullName,
          email: verificationData.email,
          id_front: verificationData.idFront,
          id_back: verificationData.idBack,
          selfie: verificationData.selfie,
          status: 'Approved',
          submission_date: new Date().toISOString(), // Add the missing field
          documents: []
        }];
      }
    } else {
      // If no existing verification, insert a new one
      const result = await supabase
        .from('kyc_verifications')
        .insert([{
          full_name: verificationData.fullName,
          email: verificationData.email,
          submission_date: new Date().toISOString(),
          status: 'Pending',
          id_front: verificationData.idFront,
          id_back: verificationData.idBack,
          selfie: verificationData.selfie
        }])
        .select();
      
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('Error submitting KYC verification:', error);
      throw error;
    }
    
    // Initialize the documents array and ensure submission_date is present
    const results: KycVerification[] = data.map(item => ({
      ...item,
      documents: []
    }));
    
    // If documents are provided, store them in the kyc_documents table
    if (verificationData.documents && verificationData.documents.length > 0) {
      // First remove any existing documents for this verification
      if (existingVerification) {
        const { error: deleteError } = await supabase
          .from('kyc_documents')
          .delete()
          .eq('verification_id', existingVerification.id);
          
        if (deleteError) {
          console.error("Error removing old KYC documents:", deleteError);
        }
      }
      
      const verificationId = existingVerification ? existingVerification.id : results[0].id;
      
      const documentsToInsert = verificationData.documents.map((doc: any) => ({
        verification_id: verificationId,
        document_type: doc.type,
        document_url: doc.url,
        extracted_data: doc.extracted_data || null
      }));
      
      const { data: docData, error: docError } = await supabase
        .from('kyc_documents')
        .insert(documentsToInsert)
        .select();
        
      if (docError) {
        console.error("Error saving KYC documents:", docError);
        // Don't throw here, as the verification was already saved
      } else if (docData) {
        // Attach the documents to the result
        results[0].documents = docData as KycDocument[];
      }
    }
    
    console.log('KYC verification submitted successfully:', results);
    return results;
  } catch (error) {
    console.error('Error in submitKycVerification:', error);
    throw error;
  }
};

export const getUserKycStatus = async (email: string): Promise<KycVerification | null> => {
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('email', email)
    .order('submission_date', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  // Get documents for this verification
  const { data: documents, error: docError } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('verification_id', data.id);
  
  if (docError) {
    console.error("Error fetching KYC documents:", docError);
  }
  
  return {
    ...data,
    documents: documents || []
  };
};

// Advisories
export const getPublicAdvisories = async (): Promise<Advisory[]> => {
  const { data, error } = await supabase
    .from('advisories')
    .select('*')
    .order('issue_date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

// Criminal Profiles
export const getWantedCriminals = async (): Promise<CriminalProfile[]> => {
  const { data, error } = await supabase
    .from('criminal_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

// Cases
export const getPublicCases = async (): Promise<CaseData[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('case_date', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

// Criminal Tip Submission
export const submitCriminalTip = async (tipData: any): Promise<any> => {
  try {
    console.log('Submitting criminal tip with data:', tipData);
    
    // Make sure the data matches the database columns exactly
    const { data, error } = await supabase
      .from('criminal_tips')
      .insert([{
        subject: tipData.subject,
        description: tipData.description,
        location: tipData.location,
        tip_date: tipData.tip_date,
        is_anonymous: tipData.is_anonymous,
        submitter_name: tipData.submitter_name,
        email: tipData.email,
        phone: tipData.phone,
        status: tipData.status || 'New',
        image_url: tipData.image_url
      }])
      .select();
  
    if (error) {
      console.error('Error submitting criminal tip:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in submitCriminalTip:', error);
    throw error;
  }
};
