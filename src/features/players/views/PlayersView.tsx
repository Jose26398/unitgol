import { useMemo, useState } from "react";
import { AchievementsInfoModal } from "@/features/players/components/AchievementsInfoModal";
import { NewPlayerForm } from "@/features/players/components/NewPlayerForm";
import { PlayerCard } from "@/features/players/components/PlayerCard";
import type { Match, Player, PlayerUpdate, Season } from "@/types";
import { calculateEloRatings, type RatingMode } from "@/utils/elo";

interface PlayersViewProps {
  players: Player[];
  matches: Match[];
  seasons: Season[];
  selectedSeasonId: string | null;
  ratingMode: RatingMode;
  isAdmin: boolean;
  onAddPlayer: (
    player: Omit<
      Player,
      "id" | "matches" | "wins" | "losses" | "goals" | "assists"
    > & { seasonId: string },
  ) => Promise<unknown>;
  onEditPlayer: (
    id: string,
    updatedData: PlayerUpdate,
    avatarFile?: File,
    removeAvatar?: boolean,
  ) => Promise<void>;
  onDeletePlayer: (id: string) => void;
  onOpenSummary: () => void;
  onOpenComparer: () => void;
}

export function PlayersView({
  players,
  matches,
  seasons,
  selectedSeasonId,
  ratingMode,
  isAdmin,
  onAddPlayer,
  onEditPlayer,
  onDeletePlayer,
  onOpenSummary,
  onOpenComparer,
}: PlayersViewProps) {
  const [showAchievementsInfo, setShowAchievementsInfo] = useState(false);
  const visiblePlayers = players.filter(
    (p: Player) => !selectedSeasonId || p.seasonId === selectedSeasonId,
  );
  const eloRatings = useMemo(
    () => calculateEloRatings(matches, selectedSeasonId),
    [matches, selectedSeasonId],
  );
  return (
    <div className="ui-enter">
      <div className="flex gap-4 lg:flex-row flex-col w-full justify-between">
        <button
          type="button"
          onClick={onOpenSummary}
          className="ui-action bg-emerald-600 text-white mb-1 lg:mb-6 p-6 rounded-lg shadow-md hover:bg-emerald-700"
        >
          Tabla Resumen
        </button>
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={onOpenComparer}
            className="ui-action flex-1 w-32 bg-emerald-600 text-white p-6 rounded-lg shadow-md hover:bg-emerald-700"
          >
            Cara a Cara
          </button>
          <button
            type="button"
            onClick={() => setShowAchievementsInfo(true)}
            className="bg-gray-600 text-white p-6 rounded-lg shadow-md hover:bg-gray-700"
          >
            Logros
          </button>
        </div>
        {isAdmin && (
          <NewPlayerForm
            onAddPlayer={onAddPlayer}
            selectedSeasonId={selectedSeasonId}
            playerCount={players.length}
          />
        )}
      </div>
      {showAchievementsInfo && (
        <AchievementsInfoModal onClose={() => setShowAchievementsInfo(false)} />
      )}
      {visiblePlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visiblePlayers.map((player: Player) => (
            <PlayerCard
              key={player.id}
              player={player}
              players={visiblePlayers}
              matches={matches}
              seasonId={selectedSeasonId}
              onEdit={onEditPlayer}
              onDelete={onDeletePlayer}
              seasons={seasons}
              isAdmin={isAdmin}
              ratingMode={ratingMode}
              eloRatings={eloRatings}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No hay jugadores disponibles.
        </div>
      )}
    </div>
  );
}
