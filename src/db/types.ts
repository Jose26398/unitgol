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
      players: {
        Row: {
          id: string;
          name: string;
          matches: number;
          wins: number;
          losses: number;
          goals: number;
          assists: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["players"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
      };
      matches: {
        Row: {
          id: string;
          date: string;
          season_id: string | null;
          team_a_score: number;
          team_b_score: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["matches"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
      };
      match_players: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          team: "A" | "B";
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["match_players"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["match_players"]["Insert"]
        >;
      };
      goals: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          assist_by_id: string | null;
          minute: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["goals"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["seasons"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["seasons"]["Insert"]>;
      };
      settings: {
        Row: {
          key: string;
          value: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["settings"]["Row"],
          "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
  };
}
