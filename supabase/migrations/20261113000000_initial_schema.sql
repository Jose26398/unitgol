CREATE TABLE public.teams (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name text NOT NULL UNIQUE,
	code text NOT NULL,
	admin_code text NOT NULL,
	email text,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.seasons (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name text NOT NULL,
	start_date date NOT NULL,
	end_date date,
	team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.players (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name text NOT NULL,
	matches integer NOT NULL DEFAULT 0,
	wins integer NOT NULL DEFAULT 0,
	losses integer NOT NULL DEFAULT 0,
	goals integer NOT NULL DEFAULT 0,
	assists integer NOT NULL DEFAULT 0,
	season_id uuid REFERENCES public.seasons(id) ON DELETE SET NULL,
	team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.matches (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	date timestamptz NOT NULL,
	season_id uuid REFERENCES public.seasons(id) ON DELETE SET NULL,
	team_a_score integer NOT NULL DEFAULT 0,
	team_b_score integer NOT NULL DEFAULT 0,
	goals jsonb NOT NULL DEFAULT '[]'::jsonb,
	team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.match_players (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
	player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
	team text NOT NULL CHECK (team IN ('A', 'B')),
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.goals (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
	player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
	assist_by_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
	minute integer NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.settings (
	key text PRIMARY KEY,
	value integer NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);
