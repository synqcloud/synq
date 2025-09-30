export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      core_card_prices: {
        Row: {
          cardmarket_price: number | null
          core_card_id: string
          tcgplayer_price: number | null
        }
        Insert: {
          cardmarket_price?: number | null
          core_card_id: string
          tcgplayer_price?: number | null
        }
        Update: {
          cardmarket_price?: number | null
          core_card_id?: string
          tcgplayer_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "core_card_prices_core_card_id_fkey"
            columns: ["core_card_id"]
            isOneToOne: true
            referencedRelation: "core_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      core_cards: {
        Row: {
          collector_number: string | null
          core_library_id: string
          core_set_id: string
          created_at: string | null
          external_id: string | null
          external_source: string | null
          id: string
          image_url: string | null
          name: string
          price_key: string | null
          rarity: string | null
          tcgplayer_id: string | null
          updated_at: string | null
        }
        Insert: {
          collector_number?: string | null
          core_library_id: string
          core_set_id: string
          created_at?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_key?: string | null
          rarity?: string | null
          tcgplayer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          collector_number?: string | null
          core_library_id?: string
          core_set_id?: string
          created_at?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_key?: string | null
          rarity?: string | null
          tcgplayer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "core_cards_core_library_id_fkey"
            columns: ["core_library_id"]
            isOneToOne: false
            referencedRelation: "core_libraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "core_cards_core_set_id_fkey"
            columns: ["core_set_id"]
            isOneToOne: false
            referencedRelation: "core_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      core_libraries: {
        Row: {
          created_at: string | null
          description: string | null
          external_id: string | null
          external_source: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          external_source?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      core_sets: {
        Row: {
          core_library_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          release_date: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          core_library_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          release_date?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          core_library_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          release_date?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "core_sets_core_library_id_fkey"
            columns: ["core_library_id"]
            isOneToOne: false
            referencedRelation: "core_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_processing_queue: {
        Row: {
          attempts: number | null
          core_card_id: string | null
          created_date: string | null
          id: string
          processed_at: string | null
          status: string | null
        }
        Insert: {
          attempts?: number | null
          core_card_id?: string | null
          created_date?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          attempts?: number | null
          core_card_id?: string | null
          created_date?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_processing_queue_core_card_id_fkey"
            columns: ["core_card_id"]
            isOneToOne: false
            referencedRelation: "core_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          core_card_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          marketplace_id: string | null
          message: string | null
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          stock_id: string | null
          user_id: string
        }
        Insert: {
          core_card_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          marketplace_id?: string | null
          message?: string | null
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          stock_id?: string | null
          user_id: string
        }
        Update: {
          core_card_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          marketplace_id?: string | null
          message?: string | null
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          stock_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_core_card_id_fkey"
            columns: ["core_card_id"]
            isOneToOne: false
            referencedRelation: "core_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_marketplace_id_fkey"
            columns: ["marketplace_id"]
            isOneToOne: false
            referencedRelation: "marketplaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "user_card_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      user_card_price_alerts: {
        Row: {
          core_card_id: string
          user_id: string
        }
        Insert: {
          core_card_id: string
          user_id: string
        }
        Update: {
          core_card_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_card_price_alerts_core_card_id_fkey"
            columns: ["core_card_id"]
            isOneToOne: false
            referencedRelation: "core_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_card_stock: {
        Row: {
          cogs: number | null
          condition: string | null
          core_card_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          language: string
          location: string | null
          quantity: number
          sku: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cogs?: number | null
          condition?: string | null
          core_card_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string
          location?: string | null
          quantity?: number
          sku?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cogs?: number | null
          condition?: string | null
          core_card_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string
          location?: string | null
          quantity?: number
          sku?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_card_stock_core_card_id_fkey"
            columns: ["core_card_id"]
            isOneToOne: false
            referencedRelation: "core_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_library_access: {
        Row: {
          core_library_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          core_library_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          core_library_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_library_access_core_library_id_fkey"
            columns: ["core_library_id"]
            isOneToOne: false
            referencedRelation: "core_libraries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          onboarding_completed: boolean
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          id?: string
          onboarding_completed?: boolean
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          onboarding_completed?: boolean
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_stock_listings: {
        Row: {
          created_at: string | null
          external_id: string | null
          id: string
          listed_price: number | null
          marketplace_id: string
          stock_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          listed_price?: number | null
          marketplace_id: string
          stock_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          listed_price?: number | null
          marketplace_id?: string
          stock_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stock_listings_marketplace_id_fkey"
            columns: ["marketplace_id"]
            isOneToOne: false
            referencedRelation: "marketplaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stock_listings_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "user_card_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_transaction: {
        Row: {
          created_at: string
          id: string
          is_integration: boolean
          net_amount: number | null
          performed_by: string | null
          shipping_amount: number | null
          source: string | null
          subtotal_amount: number | null
          tax_amount: number | null
          transaction_status: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_integration?: boolean
          net_amount?: number | null
          performed_by?: string | null
          shipping_amount?: number | null
          source?: string | null
          subtotal_amount?: number | null
          tax_amount?: number | null
          transaction_status: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_integration?: boolean
          net_amount?: number | null
          performed_by?: string | null
          shipping_amount?: number | null
          source?: string | null
          subtotal_amount?: number | null
          tax_amount?: number | null
          transaction_status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_transaction_items: {
        Row: {
          created_at: string
          id: string
          quantity: number
          stock_id: string
          transaction_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          quantity: number
          stock_id: string
          transaction_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          stock_id?: string
          transaction_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_transaction_items_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "user_card_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "user_transaction"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_transaction_items_with_cards: {
        Row: {
          card_name: string | null
          cogs: number | null
          condition: string | null
          core_card_id: string | null
          game_name: string | null
          item_id: string | null
          language: string | null
          location: string | null
          quantity: number | null
          set_name: string | null
          sku: string | null
          stock_id: string | null
          transaction_id: string | null
          unit_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_card_stock_core_card_id_fkey"
            columns: ["core_card_id"]
            isOneToOne: false
            referencedRelation: "core_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_transaction_items_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "user_card_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "user_transaction"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_card_stock: {
        Args: { p_core_card_id?: string; p_user_id: string }
        Returns: {
          card_name: string
          cogs: number
          condition: string
          core_card_id: string
          language: string
          library_name: string
          location: string
          marketplaces: string[]
          quantity: number
          set_name: string
          sku: string
          stock_id: string
        }[]
      }
      get_user_cards_with_stock: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search_query?: string
          p_set_id?: string
          p_sort_by?: string
          p_stock_filter?: string
          p_user_id: string
        }
        Returns: {
          collector_number: string
          core_library_name: string
          core_set_name: string
          id: string
          image_url: string
          name: string
          rarity: string
          stock: number
          tcgplayer_id: string
          tcgplayer_price: number
        }[]
      }
      get_user_libraries_with_stock: {
        Args: {
          p_library_ids: string[]
          p_limit?: number
          p_offset?: number
          p_stock_filter?: string
          p_user_id: string
        }
        Returns: {
          id: string
          name: string
          stock: number
        }[]
      }
      get_user_marketplaces: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_user_price_alerts_batch: {
        Args: { p_card_ids: string[] }
        Returns: {
          core_card_id: string
        }[]
      }
      get_user_sales_dashboard: {
        Args: { p_months?: number; p_user_id: string }
        Returns: {
          monthly: Json
          top_stock: Json
        }[]
      }
      get_user_sets_with_stock: {
        Args: {
          p_library_id: string
          p_limit?: number
          p_offset?: number
          p_stock_filter?: string
          p_user_id: string
        }
        Returns: {
          id: string
          is_upcoming: boolean
          name: string
          stock: number
        }[]
      }
      get_user_transactions: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_offset?: number
          p_sources?: string[]
          p_start_date?: string
          p_statuses?: Database["public"]["Enums"]["transaction_status"][]
          p_types?: Database["public"]["Enums"]["transaction_type"][]
          p_user_id: string
        }
        Returns: {
          created_at: string
          id: string
          is_integration: boolean
          net_amount: number
          performed_by: string
          shipping_amount: number
          source: string
          subtotal_amount: number
          tax_amount: number
          total_quantity: number
          transaction_status: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }[]
      }
      perform_stock_transaction: {
        Args: {
          p_change_type: string
          p_marketplace?: string
          p_net_amount?: number
          p_performed_by?: string
          p_quantity_change?: number
          p_quantity_new?: number
          p_shipping_amount?: number
          p_stock_id: string
          p_tax_amount?: number
          p_unit_price?: number
        }
        Returns: {
          discrepancy: boolean
          quantity_after: number
          quantity_before: number
          transaction_id: string
        }[]
      }
      user_has_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      notification_type: "discrepancy_stock" | "price_alert"
      subscription_status: "trialing" | "active" | "canceled" | "past_due"
      transaction_status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
      transaction_type: "sale" | "purchase"
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
      notification_type: ["discrepancy_stock", "price_alert"],
      subscription_status: ["trialing", "active", "canceled", "past_due"],
      transaction_status: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      transaction_type: ["sale", "purchase"],
    },
  },
} as const

