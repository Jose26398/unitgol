import { SeasonStats } from "@/features/seasons/components/SeasonStats";
import { SeasonsManager } from "@/features/seasons/components/SeasonsManager";
import type { Match, Player, Season } from "@/types";

interface SeasonsViewProps {
  seasons: Season[];
  players: Player[];
  matches: Match[];
  selectedSeasonId: string | null;
  isAdmin: boolean;
  onAddSeason: (season: Omit<Season, "id">) => Promise<unknown>;
  onEditSeason: (season: Season) => Promise<unknown>;
  onDeleteSeason: (id: string) => Promise<unknown>;
  onSelectSeason: (seasonId: string | null) => void;
  ratingMode: "elo" | "score";
}

export function SeasonsView({
  seasons,
  players,
  matches,
  selectedSeasonId,
  isAdmin,
  onAddSeason,
  onEditSeason,
  onDeleteSeason,
  onSelectSeason,
  ratingMode,
}: SeasonsViewProps) {
  return (
    <>
      <div className="mb-8">
        <SeasonsManager
          seasons={seasons}
          onAddSeason={onAddSeason}
          onEditSeason={onEditSeason}
          onDeleteSeason={onDeleteSeason}
          selectedSeasonId={selectedSeasonId ?? undefined}
          onSelectSeason={(id) => onSelectSeason(id)}
          isAdmin={isAdmin}
        />
      </div>
      {selectedSeasonId && (
        <SeasonStats
          seasonId={selectedSeasonId}
          players={players}
          matches={matches}
          ratingMode={ratingMode}
        />
      )}
    </>
  );
}
