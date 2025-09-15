export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string
          created_at: string
          date: string
          goals: Json
          season_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          date: string
          goals: Json
          season_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          date?: string
          goals?: Json
          season_id?: string | null
          user_id?: string
        }
      }
      players: {
        Row: {
          id: string
          created_at: string
          name: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          user_id?: string
        }
      }
      seasons: {
        Row: {
          id: string
          created_at: string
          name: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          user_id?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          default_season_id: string | null
          team_size: number
          theme: 'light' | 'dark'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          default_season_id?: string | null
          team_size?: number
          theme?: 'light' | 'dark'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          default_season_id?: string | null
          team_size?: number
          theme?: 'light' | 'dark'
          created_at?: string
        }
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
  }
}
