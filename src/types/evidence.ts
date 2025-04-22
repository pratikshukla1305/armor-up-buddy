
export interface EvidenceResponse {
  id: string;
  request_id: string;
  description: string;
  is_anonymous: boolean;
  file_url?: string;
  submitted_by?: string;
  submitted_at: string;
  status: string;
  reviewed_at?: string;
  officer_notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
