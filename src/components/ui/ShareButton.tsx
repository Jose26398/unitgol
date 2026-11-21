import { Share } from "lucide-react";
import { usePlayerScore } from "@/features/settings/SettingsContext";
import type { Match, Player } from "@/types";
import {
  calculateEloRatings,
  getEloRating,
  type RatingMode,
} from "@/utils/elo";
import { calculateWinRate } from "@/utils/playerStats";

interface Props {
  players?: Player[];
  teams?: {
    teamA: Player[];
    teamB: Player[];
  };
  matches?: Match[];
  seasonId?: string | null;
  ratingMode?: RatingMode;
  variant?: "primary" | "secondary";
}

export function ShareButton({
  players,
  teams,
  matches = [],
  seasonId = null,
  ratingMode = "score",
  variant = "primary",
}: Props) {
  const calculateScore = usePlayerScore();
  const eloRatings =
    ratingMode === "elo" ? calculateEloRatings(matches, seasonId) : null;
  const getPlayerRating = (player: Player) =>
    ratingMode === "elo"
      ? getEloRating(eloRatings, player.id)
      : calculateScore(player);
  const ratingLabel = ratingMode === "elo" ? "ELO" : "Score";

  const generatePlayerSummary = (player: Player, compact = false): string => {
    const { name, matches, wins, losses, goals, assists } = player;
    const draws = matches - wins - losses;
    const winRate = calculateWinRate(player);
    const goalsPerMatch = matches > 0 ? (goals / matches).toFixed(2) : "0.00";
    const assistsPerMatch =
      matches > 0 ? (assists / matches).toFixed(2) : "0.00";

    if (compact) {
      return `- ${name} (${ratingLabel}: ${getPlayerRating(player).toFixed(2)})\n`;
    }
    return `- ${name} (${ratingLabel}: ${getPlayerRating(player).toFixed(2)}):\n🥅 Partidos: ${wins} Victorias / ${draws} Empates / ${losses} Derrotas\n🏆 WR: ${winRate.toFixed(2)}%\n⚽️ Goles: ${goals} (Promedio: ${goalsPerMatch} por partido)\n🎯 Asistencias: ${assists} (Promedio: ${assistsPerMatch} por partido)\n\n`;
  };

  const generateShareableContent = (): string => {
    let content = "";

    if (players) {
      content += "Resumen de Jugadores:\n\n";
      players.forEach((player) => {
        content += generatePlayerSummary(player);
      });
    } else if (teams) {
      const teamAValue = teams.teamA.reduce(
        (total, player) => total + getPlayerRating(player),
        0,
      );
      const teamBValue = teams.teamB.reduce(
        (total, player) => total + getPlayerRating(player),
        0,
      );
      content += `Equipo A (Total ${ratingLabel}: ${teamAValue.toFixed(2)}):\n`;
      teams.teamA.forEach((player) => {
        content += generatePlayerSummary(player, true);
      });
      content += `\nEquipo B (Total ${ratingLabel}: ${teamBValue.toFixed(2)}):\n`;
      teams.teamB.forEach((player) => {
        content += generatePlayerSummary(player, true);
      });
    }

    return content;
  };

  const handleShare = async () => {
    const content = generateShareableContent();

    if (navigator.share) {
      try {
        await navigator.share({
          title: players ? "Resumen de Jugadores" : "Resumen de Equipos",
          text: content,
        });
        console.log("Contenido compartido con éxito.");
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          alert("Contenido copiado al portapapeles.");
        })
        .catch((err) => {
          console.error("Error al copiar al portapapeles:", err);
        });
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`ui-action group flex items-center justify-center gap-2 px-4 py-2 rounded-md ${
        variant === "secondary"
          ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      <Share className="w-5 h-5 transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5" />{" "}
      {teams ? "Compartir equipos" : "Compartir"}
    </button>
  );
}
