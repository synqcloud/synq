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
      core_cards: {
        Row: {
          core_library_id: string
          core_set_id: string
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          rarity: string | null
          updated_at: string | null
        }
        Insert: {
          core_library_id: string
          core_set_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          rarity?: string | null
          updated_at?: string | null
        }
        Update: {
          core_library_id?: string
          core_set_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          rarity?: string | null
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
      user_card_listings: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          last_synced_at: string | null
          listed_price: number | null
          listed_quantity: number
          listing_url: string | null
          marketplace: Database["public"]["Enums"]["marketplace_type"]
          marketplace_listing_id: string | null
          stock_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          last_synced_at?: string | null
          listed_price?: number | null
          listed_quantity: number
          listing_url?: string | null
          marketplace: Database["public"]["Enums"]["marketplace_type"]
          marketplace_listing_id?: string | null
          stock_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          last_synced_at?: string | null
          listed_price?: number | null
          listed_quantity?: number
          listing_url?: string | null
          marketplace?: Database["public"]["Enums"]["marketplace_type"]
          marketplace_listing_id?: string | null
          stock_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_card_listings_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "user_card_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      user_card_stock: {
        Row: {
          cogs: number | null
          condition: string
          core_card_id: string
          created_at: string | null
          estimated_value: number | null
          grading: string | null
          id: string
          is_active: boolean | null
          language: string | null
          location: string | null
          notes: string | null
          quantity: number
          sku: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cogs?: number | null
          condition?: string
          core_card_id: string
          created_at?: string | null
          estimated_value?: number | null
          grading?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          location?: string | null
          notes?: string | null
          quantity?: number
          sku?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cogs?: number | null
          condition?: string
          core_card_id?: string
          created_at?: string | null
          estimated_value?: number | null
          grading?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          location?: string | null
          notes?: string | null
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
            referencedRelation: "user_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_transactions: {
        Row: {
          created_at: string
          id: string
          is_integration: boolean
          net_amount: number | null
          performed_by: string | null
          source: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_integration?: boolean
          net_amount?: number | null
          performed_by?: string | null
          source?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_integration?: boolean
          net_amount?: number | null
          performed_by?: string | null
          source?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_transaction_items_with_cards: {
        Row: {
          card_name: string | null
          core_card_id: string | null
          item_id: string | null
          quantity: number | null
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
            referencedRelation: "user_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      marketplace_type: "CardTrader" | "TCGplayer" | "eBay"
      transaction_type:
        | "BUY"
        | "SELL"
        | "STOCK_MOVEMENT"
        | "MARKETPLACE_LISTING"
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

