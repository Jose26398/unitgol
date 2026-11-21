import { LayoutGrid, Shuffle, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ShareButton } from "@/components/ui/ShareButton";
import { NewsCard } from "@/features/news/components/NewsCard";
import { createTeamNews, type UnitGolNews } from "@/features/news/utils/news";
import { usePlayerScore } from "@/features/settings/SettingsContext";
import type { Match, Player } from "@/types";
import {
  calculateEloRatings,
  getEloRating,
  type RatingMode,
} from "@/utils/elo";
import { generateBalancedTeams } from "@/utils/playerStats";
import { PlayerSelector } from "./PlayerSelector";
import { SoccerPitchView } from "./SoccerPitchView";
import { TeamBalance } from "./TeamBalance";
import { TeamDisplay } from "./TeamDisplay";

interface TeamGeneratorProps {
  players: Player[];
  matches: Match[];
  seasonId: string | null;
  teamName?: string;
  ratingMode: RatingMode;
}

export function TeamGenerator({
  players,
  matches,
  seasonId,
  teamName,
  ratingMode,
}: TeamGeneratorProps) {
  const calculateScore = usePlayerScore();
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<{
    teamA: Player[];
    teamB: Player[];
  } | null>(null);
  const [news, setNews] = useState<UnitGolNews | null>(null);
  const [displayMode, setDisplayMode] = useState<"pitch" | "cards">("pitch");

  const eloRatings = useMemo(
    () =>
      ratingMode === "elo" ? calculateEloRatings(matches, seasonId) : null,
    [matches, seasonId, ratingMode],
  );

  const handleTogglePlayer = (player: Player) => {
    setSelectedPlayers((prev) =>
      prev.some((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player],
    );
  };

  const getPlayerValue = (player: Player) =>
    ratingMode === "elo"
      ? getEloRating(eloRatings, player.id)
      : calculateScore(player);
  const getTeamValue = (team: Player[]) =>
    team.reduce((total, player) => total + getPlayerValue(player), 0);

  const handleGenerateTeams = () => {
    if (selectedPlayers.length < 2) {
      alert("Selecciona al menos dos jugadores para generar equipos.");
      return;
    }
    const generatedTeams = generateBalancedTeams(
      selectedPlayers,
      getPlayerValue,
    );
    const teamAValue = getTeamValue(generatedTeams.teamA);
    const teamBValue = getTeamValue(generatedTeams.teamB);

    setTeams(generatedTeams);
    setNews(
      createTeamNews(teamAValue, teamBValue, {
        teamAPlayers: generatedTeams.teamA,
        teamBPlayers: generatedTeams.teamB,
        previousMatches: matches,
        seasonId,
      }),
    );
  };

  return (
    <div className="ui-enter ui-surface bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-semibold">Generador de Equipos</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Selecciona los jugadores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {players.map((player) => (
            <PlayerSelector
              key={player.id}
              player={player}
              isSelected={selectedPlayers.some((p) => p.id === player.id)}
              onToggle={handleTogglePlayer}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500" aria-live="polite">
            {selectedPlayers.length} de {players.length} jugadores seleccionados
          </p>
          <button
            type="button"
            onClick={handleGenerateTeams}
            disabled={selectedPlayers.length < 2}
            className="ui-action group flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4 transition-transform duration-200 motion-safe:group-hover:rotate-12" />
            {teams ? "Volver a generar" : "Generar equipos"}
          </button>
        </div>
      </div>

      {teams && (
        <div className="ui-enter space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 pt-6">
            <fieldset
              aria-label="Vista de los equipos"
              className="inline-flex self-start rounded-lg border border-slate-200 bg-slate-100 p-1"
            >
              <button
                type="button"
                onClick={() => setDisplayMode("pitch")}
                aria-pressed={displayMode === "pitch"}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  displayMode === "pitch"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Vista Campo
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("cards")}
                aria-pressed={displayMode === "cards"}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  displayMode === "cards"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Vista Tarjetas
              </button>
            </fieldset>
            <ShareButton
              teams={teams}
              seasonId={seasonId}
              matches={matches}
              ratingMode={ratingMode}
              variant="secondary"
            />
          </div>

          <TeamBalance
            teamAScore={getTeamValue(teams.teamA)}
            teamBScore={getTeamValue(teams.teamB)}
            ratingMode={ratingMode}
          />

          {displayMode === "pitch" ? (
            <SoccerPitchView
              teamAPlayers={teams.teamA}
              teamBPlayers={teams.teamB}
              ratingMode={ratingMode}
              eloRatings={eloRatings}
            />
          ) : (
            <div className="ui-enter grid md:grid-cols-2 gap-6">
              <TeamDisplay
                teamName="Equipo A"
                players={teams.teamA}
                allPlayers={players}
                matches={matches}
                seasonId={seasonId}
                ratingMode={ratingMode}
              />
              <TeamDisplay
                teamName="Equipo B"
                players={teams.teamB}
                allPlayers={players}
                matches={matches}
                seasonId={seasonId}
                ratingMode={ratingMode}
              />
            </div>
          )}
          {news && <NewsCard news={news} teamName={teamName} />}
        </div>
      )}
    </div>
  );
}
