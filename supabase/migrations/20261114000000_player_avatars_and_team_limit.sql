ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS avatar_path text;

CREATE TABLE IF NOT EXISTS public.team_player_counts (
	team_id uuid PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
	player_count integer NOT NULL CHECK (player_count >= 0)
);

INSERT INTO public.team_player_counts (team_id, player_count)
SELECT team_id, count(*)::integer
FROM public.players
GROUP BY team_id
ON CONFLICT (team_id) DO UPDATE
SET player_count = EXCLUDED.player_count;

REVOKE ALL ON TABLE public.team_player_counts FROM PUBLIC;
REVOKE ALL ON TABLE public.team_player_counts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.enforce_player_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
	current_count integer;
BEGIN
	IF TG_OP = 'DELETE' THEN
		UPDATE public.team_player_counts
		SET player_count = player_count - 1
		WHERE team_id = OLD.team_id;
		RETURN OLD;
	END IF;

	IF TG_OP = 'UPDATE' AND NEW.team_id IS NOT DISTINCT FROM OLD.team_id THEN
		RETURN NEW;
	END IF;

	INSERT INTO public.team_player_counts AS counts (team_id, player_count)
	VALUES (NEW.team_id, 1)
	ON CONFLICT (team_id) DO UPDATE
	SET player_count = counts.player_count + 1
	WHERE counts.player_count < 100
	RETURNING counts.player_count INTO current_count;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'El equipo ya tiene el máximo de 100 jugadores'
			USING ERRCODE = 'check_violation';
	END IF;

	IF TG_OP = 'UPDATE' THEN
		UPDATE public.team_player_counts
		SET player_count = player_count - 1
		WHERE team_id = OLD.team_id;
	END IF;

	RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_player_limit() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_player_limit() FROM anon, authenticated;

DROP TRIGGER IF EXISTS players_limit_per_team ON public.players;
CREATE TRIGGER players_limit_per_team
BEFORE INSERT OR UPDATE OR DELETE ON public.players
FOR EACH ROW EXECUTE FUNCTION public.enforce_player_limit();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
	'player-avatars',
	'player-avatars',
	true,
	2097152,
	ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
	public = EXCLUDED.public,
	file_size_limit = EXCLUDED.file_size_limit,
	allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view player avatars" ON storage.objects;
CREATE POLICY "Public can view player avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'player-avatars');

DROP POLICY IF EXISTS "Teams can upload player avatars" ON storage.objects;
CREATE POLICY "Teams can upload player avatars"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
	bucket_id = 'player-avatars'
	AND EXISTS (
		SELECT 1 FROM public.players p
		WHERE storage.objects.name = p.id::text || '/avatar'
	)
);

DROP POLICY IF EXISTS "Teams can update player avatars" ON storage.objects;
CREATE POLICY "Teams can update player avatars"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (
	bucket_id = 'player-avatars'
	AND EXISTS (
		SELECT 1 FROM public.players p
		WHERE storage.objects.name = p.id::text || '/avatar'
	)
)
WITH CHECK (
	bucket_id = 'player-avatars'
	AND EXISTS (
		SELECT 1 FROM public.players p
		WHERE storage.objects.name = p.id::text || '/avatar'
	)
);

DROP POLICY IF EXISTS "Teams can delete player avatars" ON storage.objects;
CREATE POLICY "Teams can delete player avatars"
ON storage.objects FOR DELETE TO anon, authenticated
USING (
	bucket_id = 'player-avatars'
	AND EXISTS (
		SELECT 1 FROM public.players p
		WHERE storage.objects.name = p.id::text || '/avatar'
	)
);
