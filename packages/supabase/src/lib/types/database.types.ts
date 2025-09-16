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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
          stock_audit_id: string | null
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
          stock_audit_id?: string | null
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
          stock_audit_id?: string | null
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
            foreignKeyName: "notifications_stock_audit_id_fkey"
            columns: ["stock_audit_id"]
            isOneToOne: false
            referencedRelation: "stock_audit_log"
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
      stock_audit_log: {
        Row: {
          change_type: string
          created_at: string | null
          id: string
          performed_by: string | null
          quantity_after: number
          quantity_before: number
          stock_id: string
          user_id: string
        }
        Insert: {
          change_type: string
          created_at?: string | null
          id?: string
          performed_by?: string | null
          quantity_after: number
          quantity_before: number
          stock_id: string
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string | null
          id?: string
          performed_by?: string | null
          quantity_after?: number
          quantity_before?: number
          stock_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_audit_log_stock_id_fkey"
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
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
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
      user_stock_updates: {
        Row: {
          created_at: string
          id: string
          note: string | null
          quantity_change: number
          stock_id: string
          update_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          quantity_change: number
          stock_id: string
          update_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          quantity_change?: number
          stock_id?: string
          update_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stock_updates_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "user_card_stock"
            referencedColumns: ["id"]
          },
        ]
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
        Args: {
          p_core_card_id: string
        }
        Returns: {
          stock_id: string
          quantity: number
          condition: string
          cogs: number
          sku: string
          location: string
          language: string
          updated_at: string
          marketplaces: string[]
          marketplace_prices: Json
        }[]
      }
      get_user_marketplaces: {
        Args: {
          p_user_id: string
        }
        Returns: string[]
      }
      get_user_sales_dashboard: {
        Args: {
          p_user_id: string
          p_months?: number
        }
        Returns: {
          monthly: Json
          top_stock: Json
        }[]
      }
      get_user_transactions: {
        Args: {
          p_user_id: string
          p_start_date?: string
          p_end_date?: string
          p_statuses?: Database["public"]["Enums"]["transaction_status"][]
          p_types?: Database["public"]["Enums"]["transaction_type"][]
        }
        Returns: {
          id: string
          user_id: string
          transaction_status: Database["public"]["Enums"]["transaction_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          performed_by: string
          source: string
          subtotal_amount: number
          tax_amount: number
          shipping_amount: number
          net_amount: number
          is_integration: boolean
          created_at: string
          total_quantity: number
        }[]
      }
      perform_stock_transaction: {
        Args: {
          p_stock_id: string
          p_change_type: string
          p_quantity_change?: number
          p_quantity_new?: number
          p_performed_by?: string
          p_unit_price?: number
          p_marketplace?: string
          p_tax_amount?: number
          p_shipping_amount?: number
          p_net_amount?: number
        }
        Returns: {
          quantity_before: number
          quantity_after: number
          discrepancy: boolean
          transaction_id: string
        }[]
      }
      search_cards: {
        Args: {
          search_query: string
        }
        Returns: {
          id: string
          name: string
          core_set_name: string
          core_library_name: string
          stock: number
        }[]
      }
    }
    Enums: {
      notification_type:
        | "discrepancy_stock"
        | "price_update_suggestion"
        | "price_alert"
        | "general_alert"
      transaction_status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
      transaction_type: "sale" | "purchase" | "grading_submit" | "refund"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

