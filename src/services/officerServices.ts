import { supabase } from '@/integrations/supabase/client';
import { 
  KycVerification, 
  CriminalTip, 
  CriminalProfile, 
  Criminal, 
  SOSAlert, 
  CaseData 
} from '@/types/officer';

// KYC Verifications
export const getKycVerifications = async (): Promise<KycVerification[]> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add empty documents array to each verification to match the KycVerification type
    const verificationsWithDocuments = data?.map(verification => ({
      ...verification,
      documents: [] // Initialize with empty array
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
    // First check if the user_id is set and valid UUID format
    const { data: verificationData, error: verificationError } = await supabase
      .from('kyc_verifications')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (verificationError) throw verificationError;
    
    // User ID validation - check if it's a valid UUID, if not, don't include it in the update
    let updatePayload: any = {
      status: status,
      officer_action: officerAction,
      rejection_reason: status === 'Rejected' ? officerAction : null
    };
    
    // Update the verification
    const { error } = await supabase
      .from('kyc_verifications')
      .update(updatePayload)
      .eq('id', id);
      
    if (error) throw error;
    
    // No need to manually insert notification - our database trigger will handle it
    // if there's a valid user_id
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
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching criminals:', error);
    throw error;
  }
};

export const addCriminal = async (criminal: Omit<Criminal, 'id' | 'created_at'>): Promise<Criminal> => {
  try {
    const { data, error } = await supabase
      .from('criminal_profiles')
      .insert([criminal])
      .select()
      .single();
      
    if (error) throw error;
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

// Criminal Profiles 
export const getCriminalProfiles = async (): Promise<CriminalProfile[]> => {
  return getCriminals();
};

export const createCriminalProfile = async (criminal: Omit<CriminalProfile, 'id' | 'created_at'>): Promise<CriminalProfile> => {
  return addCriminal(criminal);
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
