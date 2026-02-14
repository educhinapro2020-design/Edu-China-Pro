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
  public: {
    Tables: {
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
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
          cover_image_url: string | null
          created_at: string
          degree_level: Database["public"]["Enums"]["degree_level"]
          detail_images: Json | null
          duration: string | null
          eligibility: Json | null
          estimated_living_cost: number | null
          estimated_living_currency: string | null
          id: string
          intake_season: Database["public"]["Enums"]["intake_season"] | null
          intake_year: number | null
          is_scholarship_program: boolean | null
          is_self_funded: boolean | null
          language: Database["public"]["Enums"]["teaching_language"]
          name_en: string
          name_local: string | null
          scholarship_duration: string | null
          scholarship_memo: string | null
          scholarship_policy_html: string | null
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
          cover_image_url?: string | null
          created_at?: string
          degree_level: Database["public"]["Enums"]["degree_level"]
          detail_images?: Json | null
          duration?: string | null
          eligibility?: Json | null
          estimated_living_cost?: number | null
          estimated_living_currency?: string | null
          id?: string
          intake_season?: Database["public"]["Enums"]["intake_season"] | null
          intake_year?: number | null
          is_scholarship_program?: boolean | null
          is_self_funded?: boolean | null
          language?: Database["public"]["Enums"]["teaching_language"]
          name_en: string
          name_local?: string | null
          scholarship_duration?: string | null
          scholarship_memo?: string | null
          scholarship_policy_html?: string | null
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
          cover_image_url?: string | null
          created_at?: string
          degree_level?: Database["public"]["Enums"]["degree_level"]
          detail_images?: Json | null
          duration?: string | null
          eligibility?: Json | null
          estimated_living_cost?: number | null
          estimated_living_currency?: string | null
          id?: string
          intake_season?: Database["public"]["Enums"]["intake_season"] | null
          intake_year?: number | null
          is_scholarship_program?: boolean | null
          is_self_funded?: boolean | null
          language?: Database["public"]["Enums"]["teaching_language"]
          name_en?: string
          name_local?: string | null
          scholarship_duration?: string | null
          scholarship_memo?: string | null
          scholarship_policy_html?: string | null
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
          id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          level: string | null
          logo_url: string | null
          majors_count: number | null
          name_en: string
          name_local: string | null
          profile_html: string | null
          profile_text: string | null
          qs_rank: number | null
          qs_rank_year: number | null
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
          id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          level?: string | null
          logo_url?: string | null
          majors_count?: number | null
          name_en: string
          name_local?: string | null
          profile_html?: string | null
          profile_text?: string | null
          qs_rank?: number | null
          qs_rank_year?: number | null
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
          id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          level?: string | null
          logo_url?: string | null
          majors_count?: number | null
          name_en?: string
          name_local?: string | null
          profile_html?: string | null
          profile_text?: string | null
          qs_rank?: number | null
          qs_rank_year?: number | null
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      degree_level:
        | "bachelor"
        | "master"
        | "doctoral"
        | "non_degree"
        | "upgrade"
      institution_type: "public" | "private"
      intake_season: "spring" | "summer" | "autumn"
      scholarship_type:
        | "self_financed"
        | "type_a"
        | "type_b"
        | "type_c"
        | "type_d"
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
  public: {
    Enums: {
      degree_level: ["bachelor", "master", "doctoral", "non_degree", "upgrade"],
      institution_type: ["public", "private"],
      intake_season: ["spring", "summer", "autumn"],
      scholarship_type: [
        "self_financed",
        "type_a",
        "type_b",
        "type_c",
        "type_d",
      ],
      teaching_language: ["chinese", "english", "chinese_english_bilingual"],
      user_role: ["student", "counselor", "admin"],
    },
  },
} as const
