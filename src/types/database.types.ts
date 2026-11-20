export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			goals: {
				Row: {
					assist_by_id: string | null;
					created_at: string;
					id: string;
					match_id: string;
					minute: number;
					player_id: string;
				};
				ComputedFields: never;
				Insert: {
					assist_by_id?: string | null;
					created_at?: string;
					id?: string;
					match_id: string;
					minute: number;
					player_id: string;
				};
				Update: {
					assist_by_id?: string | null;
					created_at?: string;
					id?: string;
					match_id?: string;
					minute?: number;
					player_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "goals_assist_by_id_fkey";
						columns: ["assist_by_id"];
						isOneToOne: false;
						referencedRelation: "players";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "goals_match_id_fkey";
						columns: ["match_id"];
						isOneToOne: false;
						referencedRelation: "matches";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "goals_player_id_fkey";
						columns: ["player_id"];
						isOneToOne: false;
						referencedRelation: "players";
						referencedColumns: ["id"];
					},
				];
			};
			match_players: {
				Row: {
					created_at: string;
					id: string;
					match_id: string;
					player_id: string;
					team: string;
				};
				ComputedFields: never;
				Insert: {
					created_at?: string;
					id?: string;
					match_id: string;
					player_id: string;
					team: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					match_id?: string;
					player_id?: string;
					team?: string;
				};
				Relationships: [
					{
						foreignKeyName: "match_players_match_id_fkey";
						columns: ["match_id"];
						isOneToOne: false;
						referencedRelation: "matches";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "match_players_player_id_fkey";
						columns: ["player_id"];
						isOneToOne: false;
						referencedRelation: "players";
						referencedColumns: ["id"];
					},
				];
			};
			matches: {
				Row: {
					created_at: string;
					date: string;
					goals: NonNullable<Json>;
					id: string;
					season_id: string | null;
					team_a_score: number;
					team_b_score: number;
					team_id: string;
				};
				ComputedFields: never;
				Insert: {
					created_at?: string;
					date: string;
					goals?: NonNullable<Json>;
					id?: string;
					season_id?: string | null;
					team_a_score?: number;
					team_b_score?: number;
					team_id: string;
				};
				Update: {
					created_at?: string;
					date?: string;
					goals?: NonNullable<Json>;
					id?: string;
					season_id?: string | null;
					team_a_score?: number;
					team_b_score?: number;
					team_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "matches_season_id_fkey";
						columns: ["season_id"];
						isOneToOne: false;
						referencedRelation: "seasons";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "matches_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			players: {
				Row: {
					assists: number;
					avatar_path: string | null;
					created_at: string;
					goals: number;
					id: string;
					losses: number;
					matches: number;
					name: string;
					season_id: string | null;
					team_id: string;
					wins: number;
				};
				ComputedFields: never;
				Insert: {
					assists?: number;
					avatar_path?: string | null;
					created_at?: string;
					goals?: number;
					id?: string;
					losses?: number;
					matches?: number;
					name: string;
					season_id?: string | null;
					team_id: string;
					wins?: number;
				};
				Update: {
					assists?: number;
					avatar_path?: string | null;
					created_at?: string;
					goals?: number;
					id?: string;
					losses?: number;
					matches?: number;
					name?: string;
					season_id?: string | null;
					team_id?: string;
					wins?: number;
				};
				Relationships: [
					{
						foreignKeyName: "players_season_id_fkey";
						columns: ["season_id"];
						isOneToOne: false;
						referencedRelation: "seasons";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "players_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			seasons: {
				Row: {
					created_at: string;
					end_date: string | null;
					id: string;
					name: string;
					start_date: string;
					team_id: string;
				};
				ComputedFields: never;
				Insert: {
					created_at?: string;
					end_date?: string | null;
					id?: string;
					name: string;
					start_date: string;
					team_id: string;
				};
				Update: {
					created_at?: string;
					end_date?: string | null;
					id?: string;
					name?: string;
					start_date?: string;
					team_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "seasons_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: false;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			settings: {
				Row: {
					created_at: string;
					key: string;
					value: number;
				};
				ComputedFields: never;
				Insert: {
					created_at?: string;
					key: string;
					value: number;
				};
				Update: {
					created_at?: string;
					key?: string;
					value?: number;
				};
				Relationships: [];
			};
			team_player_counts: {
				Row: {
					player_count: number;
					team_id: string;
				};
				ComputedFields: never;
				Insert: {
					player_count: number;
					team_id: string;
				};
				Update: {
					player_count?: number;
					team_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "team_player_counts_team_id_fkey";
						columns: ["team_id"];
						isOneToOne: true;
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			teams: {
				Row: {
					admin_code: string;
					code: string;
					created_at: string;
					email: string | null;
					id: string;
					name: string;
				};
				ComputedFields: never;
				Insert: {
					admin_code: string;
					code: string;
					created_at?: string;
					email?: string | null;
					id?: string;
					name: string;
				};
				Update: {
					admin_code?: string;
					code?: string;
					created_at?: string;
					email?: string | null;
					id?: string;
					name?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
