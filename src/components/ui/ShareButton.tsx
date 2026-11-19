import { Check, Share } from "lucide-react";
import { useState } from "react";
import { createPitchImage } from "@/features/team-generator/utils/pitchImage";
import { assignTacticalPositions } from "@/features/team-generator/utils/tacticalPositions";
import type { Match, Player } from "@/types";
import {
	calculateEloRatings,
	getEloRating,
	type RatingMode,
} from "@/utils/elo";
import { calculateScore, calculateWinRate } from "@/utils/playerStats";

interface Props {
	players?: Player[];
	teams?: {
		teamA: Player[];
		teamB: Player[];
	};
	matches?: Match[];
	seasonId?: string | null;
	ratingMode?: RatingMode;
}

export function ShareButton({
	players,
	teams,
	matches = [],
	seasonId = null,
	ratingMode = "score",
}: Props) {
	const [isSharing, setIsSharing] = useState(false);
	const [feedback, setFeedback] = useState<string | null>(null);

	const eloRatings =
		ratingMode === "elo" ? calculateEloRatings(matches, seasonId) : null;
	const getPlayerRating = (player: Player) =>
		ratingMode === "elo"
			? getEloRating(eloRatings, player.id)
			: calculateScore(player);
	const ratingLabel = ratingMode === "elo" ? "ELO" : "Score";

	const generatePlayerSummary = (player: Player, compact = false): string => {
		const { name, matches, wins, losses, goals, assists, positions } = player;
		const draws = matches - wins - losses;
		const winRate = calculateWinRate(player);
		const goalsPerMatch = matches > 0 ? (goals / matches).toFixed(2) : "0.00";
		const assistsPerMatch =
			matches > 0 ? (assists / matches).toFixed(2) : "0.00";
		const posStr =
			positions && positions.length > 0 ? ` [${positions.join(", ")}]` : "";

		if (compact) {
			return `- ${name}${posStr} (${ratingLabel}: ${getPlayerRating(player).toFixed(2)})\n`;
		}
		return `- ${name}${posStr} (${ratingLabel}: ${getPlayerRating(player).toFixed(2)}):\n🥅 Partidos: ${wins} Victorias / ${draws} Empates / ${losses} Derrotas\n🏆 WR: ${winRate.toFixed(2)}%\n⚽️ Goles: ${goals} (Promedio: ${goalsPerMatch} por partido)\n🎯 Asistencias: ${assists} (Promedio: ${assistsPerMatch} por partido)\n\n`;
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
			content += `⚽ ALINEACIÓN Y EQUIPOS UNITGOL\n\n`;
			content += `🔵 Equipo A (Total ${ratingLabel}: ${teamAValue.toFixed(2)}):\n`;
			teams.teamA.forEach((player) => {
				content += generatePlayerSummary(player, true);
			});
			content += `\n🟡 Equipo B (Total ${ratingLabel}: ${teamBValue.toFixed(2)}):\n`;
			teams.teamB.forEach((player) => {
				content += generatePlayerSummary(player, true);
			});
		}

		return content;
	};

	const handleShare = async () => {
		setIsSharing(true);
		setFeedback(null);
		try {
			const content = generateShareableContent();
			let imageFile: File | null = null;

			if (teams) {
				const formationA = assignTacticalPositions(
					teams.teamA,
					getPlayerRating,
					"Equipo A",
				);
				const formationB = assignTacticalPositions(
					teams.teamB,
					getPlayerRating,
					"Equipo B",
				);
				imageFile = await createPitchImage(formationA, formationB, ratingMode);
			}

			if (imageFile) {
				if (navigator.canShare?.({ files: [imageFile] }) && navigator.share) {
					await navigator.share({
						title: "Resumen de Equipos - UnitGol",
						text: content,
						files: [imageFile],
					});
					setFeedback("Compartido con éxito.");
				} else {
					// Descarga la imagen y copia el texto al portapapeles
					const url = URL.createObjectURL(imageFile);
					const link = document.createElement("a");
					link.href = url;
					link.download = "unitgol-alineacion-campo.png";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);

					if (navigator.clipboard) {
						await navigator.clipboard.writeText(content);
					}
					setFeedback("Imagen descargada y texto copiado.");
				}
			} else {
				if (navigator.share) {
					await navigator.share({
						title: players ? "Resumen de Jugadores" : "Resumen de Equipos",
						text: content,
					});
					setFeedback("Compartido con éxito.");
				} else if (navigator.clipboard) {
					await navigator.clipboard.writeText(content);
					setFeedback("Copiado al portapapeles.");
				}
			}
		} catch (err) {
			console.error("Error al compartir:", err);
		} finally {
			setIsSharing(false);
			setTimeout(() => setFeedback(null), 4000);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={handleShare}
				disabled={isSharing}
				className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition disabled:opacity-50"
				title={
					teams ? "Compartir resumen y captura del campo" : "Compartir resumen"
				}
			>
				{feedback ? (
					<>
						<Check className="w-4 h-4 text-emerald-200" />
						<span className="text-xs">{feedback}</span>
					</>
				) : (
					<>
						<Share className="w-4 h-4" />
						<span>{isSharing ? "Generando captura..." : "Compartir"}</span>
					</>
				)}
			</button>
		</div>
	);
}
