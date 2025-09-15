export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          matches: number
          wins: number
          losses: number
          goals: number
          assists: number
          season_id: string | null
          team_id: string | null
        }
        Insert: {
          id?: string
          name: string
          matches?: number
          wins?: number
          losses?: number
          goals?: number
          assists?: number
          season_id?: string | null
          team_id?: string
        }
        Update: {
          id?: string
          name?: string
          matches?: number
          wins?: number
          losses?: number
          goals?: number
          assists?: number
          season_id?: string | null
          team_id?: string
        }
      }
      matches: {
        Row: {
          id: string
          date: string
          season_id: string | null
          team_a_score: number
          team_b_score: number
          team_id: string | null
        }
        Insert: {
          id?: string
          date: string
          season_id?: string | null
          team_a_score: number
          team_b_score: number
          team_id?: string
        }
        Update: {
          id?: string
          date?: string
          season_id?: string | null
          team_a_score?: number
          team_b_score?: number
          team_id?: string
        }
      }
      match_players: {
        Row: {
          id: string
          match_id: string
          player_id: string
          team: 'A' | 'B'
          team_id: string | null
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          team: 'A' | 'B'
          team_id?: string
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          team?: 'A' | 'B'
          team_id?: string
        }
      }
      goals: {
        Row: {
          id: string
          match_id: string
          player_id: string
          assist_by_id: string | null
          minute: number
          team_id: string | null
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          assist_by_id?: string | null
          minute: number
          team_id?: string
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          assist_by_id?: string | null
          minute?: number
          team_id?: string
        }
      }
      seasons: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string | null
          team_id: string | null
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date?: string | null
          team_id?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string | null
          team_id?: string
        }
      }
      settings: {
        Row: {
          key: string
          value: number
          team_id: string | null
        }
        Insert: {
          key: string
          value: number
          team_id?: string
        }
        Update: {
          key?: string
          value?: number
          team_id?: string
        }
      }
    }
  }
}
