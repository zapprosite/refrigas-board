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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity: string
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity: string
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity?: string
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          segment: Database["public"]["Enums"]["client_segment"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          segment?: Database["public"]["Enums"]["client_segment"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          segment?: Database["public"]["Enums"]["client_segment"] | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          source: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      materials_checklist: {
        Row: {
          created_at: string
          done: boolean
          id: string
          item: string
          os_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          item: string
          os_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          item?: string
          os_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_checklist_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          created_at: string
          id: string
          os_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          os_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          os_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      processes_checklist: {
        Row: {
          created_at: string
          done: boolean
          id: string
          os_id: string
          step: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          os_id: string
          step: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          os_id?: string
          step?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_checklist_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          google_email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          google_email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          google_email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: string | null
          created_at: string
          id: string
          os_id: string
          pdf_path: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          os_id: string
          pdf_path?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          os_id?: string
          pdf_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: true
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          assignee: string | null
          client_id: string
          created_at: string
          day: string
          id: string
          os_number: string
          status: Database["public"]["Enums"]["service_status"]
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          client_id: string
          created_at?: string
          day: string
          id?: string
          os_number: string
          status?: Database["public"]["Enums"]["service_status"]
          type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          client_id?: string
          created_at?: string
          day?: string
          id?: string
          os_number?: string
          status?: Database["public"]["Enums"]["service_status"]
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          fields: Json | null
          id: string
          logo_url: string | null
          segment: Database["public"]["Enums"]["client_segment"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          fields?: Json | null
          id?: string
          logo_url?: string | null
          segment: Database["public"]["Enums"]["client_segment"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          fields?: Json | null
          id?: string
          logo_url?: string | null
          segment?: Database["public"]["Enums"]["client_segment"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "Admin" | "Secretary" | "Collaborator"
      client_segment: "HVAC-R" | "Electrical"
      service_status: "todo" | "doing" | "done" | "green"
      service_type: "HVAC-R" | "Electrical"
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
      app_role: ["Admin", "Secretary", "Collaborator"],
      client_segment: ["HVAC-R", "Electrical"],
      service_status: ["todo", "doing", "done", "green"],
      service_type: ["HVAC-R", "Electrical"],
    },
  },
} as const
