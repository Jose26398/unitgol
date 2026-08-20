import { useMemo } from "react";
import { PlayerCard } from "@/features/players/components/PlayerCard";
import type { Player } from "@/types";
import { calculateScore } from "@/utils/playerStats";

interface TeamDisplayProps {
	teamName: string;
	players: Player[];
}

export function TeamDisplay({ teamName, players }: TeamDisplayProps) {
	const teamScore = useMemo(
		() =>
			players
				.reduce((sum, player) => sum + calculateScore(player), 0)
				.toFixed(2),
		[players],
	);

	return (
		<div>
			<h3 className="text-2xl under font-semibold my-4">
				{teamName} 🌟<span className="italic">{teamScore}</span>
			</h3>
			<div className="space-y-4">
				{players.map((player) => (
					<PlayerCard key={player.id} player={player} />
				))}
			</div>
		</div>
	);
}
