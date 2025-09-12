export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null
          name: string | null
          stripe_customer_id: string | null
          subscription_plan: string | null
          tasks_limit: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          name?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          tasks_limit?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          name?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          tasks_limit?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string | null
          due_date: string | null
          image_url: string | null
          label: string | null
          rank: number | null
          task_id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          image_url?: string | null
          label?: string | null
          rank?: number | null
          task_id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: boolean | null
          description?: string | null
          due_date?: string | null
          image_url?: string | null
          label?: string | null
          rank?: number | null
          task_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          tasks_created: number | null
          user_id: string
          year_month: string
        }
        Insert: {
          tasks_created?: number | null
          user_id: string
          year_month: string
        }
        Update: {
          tasks_created?: number | null
          user_id?: string
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables'] & keyof PublicSchema['Views']> = PublicSchema['Tables'][T]['Row']

export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']