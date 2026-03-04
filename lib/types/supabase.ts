export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_notes: {
        Row: {
          application_id: string
          author_id: string
          created_at: string
          id: string
          note: string
          visibility: Database["public"]["Enums"]["note_visibility"]
        }
        Insert: {
          application_id: string
          author_id: string
          created_at?: string
          id?: string
          note: string
          visibility?: Database["public"]["Enums"]["note_visibility"]
        }
        Update: {
          application_id?: string
          author_id?: string
          created_at?: string
          id?: string
          note?: string
          visibility?: Database["public"]["Enums"]["note_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_by: string
          created_at: string
          from_status: Database["public"]["Enums"]["application_status"] | null
          id: string
          note: string | null
          reverted: boolean
          reverted_by: string | null
          to_status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          application_id: string
          changed_by: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["application_status"] | null
          id?: string
          note?: string | null
          reverted?: boolean
          reverted_by?: string | null
          to_status: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          application_id?: string
          changed_by?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["application_status"] | null
          id?: string
          note?: string | null
          reverted?: boolean
          reverted_by?: string | null
          to_status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_status_history_reverted_by_fkey"
            columns: ["reverted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          counselor_id: string | null
          created_at: string
          documents: Json | null
          id: string
          program_id: string
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          submitted_at: string | null
          university_id: string
          updated_at: string
          user_downloads: Json | null
        }
        Insert: {
          counselor_id?: string | null
          created_at?: string
          documents?: Json | null
          id?: string
          program_id: string
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          submitted_at?: string | null
          university_id: string
          updated_at?: string
          user_downloads?: Json | null
        }
        Update: {
          counselor_id?: string | null
          created_at?: string
          documents?: Json | null
          id?: string
          program_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          submitted_at?: string | null
          university_id?: string
          updated_at?: string
          user_downloads?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_counselor_id_fkey"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_id: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          name_en: string
          region: string | null
          slug: string
        }
        Insert: {
          country_id: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name_en: string
          region?: string | null
          slug: string
        }
        Update: {
          country_id?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name_en?: string
          region?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          claimed_by_id: string | null
          counselor_id: string | null
          created_at: string
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          claimed_by_id?: string | null
          counselor_id?: string | null
          created_at?: string
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          claimed_by_id?: string | null
          counselor_id?: string | null
          created_at?: string
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_claimed_by_id_fkey"
            columns: ["claimed_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_counselor_id_fkey"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          created_at: string
          description: string | null
          flag_url: string | null
          id: string
          name_en: string
          name_local: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          flag_url?: string | null
          id?: string
          name_en: string
          name_local?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          flag_url?: string | null
          id?: string
          name_en?: string
          name_local?: string | null
          slug?: string
        }
        Relationships: []
      }
      inbox_events: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_system: boolean
          sender_id: string
          sender_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_system?: boolean
          sender_id: string
          sender_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_system?: boolean
          sender_id?: string
          sender_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          accepts_minors: boolean | null
          accepts_students_in_china: boolean | null
          application_deadline: string | null
          application_fee_amount: number | null
          application_fee_currency: string | null
          created_at: string
          degree_level: Database["public"]["Enums"]["degree_level"]
          description: string | null
          document_requirements: Json | null
          duration: string | null
          eligibility: Json | null
          estimated_living_cost: number | null
          estimated_living_currency: string | null
          featured_order: number | null
          id: string
          intake_season: Database["public"]["Enums"]["intake_season"] | null
          intake_year: number | null
          is_featured: boolean
          is_scholarship_program: boolean | null
          is_self_funded: boolean | null
          language: Database["public"]["Enums"]["teaching_language"]
          name_en: string
          name_local: string | null
          scholarship_duration: string | null
          scholarship_type:
            | Database["public"]["Enums"]["scholarship_type"]
            | null
          slug: string
          subject_area_id: string | null
          tuition_after_scholarship: number | null
          tuition_currency: string | null
          tuition_original: number | null
          tuition_per: string | null
          university_id: string
          updated_at: string
        }
        Insert: {
          accepts_minors?: boolean | null
          accepts_students_in_china?: boolean | null
          application_deadline?: string | null
          application_fee_amount?: number | null
          application_fee_currency?: string | null
          created_at?: string
          degree_level: Database["public"]["Enums"]["degree_level"]
          description?: string | null
          document_requirements?: Json | null
          duration?: string | null
          eligibility?: Json | null
          estimated_living_cost?: number | null
          estimated_living_currency?: string | null
          featured_order?: number | null
          id?: string
          intake_season?: Database["public"]["Enums"]["intake_season"] | null
          intake_year?: number | null
          is_featured?: boolean
          is_scholarship_program?: boolean | null
          is_self_funded?: boolean | null
          language?: Database["public"]["Enums"]["teaching_language"]
          name_en: string
          name_local?: string | null
          scholarship_duration?: string | null
          scholarship_type?:
            | Database["public"]["Enums"]["scholarship_type"]
            | null
          slug: string
          subject_area_id?: string | null
          tuition_after_scholarship?: number | null
          tuition_currency?: string | null
          tuition_original?: number | null
          tuition_per?: string | null
          university_id: string
          updated_at?: string
        }
        Update: {
          accepts_minors?: boolean | null
          accepts_students_in_china?: boolean | null
          application_deadline?: string | null
          application_fee_amount?: number | null
          application_fee_currency?: string | null
          created_at?: string
          degree_level?: Database["public"]["Enums"]["degree_level"]
          description?: string | null
          document_requirements?: Json | null
          duration?: string | null
          eligibility?: Json | null
          estimated_living_cost?: number | null
          estimated_living_currency?: string | null
          featured_order?: number | null
          id?: string
          intake_season?: Database["public"]["Enums"]["intake_season"] | null
          intake_year?: number | null
          is_featured?: boolean
          is_scholarship_program?: boolean | null
          is_self_funded?: boolean | null
          language?: Database["public"]["Enums"]["teaching_language"]
          name_en?: string
          name_local?: string | null
          scholarship_duration?: string | null
          scholarship_type?:
            | Database["public"]["Enums"]["scholarship_type"]
            | null
          slug?: string
          subject_area_id?: string | null
          tuition_after_scholarship?: number | null
          tuition_currency?: string | null
          tuition_original?: number | null
          tuition_per?: string | null
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_subject_area_id_fkey"
            columns: ["subject_area_id"]
            isOneToOne: false
            referencedRelation: "subject_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string
          documents: Json | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          documents?: Json | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          education_history: Json | null
          family_info: Json | null
          first_name: string | null
          gender: string | null
          has_visited_china: boolean | null
          id: string
          in_china_now: boolean | null
          last_name: string | null
          marital_status: string | null
          mother_tongue: string | null
          nationality: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone_number: string | null
          religion: string | null
          updated_at: string
          whatsapp_number: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_history?: Json | null
          family_info?: Json | null
          first_name?: string | null
          gender?: string | null
          has_visited_china?: boolean | null
          id: string
          in_china_now?: boolean | null
          last_name?: string | null
          marital_status?: string | null
          mother_tongue?: string | null
          nationality?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone_number?: string | null
          religion?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_history?: Json | null
          family_info?: Json | null
          first_name?: string | null
          gender?: string | null
          has_visited_china?: boolean | null
          id?: string
          in_china_now?: boolean | null
          last_name?: string | null
          marital_status?: string | null
          mother_tongue?: string | null
          nationality?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone_number?: string | null
          religion?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      subject_areas: {
        Row: {
          created_at: string
          id: string
          name_en: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          accommodation_currency: string | null
          accommodation_double_room: number | null
          accommodation_single_room: number | null
          advantages_html: string | null
          albums: Json | null
          city_id: string
          country_specific_data: Json | null
          cover_image_url: string | null
          created_at: string
          featured_order: number | null
          id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_featured: boolean
          level: string | null
          logo_url: string | null
          majors_count: number | null
          name_en: string
          name_local: string | null
          profile_html: string | null
          profile_text: string | null
          qs_rank: number | null
          qs_rank_year: number | null
          scholarship_policy_html: string | null
          self_financed_available: boolean | null
          shanghai_rank: number | null
          shanghai_rank_year: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          accommodation_currency?: string | null
          accommodation_double_room?: number | null
          accommodation_single_room?: number | null
          advantages_html?: string | null
          albums?: Json | null
          city_id: string
          country_specific_data?: Json | null
          cover_image_url?: string | null
          created_at?: string
          featured_order?: number | null
          id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          is_featured?: boolean
          level?: string | null
          logo_url?: string | null
          majors_count?: number | null
          name_en: string
          name_local?: string | null
          profile_html?: string | null
          profile_text?: string | null
          qs_rank?: number | null
          qs_rank_year?: number | null
          scholarship_policy_html?: string | null
          self_financed_available?: boolean | null
          shanghai_rank?: number | null
          shanghai_rank_year?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          accommodation_currency?: string | null
          accommodation_double_room?: number | null
          accommodation_single_room?: number | null
          advantages_html?: string | null
          albums?: Json | null
          city_id?: string
          country_specific_data?: Json | null
          cover_image_url?: string | null
          created_at?: string
          featured_order?: number | null
          id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          is_featured?: boolean
          level?: string | null
          logo_url?: string | null
          majors_count?: number | null
          name_en?: string
          name_local?: string | null
          profile_html?: string | null
          profile_text?: string | null
          qs_rank?: number | null
          qs_rank_year?: number | null
          scholarship_policy_html?: string | null
          self_financed_available?: boolean | null
          shanghai_rank?: number | null
          shanghai_rank_year?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "universities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_inbox_events: { Args: never; Returns: undefined }
      create_notification: {
        Args: {
          p_body: string
          p_link?: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: undefined
      }
      get_admin_dashboard: { Args: { p_weeks?: number }; Returns: Json }
      get_total_unread_count: { Args: { p_user_id: string }; Returns: number }
      get_unread_count: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: number
      }
      get_unread_counts: {
        Args: { p_conversation_ids: string[]; p_user_id: string }
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      mark_messages_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: undefined
      }
      search_admin_applications: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_status?: string
        }
        Returns: Json
      }
      search_counselor_applications: {
        Args: {
          p_counselor_id: string
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_status?: string
        }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      student_has_counselor: {
        Args: { counselor_id: string }
        Returns: boolean
      }
      undo_last_application_status: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      update_application_status: {
        Args: {
          p_application_id: string
          p_new_status: Database["public"]["Enums"]["application_status"]
          p_note?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      application_status:
        | "draft"
        | "submitted"
        | "reviewing"
        | "approved"
        | "action_required"
        | "application_fee_pending"
        | "application_fee_paid"
        | "applied_to_university"
        | "admission_success"
        | "admission_failure"
        | "offer_letter"
        | "ecp_fee_pending"
        | "ecp_fee_paid"
        | "jw_form_received"
        | "visa_docs_ready"
        | "visa_granted"
        | "visa_rejected"
        | "rejected"
        | "dropped_off"
        | "withdrawn"
        | "closed"
      degree_level:
        | "bachelor"
        | "master"
        | "doctoral"
        | "non_degree"
        | "upgrade"
      institution_type: "public" | "private"
      intake_season: "spring" | "summer" | "autumn"
      note_visibility: "public" | "private"
      notification_type:
        | "new_student"
        | "application_created"
        | "application_submitted"
        | "status_changed"
        | "counselor_assigned"
        | "document_status_changed"
        | "admin_upload"
        | "note_added"
      scholarship_type:
        | "self_financed"
        | "type_a"
        | "type_b"
        | "type_c"
        | "type_d"
        | "full"
        | "partial"
      teaching_language: "chinese" | "english" | "chinese_english_bilingual"
      user_role: "student" | "counselor" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "draft",
        "submitted",
        "reviewing",
        "approved",
        "action_required",
        "application_fee_pending",
        "application_fee_paid",
        "applied_to_university",
        "admission_success",
        "admission_failure",
        "offer_letter",
        "ecp_fee_pending",
        "ecp_fee_paid",
        "jw_form_received",
        "visa_docs_ready",
        "visa_granted",
        "visa_rejected",
        "rejected",
        "dropped_off",
        "withdrawn",
        "closed",
      ],
      degree_level: ["bachelor", "master", "doctoral", "non_degree", "upgrade"],
      institution_type: ["public", "private"],
      intake_season: ["spring", "summer", "autumn"],
      note_visibility: ["public", "private"],
      notification_type: [
        "new_student",
        "application_created",
        "application_submitted",
        "status_changed",
        "counselor_assigned",
        "document_status_changed",
        "admin_upload",
        "note_added",
      ],
      scholarship_type: [
        "self_financed",
        "type_a",
        "type_b",
        "type_c",
        "type_d",
        "full",
        "partial",
      ],
      teaching_language: ["chinese", "english", "chinese_english_bilingual"],
      user_role: ["student", "counselor", "admin"],
    },
  },
} as const
