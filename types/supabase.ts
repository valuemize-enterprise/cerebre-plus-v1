// ═══════════════════════════════════════════════════════════════
// /types/supabase.ts
// Supabase Database type definitions.
// Run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID`
// to regenerate this file from your live schema.
// This stub allows TypeScript to compile until you run codegen.
// ═══════════════════════════════════════════════════════════════

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          business_name: string | null;
          industry: string | null;
          city: string | null;
          country: string | null;
          years_in_business: number | null;
          description: string | null;
          unique_advantage: string | null;
          target_customer: string | null;
          brand_voice: string | null;
          language_preference: string | null;
          primary_cta: string | null;
          price_range: string | null;
          social_proof: string | null;
          logo_url: string | null;
          brand_colour: string | null;
          whatsapp: string | null;
          phone: string | null;
          email_contact: string | null;
          address: string | null;
          business_hours: string | null;
          instagram: string | null;
          facebook: string | null;
          linkedin: string | null;
          tiktok: string | null;
          marketing_challenges: Json | null;
          profile_completeness_score: number | null;
          onboarding_complete: boolean;
          magic_moment_completed: boolean;
          notification_preferences: Json | null   // ← add this
          founding_member: boolean;
          plan_tier: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_tier: string;
          status: string;
          paystack_customer_id: string | null;
          paystack_subscription_code: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
      coin_balances: {
        Row: {
          user_id: string;
          balance: number;
          updated_at: string;
          last_allocated_at: string | null;
          lifetime_earned: number;
        };
        Insert: { user_id: string; balance: number };
        Update: {
          balance?: number;
          updated_at?: string;
          last_allocated_at?: string;
          lifetime_earned?: number;
        };
      };
      coin_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          tool_id: string | null;
          generation_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["coin_transactions"]["Row"],
          "id" | "created_at"
        >;
        Update: never;
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          tool_id: string;
          tool_name: string;
          inputs: Json;
          output: string | null;
          status: string;
          coin_cost: number;
          tokens_used: number | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["generations"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["generations"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["notifications"]["Row"],
          "id" | "created_at"
        >;
        Update: { is_read?: boolean };
      };
      saved_library: {
        Row: {
          id: string;
          user_id: string;
          generation_id: string;
          collection: string;
          note: string | null;
          created_at: string;
          generations?: Database["public"]["Tables"]["generations"]["Row"];
        };
        Insert: Omit<
          Database["public"]["Tables"]["saved_library"]["Row"],
          "id" | "created_at"
        >;
        Update: { collection?: string; note?: string };
      };
      share_tokens: {
        Row: {
          id: string;
          token: string;
          generation_id: string | null;
          user_id: string;
          collection: string | null;
          expires_at: string | null;
          created_at: string;
          generations?: Database["public"]["Tables"]["generations"]["Row"] & {
            profiles?: Database["public"]["Tables"]["profiles"]["Row"];
          };
        };
        Insert: Omit<
          Database["public"]["Tables"]["share_tokens"]["Row"],
          "id" | "created_at"
        >;
        Update: never;
      };
      waitlist: {
        Row: {
          id: string;
          first_name: string;
          email: string;
          source: string | null;
          invited: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["waitlist"]["Row"],
          "id" | "created_at" | "invited"
        >;
        Update: { invited?: boolean };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_email: string;
          referred_user_id: string | null;
          status: string;
          coins_awarded: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["referrals"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["referrals"]["Row"]>;
      };
      milestones: {
        Row: {
          id: string;
          user_id: string;
          milestone_label: string;
          achieved_at: string;
          celebration_shown: boolean;
          celebrated_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["milestones"]["Row"],
          "id" | "achieved_at"
        > & { id?: string; achieved_at?: string };
        Update: Partial<Database["public"]["Tables"]["milestones"]["Row"]>;
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      deduct_coins: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_tool_id: string;
          p_generation_id: string | null;
        };
        Returns: boolean;
      };
      refund_coins: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_tool_id: string;
          p_generation_id: string | null;
        };
        Returns: boolean;
      };
      get_profile_completeness: {
        Args: { p_user_id: string };
        Returns: number;
      };
      credit_coins: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type?: string;
          p_description?: string;
        };
        Returns: boolean;
      };

      check_and_award_milestone: {
        Args: {
          p_user_id: string;
          p_milestone_key: string;
          p_milestone_label: string;
        };
        Returns: string | null;
      };
      allocate_monthly_coins: {
        Args: {
          p_user_id: string;
          p_plan_tier: string;
          p_coins: number;
        };
        Returns: void;
      };
      get_user_referral_code: {
        Args: { p_user_id: string };
        Returns: string;
      };
      process_referral_conversion: {
        Args: { p_referred_user_id: string };
        Returns: void;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
