
export interface Officer {
  id: number;
  full_name: string;
  badge_number: string;
  department: string;
  department_email: string;
  phone_number: string;
}

export interface SOSAlert {
  alert_id: string;
  reported_by: string;
  contact_info?: string;
  reported_time: string;
  status?: string;
  location: string;
  longitude?: number;
  latitude?: number;
  message?: string;
  voice_recording?: string;
  created_at?: string;
  urgency_level?: string;
  dispatch_team?: string;
  contact_user?: boolean;
}

export interface KycVerification {
  id: number;
  full_name: string;
  email: string;
  submission_date: string;
  status?: string;
  officer_action?: string;
  id_front?: string;
  id_back?: string;
  selfie?: string;
  rejection_reason?: string;
  created_at?: string;
  documents: KycDocument[];
  user_id?: string;
  ocr_status?: string;
  is_data_edited?: boolean;
  edited_data?: any;
  extracted_data?: any;
}

export interface KycDocument {
  id: string;
  verification_id: number;
  document_type: string;
  document_url: string;
  extracted_data?: any;
  created_at?: string;
}

export interface Advisory {
  id: number;
  advisory_title: string;
  advisory_type: string;
  severity_level?: string;
  issuing_authority: string;
  issue_date: string;
  location: string;
  expiry_date?: string;
  image_url?: string;
  short_description: string;
  detailed_content: string;
  created_at?: string;
}

export interface Criminal {
  id: number;
  full_name: string;
  age?: number;
  height?: number;
  weight?: number;
  last_known_location: string;
  case_number: string;
  risk_level?: string;
  photo_url?: string;
  charges: string;
  additional_information?: string;
  created_at?: string;
}

export type CriminalProfile = Criminal;

export interface CaseData {
  case_id: number;
  case_number: string;
  region: string;
  latitude?: number;
  longitude?: number;
  address: string;
  case_type: string;
  case_date: string;
  case_time: string;
  status?: string;
  reporter_id?: string;
  description: string;
  created_at?: string;
}

export interface CriminalTip {
  id: number;
  submitter_name?: string;
  email?: string;
  phone?: string;
  tip_date?: string;
  location?: string;
  subject: string;
  description: string;
  is_anonymous?: boolean;
  status?: string;
  image_url?: string;
  officer_action?: string;
}

export interface Evidence {
  id: string;
  report_id: string;
  user_id: string;
  title?: string;
  description?: string;
  type?: string;
  storage_path?: string;
  uploaded_at: string;
}
