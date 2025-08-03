export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      collection_kits: {
        Row: {
          brand: string | null;
          created_at: string | null;
          is_public: boolean;
          kit_code: string;
          name: string;
          storage_path: string;
          updated_at: string | null;
          year: string | null;
        };
        Insert: {
          brand?: string | null;
          created_at?: string | null;
          is_public?: boolean;
          kit_code: string;
          name: string;
          storage_path: string;
          updated_at?: string | null;
          year?: string | null;
        };
        Update: {
          brand?: string | null;
          created_at?: string | null;
          is_public?: boolean;
          kit_code?: string;
          name?: string;
          storage_path?: string;
          updated_at?: string | null;
          year?: string | null;
        };
        Relationships: [];
      };
      collection_update_logs: {
        Row: {
          collection_id: string | null;
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          error_stack: string | null;
          id: string;
          metadata: Json;
          operation_type: Database["public"]["Enums"]["collection_update_operation_type"];
          started_at: string;
          status: Database["public"]["Enums"]["collection_update_status"];
          user_id: string | null;
        };
        Insert: {
          collection_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          error_stack?: string | null;
          id?: string;
          metadata?: Json;
          operation_type: Database["public"]["Enums"]["collection_update_operation_type"];
          started_at?: string;
          status: Database["public"]["Enums"]["collection_update_status"];
          user_id?: string | null;
        };
        Update: {
          collection_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          error_stack?: string | null;
          id?: string;
          metadata?: Json;
          operation_type?: Database["public"]["Enums"]["collection_update_operation_type"];
          started_at?: string;
          status?: Database["public"]["Enums"]["collection_update_status"];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "collection_update_logs_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_update_logs_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections_with_stats";
            referencedColumns: ["id"];
          },
        ];
      };
      collection_updates: {
        Row: {
          collection_id: string | null;
          created_at: string | null;
          id: string;
          plan_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          collection_id?: string | null;
          created_at?: string | null;
          id?: string;
          plan_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          collection_id?: string | null;
          created_at?: string | null;
          id?: string;
          plan_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "collection_updates_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_updates_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections_with_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_updates_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          collection_limit: number;
          has_3d_viewer: boolean;
          has_advanced_analytics: boolean;
          id: string;
          imported_collection_limit: number;
          name: string;
          personal_collection_limit: number;
          price_cents: number;
          price_update_frequency: string;
          stock_inventory_limit: number;
          stripe_price_id: string;
        };
        Insert: {
          collection_limit: number;
          has_3d_viewer?: boolean;
          has_advanced_analytics?: boolean;
          id?: string;
          imported_collection_limit: number;
          name: string;
          personal_collection_limit: number;
          price_cents: number;
          price_update_frequency: string;
          stock_inventory_limit: number;
          stripe_price_id: string;
        };
        Update: {
          collection_limit?: number;
          has_3d_viewer?: boolean;
          has_advanced_analytics?: boolean;
          id?: string;
          imported_collection_limit?: number;
          name?: string;
          personal_collection_limit?: number;
          price_cents?: number;
          price_update_frequency?: string;
          stock_inventory_limit?: number;
          stripe_price_id?: string;
        };
        Relationships: [];
      };
      user_collection_items: {
        Row: {
          collection_id: string | null;
          created_at: string | null;
          id: string;
          image_url: string | null;
          in_personal_collection: boolean;
          market_price: number | null;
          name: string;
          rarity: string | null;
          source_item_id: string | null;
          tcgplayer_id: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          collection_id?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          in_personal_collection?: boolean;
          market_price?: number | null;
          name: string;
          rarity?: string | null;
          source_item_id?: string | null;
          tcgplayer_id?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          collection_id?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          in_personal_collection?: boolean;
          market_price?: number | null;
          name?: string;
          rarity?: string | null;
          source_item_id?: string | null;
          tcgplayer_id?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_collection_items_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_collection_items_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections_with_stats";
            referencedColumns: ["id"];
          },
        ];
      };
      user_collection_stock: {
        Row: {
          certification_id: string | null;
          cogs: number;
          condition: string;
          created_at: string | null;
          grade: string | null;
          grader: string | null;
          id: string;
          images: string[] | null;
          item_id: string;
          note: string | null;
          quantity: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          certification_id?: string | null;
          cogs: number;
          condition?: string;
          created_at?: string | null;
          grade?: string | null;
          grader?: string | null;
          id?: string;
          images?: string[] | null;
          item_id: string;
          note?: string | null;
          quantity?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          certification_id?: string | null;
          cogs?: number;
          condition?: string;
          created_at?: string | null;
          grade?: string | null;
          grader?: string | null;
          id?: string;
          images?: string[] | null;
          item_id?: string;
          note?: string | null;
          quantity?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_collection_stock_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "user_collection_items";
            referencedColumns: ["id"];
          },
        ];
      };
      user_collections: {
        Row: {
          brand: string | null;
          created_at: string | null;
          id: string;
          image_url: string | null;
          name: string;
          parent_collection_id: string | null;
          plan_id: string | null;
          rarities: Json | null;
          source: Database["public"]["Enums"]["collection_source"];
          source_id: string | null;
          user_id: string | null;
          year: string | null;
        };
        Insert: {
          brand?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          parent_collection_id?: string | null;
          plan_id?: string | null;
          rarities?: Json | null;
          source?: Database["public"]["Enums"]["collection_source"];
          source_id?: string | null;
          user_id?: string | null;
          year?: string | null;
        };
        Update: {
          brand?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          parent_collection_id?: string | null;
          plan_id?: string | null;
          rarities?: Json | null;
          source?: Database["public"]["Enums"]["collection_source"];
          source_id?: string | null;
          user_id?: string | null;
          year?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_collections_parent_collection_id_fkey";
            columns: ["parent_collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_collections_parent_collection_id_fkey";
            columns: ["parent_collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections_with_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_collections_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          created_at: string | null;
          email_notifications: boolean | null;
          id: string;
          is_admin: boolean | null;
          notifications_enabled: boolean | null;
          push_notifications: boolean | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          email_notifications?: boolean | null;
          id?: string;
          is_admin?: boolean | null;
          notifications_enabled?: boolean | null;
          push_notifications?: boolean | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          email_notifications?: boolean | null;
          id?: string;
          is_admin?: boolean | null;
          notifications_enabled?: boolean | null;
          push_notifications?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string | null;
          current_period_end: string | null;
          id: string;
          plan_id: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          id?: string;
          plan_id: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          id?: string;
          plan_id?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      user_collections_with_stats: {
        Row: {
          brand: string | null;
          created_at: string | null;
          id: string | null;
          image_url: string | null;
          name: string | null;
          parent_collection_id: string | null;
          personal_collection_count: number | null;
          personal_collection_market_value: number | null;
          plan_id: string | null;
          rarities: Json | null;
          source_id: string | null;
          stock_cost: number | null;
          stock_items: number | null;
          total_items: number | null;
          total_market_value: number | null;
          user_id: string | null;
          year: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_collections_parent_collection_id_fkey";
            columns: ["parent_collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_collections_parent_collection_id_fkey";
            columns: ["parent_collection_id"];
            isOneToOne: false;
            referencedRelation: "user_collections_with_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_collections_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      get_pending_collection_updates: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          user_id: string;
          collection_id: string;
          plan_id: string;
        }[];
      };
    };
    Enums: {
      collection_kit_status: "active" | "deprecated" | "updating";
      collection_source: "user" | "kit";
      collection_update_operation_type:
        | "price_update"
        | "new_items"
        | "new_collection"
        | "error";
      collection_update_status: "started" | "completed" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

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
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

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
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
