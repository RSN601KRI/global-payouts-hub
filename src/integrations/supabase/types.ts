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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          business_id: string
          created_at: string
          created_by: string | null
          hashed_key: string
          id: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: string[]
        }
        Insert: {
          business_id: string
          created_at?: string
          created_by?: string | null
          hashed_key: string
          id?: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: string[]
        }
        Update: {
          business_id?: string
          created_at?: string
          created_by?: string | null
          hashed_key?: string
          id?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          business_id: string
          id: string
          invited_email: string | null
          joined_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          id?: string
          invited_email?: string | null
          joined_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          id?: string
          invited_email?: string | null
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          country: string | null
          created_at: string
          default_currency: string
          id: string
          kyc_approved_at: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at: string | null
          legal_name: string | null
          name: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          default_currency?: string
          id?: string
          kyc_approved_at?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at?: string | null
          legal_name?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          default_currency?: string
          id?: string
          kyc_approved_at?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          kyc_submitted_at?: string | null
          legal_name?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      monitoring_events: {
        Row: {
          business_id: string | null
          category: string
          created_at: string
          details: Json | null
          id: string
          message: string
          payout_id: string | null
          resolved: boolean
          severity: string
        }
        Insert: {
          business_id?: string | null
          category: string
          created_at?: string
          details?: Json | null
          id?: string
          message: string
          payout_id?: string | null
          resolved?: boolean
          severity?: string
        }
        Update: {
          business_id?: string | null
          category?: string
          created_at?: string
          details?: Json | null
          id?: string
          message?: string
          payout_id?: string | null
          resolved?: boolean
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_events_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_schedules: {
        Row: {
          business_id: string
          cadence: string
          created_at: string
          currency: string
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string
          rail: Database["public"]["Enums"]["payout_rail"]
          recipient_amounts: Json
          status: Database["public"]["Enums"]["schedule_status"]
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          cadence: string
          created_at?: string
          currency?: string
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at: string
          rail?: Database["public"]["Enums"]["payout_rail"]
          recipient_amounts?: Json
          status?: Database["public"]["Enums"]["schedule_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          cadence?: string
          created_at?: string
          currency?: string
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string
          rail?: Database["public"]["Enums"]["payout_rail"]
          recipient_amounts?: Json
          status?: Database["public"]["Enums"]["schedule_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_schedules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          business_id: string
          completed_at: string | null
          created_at: string
          currency: string
          external_reference: string | null
          failure_reason: string | null
          fee_amount: number | null
          id: string
          initiated_by: string | null
          memo: string | null
          metadata: Json | null
          rail: Database["public"]["Enums"]["payout_rail"]
          recipient_id: string | null
          resolved_rail: Database["public"]["Enums"]["payout_rail"] | null
          schedule_id: string | null
          source: string
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          business_id: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_reference?: string | null
          failure_reason?: string | null
          fee_amount?: number | null
          id?: string
          initiated_by?: string | null
          memo?: string | null
          metadata?: Json | null
          rail?: Database["public"]["Enums"]["payout_rail"]
          recipient_id?: string | null
          resolved_rail?: Database["public"]["Enums"]["payout_rail"] | null
          schedule_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_reference?: string | null
          failure_reason?: string | null
          fee_amount?: number | null
          id?: string
          initiated_by?: string | null
          memo?: string | null
          metadata?: Json | null
          rail?: Database["public"]["Enums"]["payout_rail"]
          recipient_id?: string | null
          resolved_rail?: Database["public"]["Enums"]["payout_rail"] | null
          schedule_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_business_id: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_business_id?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_business_id?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_business_id_fkey"
            columns: ["current_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      recipients: {
        Row: {
          archived: boolean
          bank_currency: string | null
          bank_details: Json | null
          business_id: string
          country: string | null
          created_at: string
          email: string | null
          id: string
          metadata: Json | null
          name: string
          payout_method: Database["public"]["Enums"]["recipient_method"]
          tags: string[] | null
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          archived?: boolean
          bank_currency?: string | null
          bank_details?: Json | null
          business_id: string
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name: string
          payout_method?: Database["public"]["Enums"]["recipient_method"]
          tags?: string[] | null
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          archived?: boolean
          bank_currency?: string | null
          bank_details?: Json | null
          business_id?: string
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          payout_method?: Database["public"]["Enums"]["recipient_method"]
          tags?: string[] | null
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          currency: string
          id: string
          network: string | null
          payout_id: string | null
          rail: Database["public"]["Enums"]["payout_rail"]
          raw_response: Json | null
          status: string
          tx_signature: string | null
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          currency: string
          id?: string
          network?: string | null
          payout_id?: string | null
          rail: Database["public"]["Enums"]["payout_rail"]
          raw_response?: Json | null
          status: string
          tx_signature?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          currency?: string
          id?: string
          network?: string | null
          payout_id?: string | null
          rail?: Database["public"]["Enums"]["payout_rail"]
          raw_response?: Json | null
          status?: string
          tx_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance_sol: number | null
          balance_usdc: number | null
          business_id: string
          created_at: string
          encrypted_secret: string
          id: string
          is_default: boolean
          label: string
          network: string
          public_key: string
          updated_at: string
        }
        Insert: {
          balance_sol?: number | null
          balance_usdc?: number | null
          business_id: string
          created_at?: string
          encrypted_secret: string
          id?: string
          is_default?: boolean
          label?: string
          network?: string
          public_key: string
          updated_at?: string
        }
        Update: {
          balance_sol?: number | null
          balance_usdc?: number | null
          business_id?: string
          created_at?: string
          encrypted_secret?: string
          id?: string
          is_default?: boolean
          label?: string
          network?: string
          public_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          events: string[]
          id: string
          signing_secret: string
          url: string
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          events?: string[]
          id?: string
          signing_secret: string
          url: string
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          events?: string[]
          id?: string
          signing_secret?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempts: number
          business_id: string
          created_at: string
          delivered_at: string | null
          delivery_status: string
          endpoint_id: string | null
          event_type: string
          id: string
          payload: Json
          response_code: number | null
        }
        Insert: {
          attempts?: number
          business_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          endpoint_id?: string | null
          event_type: string
          id?: string
          payload: Json
          response_code?: number | null
        }
        Update: {
          attempts?: number
          business_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          endpoint_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_events_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _business_id: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _business_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_business_member: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "finance" | "viewer"
      kyc_status: "pending" | "in_review" | "approved" | "rejected"
      payout_rail: "solana_usdc" | "dodo_fiat" | "auto"
      payout_status:
        | "draft"
        | "queued"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      recipient_method: "crypto_wallet" | "bank_transfer" | "auto"
      schedule_status: "active" | "paused" | "archived"
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
      app_role: ["admin", "finance", "viewer"],
      kyc_status: ["pending", "in_review", "approved", "rejected"],
      payout_rail: ["solana_usdc", "dodo_fiat", "auto"],
      payout_status: [
        "draft",
        "queued",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      recipient_method: ["crypto_wallet", "bank_transfer", "auto"],
      schedule_status: ["active", "paused", "archived"],
    },
  },
} as const
