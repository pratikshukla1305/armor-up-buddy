import { supabase } from '@/integrations/supabase/client';
import { 
  KycVerification, 
  CriminalTip, 
  CriminalProfile, 
  Criminal, 
  SOSAlert, 
  CaseData 
} from '@/types/officer';
import { v4 as uuidv4 } from 'uuid';

// KYC Verifications
export const getKycVerifications = async (): Promise<KycVerification[]> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*, documents:kyc_documents(*)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error in getKycVerifications:', error);
      throw error;
    }
    
    // Ensure each verification has a documents array
    const verificationsWithDocuments = data?.map(verification => ({
      ...verification,
      documents: verification.documents || []
    })) || [];
    
    return verificationsWithDocuments;
  } catch (error) {
    console.error('Error fetching KYC verifications:', error);
    throw error;
  }
};

export const updateKycVerificationStatus = async (
  id: number,
  status: string,
  officerAction: string = ''
): Promise<void> => {
  try {
    console.log(`Updating KYC status: id=${id}, status=${status}, reason=${officerAction}`);
    
    // Create the update data
    const updateData: any = {
      status: status,
      officer_action: officerAction,
    };
    
    // Add rejection reason if status is Rejected
    if (status === 'Rejected') {
      updateData.rejection_reason = officerAction;
    }
    
    // Update the verification status
    const { error } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', id);
      
    if (error) {
      console.error('Error in updateKycVerificationStatus:', error);
      throw error;
    }
    
    console.log('KYC status updated successfully');
  } catch (error) {
    console.error('Error updating KYC verification status:', error);
    throw error;
  }
};

// Criminal Management
export const getCriminals = async (): Promise<Criminal[]> => {
  try {
    const { data, error } = await supabase
      .from('criminal_profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error in getCriminals:', error);
      throw error;
    }
    
    console.log('Fetched criminals:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching criminals:', error);
    throw error;
  }
};

export const addCriminal = async (criminal: Omit<Criminal, 'id' | 'created_at'>): Promise<Criminal> => {
  try {
    console.log('Adding criminal with data:', criminal);
    
    const { data, error } = await supabase
      .from('criminal_profiles')
      .insert([criminal])
      .select()
      .single();
      
    if (error) {
      console.error('Error in addCriminal:', error);
      throw error;
    }
    
    console.log('Criminal added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error adding criminal:', error);
    throw error;
  }
};

export const updateCriminal = async (id: number, criminal: Partial<Criminal>): Promise<Criminal> => {
  try {
    const { data, error } = await supabase
      .from('criminal_profiles')
      .update(criminal)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating criminal:', error);
    throw error;
  }
};

export const deleteCriminal = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('criminal_profiles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting criminal:', error);
    throw error;
  }
};

// Criminal Tips
export const getCriminalTips = async (): Promise<CriminalTip[]> => {
  try {
    const { data, error } = await supabase
      .from('criminal_tips')
      .select('*')
      .order('tip_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching criminal tips:', error);
    throw error;
  }
};

export const updateTipStatus = async (
  id: number,
  status: string,
  officerAction: string = ''
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('criminal_tips')
      .update({
        status: status,
        officer_action: officerAction
      })
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating tip status:', error);
    throw error;
  }
};

// Criminal Profiles 
export const getCriminalProfiles = async (): Promise<CriminalProfile[]> => {
  return getCriminals();
};

export const createCriminalProfile = async (criminal: Omit<CriminalProfile, 'id' | 'created_at'>): Promise<CriminalProfile> => {
  try {
    console.log('Creating criminal profile with data:', criminal);
    return addCriminal(criminal);
  } catch (error) {
    console.error('Error in createCriminalProfile:', error);
    throw error;
  }
};

// SOS Alerts
export const getSosAlerts = async (): Promise<SOSAlert[]> => {
  try {
    const { data, error } = await supabase
      .from('sos_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    throw error;
  }
};

export const updateSosAlertStatus = async (
  alertId: string,
  status: string,
  officerNotes: string = ''
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('sos_alerts')
      .update({
        status: status,
        officer_notes: officerNotes,
        assigned_at: status === 'Assigned' ? new Date().toISOString() : null
      })
      .eq('alert_id', alertId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating SOS alert status:', error);
    throw error;
  }
};

// Case Management
export const getCases = async (): Promise<CaseData[]> => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cases:', error);
    throw error;
  }
};

export const createCase = async (caseData: Partial<CaseData>): Promise<CaseData[]> => {
  try {
    // Ensure all required fields are present
    if (!caseData.address || !caseData.case_date || !caseData.case_number || 
        !caseData.case_time || !caseData.case_type || !caseData.description || 
        !caseData.region) {
      throw new Error('Missing required fields for case creation');
    }
    
    // Create a properly typed object with all required fields
    const validCaseData = {
      address: caseData.address,
      case_date: caseData.case_date,
      case_number: caseData.case_number,
      case_time: caseData.case_time,
      case_type: caseData.case_type,
      description: caseData.description,
      region: caseData.region,
      // Optional fields
      latitude: caseData.latitude,
      longitude: caseData.longitude,
      reporter_id: caseData.reporter_id,
      status: caseData.status
    };
    
    const { data, error } = await supabase
      .from('cases')
      .insert([validCaseData])
      .select();
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error creating case:', error);
    throw error;
  }
};

// Add a new function to fetch evidence for viewing
export const getEvidenceById = async (evidenceId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('evidence')
      .select('*, report:crime_reports(*)')
      .eq('id', evidenceId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching evidence:', error);
    throw error;
  }
};

export const getAllEvidence = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('evidence')
      .select('*, report:crime_reports(title, status)')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all evidence:', error);
    throw error;
  }
};

// Officer Registration
export const registerOfficer = async (officerData: {
  full_name: string;
  badge_number: string;
  department: string;
  department_email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('register_officer', {
      full_name: officerData.full_name,
      badge_number: officerData.badge_number,
      department: officerData.department,
      department_email: officerData.department_email,
      phone_number: officerData.phone_number,
      password: officerData.password,
      confirm_password: officerData.confirm_password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error registering officer:', error);
    throw error;
  }
};

// Add the missing functions needed for UploadCard.tsx
export const uploadFilesToSupabase = async (files: File[], userId: string): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = [];
    
    // Create a unique folder for this upload session
    const sessionId = uuidv4();
    const bucketName = 'crime-evidence';
    
    // Check if storage is available
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      throw new Error('Storage not available');
    }
    
    // Create or use the evidence bucket
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // For demonstration purposes
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw new Error('Failed to create storage bucket');
      }
    }
    
    // Upload each file
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `uploads/${userId}/${sessionId}/${fileName}`;
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        continue; // Skip this file and try the next one
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (urlData.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }
    
    return uploadedUrls;
  } catch (error) {
    console.error('Error in uploadFilesToSupabase:', error);
    return [];
  }
};

export const createDraftReport = async (
  userId: string, 
  reportId: string, 
  uploadedUrls: string[]
): Promise<boolean> => {
  try {
    // Create a draft report entry in the database
    const { error } = await supabase
      .from('crime_reports')
      .insert([
        {
          id: reportId,
          user_id: userId,
          title: 'Draft Report',
          status: 'draft',
          description: 'Automatically created draft report for uploaded evidence.',
          media_urls: uploadedUrls,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error creating draft report:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in createDraftReport:', error);
    return false;
  }
};
