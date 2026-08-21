import type React from "react";
import type { Season } from "@/types";

interface SeasonSelectorProps {
	seasons: Season[];
	selectedSeasonId: string | null;
	onSelect: (seasonId: string | null) => void;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
	seasons,
	selectedSeasonId,
	onSelect,
}) => {
	return (
		<div className="mb-6">
			<label
				htmlFor="season-select"
				className="block text-sm font-medium text-gray-700"
			>
				Temporada:
			</label>
			<select
				id="season-select"
				className="w-full rounded-sm p-2"
				value={selectedSeasonId || ""}
				onChange={(e) => onSelect(e.target.value || null)}
			>
				<option value="">Todas</option>
				{seasons.map((season) => (
					<option key={season.id} value={season.id}>
						{season.name}
					</option>
				))}
			</select>
		</div>
	);
};
