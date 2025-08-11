export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      advisories: {
        Row: {
          advisory_title: string
          advisory_type: string
          created_at: string | null
          detailed_content: string
          expiry_date: string | null
          id: number
          image_url: string | null
          issue_date: string
          issuing_authority: string
          location: string
          severity_level: string | null
          short_description: string
        }
        Insert: {
          advisory_title: string
          advisory_type: string
          created_at?: string | null
          detailed_content: string
          expiry_date?: string | null
          id?: number
          image_url?: string | null
          issue_date: string
          issuing_authority: string
          location: string
          severity_level?: string | null
          short_description: string
        }
        Update: {
          advisory_title?: string
          advisory_type?: string
          created_at?: string | null
          detailed_content?: string
          expiry_date?: string | null
          id?: number
          image_url?: string | null
          issue_date?: string
          issuing_authority?: string
          location?: string
          severity_level?: string | null
          short_description?: string
        }
        Relationships: []
      }
      analysis_videos: {
        Row: {
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          report_id: string | null
          status: string | null
          thumbnail_url: string | null
          upload_date: string | null
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          report_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          upload_date?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          report_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          upload_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_videos_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_videos_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "officer_report_materials"
            referencedColumns: ["report_id"]
          },
        ]
      }
      cases: {
        Row: {
          address: string
          case_date: string
          case_id: number
          case_number: string
          case_time: string
          case_type: string
          created_at: string | null
          description: string
          latitude: number | null
          longitude: number | null
          region: string
          reporter_id: string | null
          status: string | null
        }
        Insert: {
          address: string
          case_date: string
          case_id?: number
          case_number: string
          case_time: string
          case_type: string
          created_at?: string | null
          description: string
          latitude?: number | null
          longitude?: number | null
          region: string
          reporter_id?: string | null
          status?: string | null
        }
        Update: {
          address?: string
          case_date?: string
          case_id?: number
          case_number?: string
          case_time?: string
          case_type?: string
          created_at?: string | null
          description?: string
          latitude?: number | null
          longitude?: number | null
          region?: string
          reporter_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      crime_map_locations: {
        Row: {
          case_id: number | null
          created_at: string | null
          crime_type: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          title: string
          updated_at: string | null
        }
        Insert: {
          case_id?: number | null
          created_at?: string | null
          crime_type: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          title: string
          updated_at?: string | null
        }
        Update: {
          case_id?: number | null
          created_at?: string | null
          crime_type?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crime_map_locations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["case_id"]
          },
        ]
      }
      crime_report_analysis: {
        Row: {
          confidence: number
          created_at: string
          crime_type: string
          description: string
          id: string
          model_version: string | null
          report_id: string | null
        }
        Insert: {
          confidence: number
          created_at?: string
          crime_type: string
          description: string
          id?: string
          model_version?: string | null
          report_id?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          crime_type?: string
          description?: string
          id?: string
          model_version?: string | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crime_report_analysis_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crime_report_analysis_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "officer_report_materials"
            referencedColumns: ["report_id"]
          },
        ]
      }
      crime_reports: {
        Row: {
          description: string | null
          detailed_location: string | null
          id: string
          incident_date: string | null
          is_anonymous: boolean
          location: string | null
          officer_notes: string | null
          phone: string | null
          report_date: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          description?: string | null
          detailed_location?: string | null
          id?: string
          incident_date?: string | null
          is_anonymous?: boolean
          location?: string | null
          officer_notes?: string | null
          phone?: string | null
          report_date?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          description?: string | null
          detailed_location?: string | null
          id?: string
          incident_date?: string | null
          is_anonymous?: boolean
          location?: string | null
          officer_notes?: string | null
          phone?: string | null
          report_date?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      criminal_profiles: {
        Row: {
          additional_information: string | null
          age: number | null
          case_number: string
          charges: string
          created_at: string | null
          full_name: string
          height: number | null
          id: number
          last_known_location: string
          photo_url: string | null
          risk_level: string | null
          weight: number | null
        }
        Insert: {
          additional_information?: string | null
          age?: number | null
          case_number: string
          charges: string
          created_at?: string | null
          full_name: string
          height?: number | null
          id?: number
          last_known_location: string
          photo_url?: string | null
          risk_level?: string | null
          weight?: number | null
        }
        Update: {
          additional_information?: string | null
          age?: number | null
          case_number?: string
          charges?: string
          created_at?: string | null
          full_name?: string
          height?: number | null
          id?: number
          last_known_location?: string
          photo_url?: string | null
          risk_level?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      criminal_tips: {
        Row: {
          criminal_name: string | null
          criminal_photo: string | null
          description: string
          email: string | null
          id: number
          image_url: string | null
          is_anonymous: boolean | null
          location: string | null
          officer_action: string | null
          phone: string | null
          result: string | null
          status: string | null
          subject: string
          submitter_name: string | null
          tip_date: string | null
        }
        Insert: {
          criminal_name?: string | null
          criminal_photo?: string | null
          description: string
          email?: string | null
          id?: number
          image_url?: string | null
          is_anonymous?: boolean | null
          location?: string | null
          officer_action?: string | null
          phone?: string | null
          result?: string | null
          status?: string | null
          subject: string
          submitter_name?: string | null
          tip_date?: string | null
        }
        Update: {
          criminal_name?: string | null
          criminal_photo?: string | null
          description?: string
          email?: string | null
          id?: number
          image_url?: string | null
          is_anonymous?: boolean | null
          location?: string | null
          officer_action?: string | null
          phone?: string | null
          result?: string | null
          status?: string | null
          subject?: string
          submitter_name?: string | null
          tip_date?: string | null
        }
        Relationships: []
      }
      evidence: {
        Row: {
          description: string | null
          id: string
          report_id: string
          storage_path: string | null
          title: string | null
          type: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          report_id: string
          storage_path?: string | null
          title?: string | null
          type?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          report_id?: string
          storage_path?: string | null
          title?: string | null
          type?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "officer_report_materials"
            referencedColumns: ["report_id"]
          },
        ]
      }
      evidence_requests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          fir_number: string
          id: string
          incident_date: string
          location: string
          response_deadline: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          fir_number: string
          id?: string
          incident_date: string
          location: string
          response_deadline: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          fir_number?: string
          id?: string
          incident_date?: string
          location?: string
          response_deadline?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      evidence_responses: {
        Row: {
          contact_phone: string | null
          description: string
          file_url: string | null
          id: string
          is_anonymous: boolean | null
          officer_notes: string | null
          request_id: string
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
        }
        Insert: {
          contact_phone?: string | null
          description: string
          file_url?: string | null
          id?: string
          is_anonymous?: boolean | null
          officer_notes?: string | null
          request_id: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Update: {
          contact_phone?: string | null
          description?: string
          file_url?: string | null
          id?: string
          is_anonymous?: boolean | null
          officer_notes?: string | null
          request_id?: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "evidence_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_views: {
        Row: {
          evidence_id: string | null
          id: string
          officer_id: string | null
          view_complete: boolean
          view_date: string
        }
        Insert: {
          evidence_id?: string | null
          id?: string
          officer_id?: string | null
          view_complete?: boolean
          view_date?: string
        }
        Update: {
          evidence_id?: string | null
          id?: string
          officer_id?: string | null
          view_complete?: boolean
          view_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_views_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      face_detections: {
        Row: {
          confidence_score: number | null
          created_at: string
          detection_time: string
          face_coordinates: Json | null
          face_detected: boolean
          face_match: boolean | null
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detection_time?: string
          face_coordinates?: Json | null
          face_detected?: boolean
          face_match?: boolean | null
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detection_time?: string
          face_coordinates?: Json | null
          face_detected?: boolean
          face_match?: boolean | null
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "face_detections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "face_verification_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      face_verification_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          last_verification_time: string | null
          reference_face_url: string | null
          session_end: string | null
          session_start: string
          updated_at: string
          user_id: string
          verification_attempts: number | null
          verification_status: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          last_verification_time?: string | null
          reference_face_url?: string | null
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_id: string
          verification_attempts?: number | null
          verification_status?: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          last_verification_time?: string | null
          reference_face_url?: string | null
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_id?: string
          verification_attempts?: number | null
          verification_status?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          media_urls: string[] | null
          thread_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          media_urls?: string[] | null
          thread_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          media_urls?: string[] | null
          thread_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          media_urls: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          media_urls?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          media_urls?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      kyc_document_extractions: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          edited_data: Json | null
          extracted_data: Json | null
          id: string
          is_edited: boolean | null
          updated_at: string | null
          user_id: string | null
          verification_id: number | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          edited_data?: Json | null
          extracted_data?: Json | null
          id?: string
          is_edited?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          verification_id?: number | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          edited_data?: Json | null
          extracted_data?: Json | null
          id?: string
          is_edited?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          verification_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_document_extractions_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "kyc_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          extracted_data: Json | null
          id: string
          verification_id: number | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          extracted_data?: Json | null
          id?: string
          verification_id?: number | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          extracted_data?: Json | null
          id?: string
          verification_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "kyc_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          created_at: string | null
          edited_data: Json | null
          email: string
          extracted_data: Json | null
          full_name: string
          id: number
          id_back: string | null
          id_front: string | null
          is_data_edited: boolean | null
          ocr_status: string | null
          officer_action: string | null
          rejection_reason: string | null
          selfie: string | null
          status: string | null
          submission_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          edited_data?: Json | null
          email: string
          extracted_data?: Json | null
          full_name: string
          id?: number
          id_back?: string | null
          id_front?: string | null
          is_data_edited?: boolean | null
          ocr_status?: string | null
          officer_action?: string | null
          rejection_reason?: string | null
          selfie?: string | null
          status?: string | null
          submission_date: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          edited_data?: Json | null
          email?: string
          extracted_data?: Json | null
          full_name?: string
          id?: number
          id_back?: string | null
          id_front?: string | null
          is_data_edited?: boolean | null
          ocr_status?: string | null
          officer_action?: string | null
          rejection_reason?: string | null
          selfie?: string | null
          status?: string | null
          submission_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      officer_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          report_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          report_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "officer_report_materials"
            referencedColumns: ["report_id"]
          },
        ]
      }
      officer_profiles: {
        Row: {
          badge_number: string
          confirm_password: string
          department: string
          department_email: string
          full_name: string
          id: number
          password: string
          phone_number: string
        }
        Insert: {
          badge_number: string
          confirm_password: string
          department: string
          department_email: string
          full_name: string
          id?: number
          password: string
          phone_number: string
        }
        Update: {
          badge_number?: string
          confirm_password?: string
          department?: string
          department_email?: string
          full_name?: string
          id?: number
          password?: string
          phone_number?: string
        }
        Relationships: []
      }
      pdf_downloads: {
        Row: {
          download_date: string
          filename: string
          id: string
          officer_id: string | null
          report_id: string | null
          success: boolean
        }
        Insert: {
          download_date?: string
          filename: string
          id?: string
          officer_id?: string | null
          report_id?: string | null
          success?: boolean
        }
        Update: {
          download_date?: string
          filename?: string
          id?: string
          officer_id?: string | null
          report_id?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pdf_downloads_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_downloads_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "officer_report_materials"
            referencedColumns: ["report_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      report_pdfs: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_official: boolean | null
          report_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_official?: boolean | null
          report_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_official?: boolean | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_pdfs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_pdfs_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "officer_report_materials"
            referencedColumns: ["report_id"]
          },
        ]
      }
      report_shares: {
        Row: {
          id: string
          report_id: string
          share_type: string
          shared_at: string
          shared_to: string
        }
        Insert: {
          id?: string
          report_id: string
          share_type: string
          shared_at?: string
          shared_to: string
        }
        Update: {
          id?: string
          report_id?: string
          share_type?: string
          shared_at?: string
          shared_to?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          alert_id: string
          alert_type: string | null
          assigned_at: string | null
          contact_info: string | null
          contact_phone: string | null
          contact_user: boolean | null
          created_at: string | null
          device_info: Json | null
          dispatch_team: string | null
          latitude: number | null
          location: string
          longitude: number | null
          map_redirect_url: string | null
          message: string | null
          officer_id: number | null
          officer_notes: string | null
          reported_by: string
          reported_time: string
          status: string | null
          urgency_level: string | null
          voice_recording: string | null
        }
        Insert: {
          alert_id: string
          alert_type?: string | null
          assigned_at?: string | null
          contact_info?: string | null
          contact_phone?: string | null
          contact_user?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          dispatch_team?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          map_redirect_url?: string | null
          message?: string | null
          officer_id?: number | null
          officer_notes?: string | null
          reported_by: string
          reported_time: string
          status?: string | null
          urgency_level?: string | null
          voice_recording?: string | null
        }
        Update: {
          alert_id?: string
          alert_type?: string | null
          assigned_at?: string | null
          contact_info?: string | null
          contact_phone?: string | null
          contact_user?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          dispatch_team?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          map_redirect_url?: string | null
          message?: string | null
          officer_id?: number | null
          officer_notes?: string | null
          reported_by?: string
          reported_time?: string
          status?: string | null
          urgency_level?: string | null
          voice_recording?: string | null
        }
        Relationships: []
      }
      user_kyc_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          status: string
          user_id: string
          verification_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          status: string
          user_id: string
          verification_id: number
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          status?: string
          user_id?: string
          verification_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_kyc_notifications_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "kyc_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          report_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          report_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          report_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "officer_report_materials"
            referencedColumns: ["report_id"]
          },
        ]
      }
      video_analysis_queue: {
        Row: {
          created_at: string
          evidence_id: string | null
          id: string
          processed_at: string | null
          report_id: string | null
          status: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          evidence_id?: string | null
          id?: string
          processed_at?: string | null
          report_id?: string | null
          status?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          evidence_id?: string | null
          id?: string
          processed_at?: string | null
          report_id?: string | null
          status?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_analysis_queue_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_analysis_queue_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "crime_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_analysis_queue_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "officer_report_materials"
            referencedColumns: ["report_id"]
          },
        ]
      }
      voice_recordings: {
        Row: {
          alert_id: string | null
          created_at: string | null
          id: string
          recording_url: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string | null
          id?: string
          recording_url: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string | null
          id?: string
          recording_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_recordings_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "sos_alerts"
            referencedColumns: ["alert_id"]
          },
        ]
      }
    }
    Views: {
      officer_report_materials: {
        Row: {
          pdf_id: string | null
          pdf_is_official: boolean | null
          pdf_name: string | null
          pdf_url: string | null
          report_id: string | null
          report_status: string | null
          report_title: string | null
          user_id: string | null
          video_id: string | null
          video_name: string | null
          video_size: number | null
          video_status: string | null
          video_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      record_report_share: {
        Args: { p_report_id: string; p_shared_to: string; p_share_type: string }
        Returns: undefined
      }
      register_officer: {
        Args: {
          full_name: string
          badge_number: string
          department: string
          department_email: string
          phone_number: string
          password: string
          confirm_password: string
        }
        Returns: Json
      }
      update_analysis_video_status: {
        Args: { p_video_id: string; p_status: string }
        Returns: undefined
      }
      update_officer_report_materials: {
        Args: {
          p_report_id: string
          p_pdf_id?: string
          p_pdf_name?: string
          p_pdf_url?: string
          p_pdf_is_official?: boolean
          p_video_id?: string
          p_video_name?: string
          p_video_url?: string
          p_video_status?: string
          p_video_size?: number
          p_report_title?: string
          p_report_status?: string
          p_user_id?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
