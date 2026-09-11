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
		<section
			className="mt-5 border-t border-gray-200 pt-4 cursor-default"
			aria-label="Colección de logros"
		>
			<h4 className="mb-3 text-sm font-semibold text-gray-700">
				Colección de logros
			</h4>
			{achievements.length > 0 ? (
				<div className="grid grid-cols-3 gap-2">
					{achievements.map((achievement) => (
						<div
							key={achievement.id}
							className="flex gap-1 flex-row items-center border border-gray-300 hover:bg-emerald-50 rounded-md px-2 text-center"
							title={achievement.description}
						>
							<div className="text-lg" aria-hidden="true">
								{achievement.emoji}
							</div>
							<p className="text-xs font-semibold text-gray-800">
								{achievement.name}
							</p>
						</div>
					))}
				</div>
			) : (
				<p className="text-xs text-gray-500">
					Aún no hay logros desbl
oqueados.
				</p>
			)}
		</section>
	);
}