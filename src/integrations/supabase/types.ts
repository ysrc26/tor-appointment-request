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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          business_id: string | null
          client_name: string
          client_phone: string
          client_verified: boolean | null
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          note: string | null
          service_id: string | null
          start_time: string | null
          status: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          client_name: string
          client_phone: string
          client_verified?: boolean | null
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          note?: string | null
          service_id?: string | null
          start_time?: string | null
          status?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          client_name?: string
          client_phone?: string
          client_verified?: boolean | null
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          note?: string | null
          service_id?: string | null
          start_time?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          business_id: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_link: string | null
          phone: string | null
          profile_image_path: string | null
          profile_image_updated_at: string | null
          profile_image_url: string | null
          profile_pic: string | null
          slug: string
          terms: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_link?: string | null
          phone?: string | null
          profile_image_path?: string | null
          profile_image_updated_at?: string | null
          profile_image_url?: string | null
          profile_pic?: string | null
          slug: string
          terms?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_link?: string | null
          phone?: string | null
          profile_image_path?: string | null
          profile_image_updated_at?: string | null
          profile_image_url?: string | null
          profile_pic?: string | null
          slug?: string
          terms?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          id: string
          name: string
          notes: string | null
          phone: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          notes?: string | null
          phone: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          id: string
          method: string
          otp_code: string
          phone: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          method: string
          otp_code: string
          phone: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          method?: string
          otp_code?: string
          phone?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      services: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price: number | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      unavailable_dates: {
        Row: {
          business_id: string | null
          date: string
          description: string | null
          id: string
          tag: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          date: string
          description?: string | null
          id?: string
          tag?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          date?: string
          description?: string | null
          id?: string
          tag?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unavailable_dates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unavailable_dates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          booking_advance_limit: string
          created_at: string | null
          default_calendar_view: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_advance_limit?: string
          created_at?: string | null
          default_calendar_view?: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_advance_limit?: string
          created_at?: string | null
          default_calendar_view?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string
          profile_pic: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone: string
          profile_pic?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          profile_pic?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
