import type { Match, Player } from "@/types";
import { getUnlockedAchievements } from "../utils/achievements";

interface AchievementsSectionProps {
	player: Player;
	players: Player[];
	matches: Match[];
}

export function AchievementsSection({
	player,
	players,
	matches,
}: AchievementsSectionProps) {
	const achievements = getUnlockedAchievements({ player, players, matches });

	return (
		<section className="min-w-0" aria-label="Colección de logros">
			<h4 className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/75">
				Logros
			</h4>
			{achievements.length > 0 ? (
				<div className="flex flex-wrap gap-1.5">
					{achievements.map((achievement) => (
						<div
							key={achievement.id}
							className="grid h-6 px-3 place-items-center rounded-full border border-white/35 bg-slate-950/25 text-xs text-white shadow-sm backdrop-blur-sm"
							title={`${achievement.name}: ${achievement.description}`}
							aria-label={`${achievement.name}: ${achievement.description}`}
							role="img"
						>
							<span aria-hidden="true">{achievement.emoji} {achievement.name}</span>
						</div>
					))}
				</div>
			) : (
				<p className="text-[10px] text-white/65">Sin logros desbloqueados</p>
			)}
		</section>
	);
}