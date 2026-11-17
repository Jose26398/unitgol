import { Shield, Target, Wind, Zap } from "lucide-react";
import { PLAYER_POSITIONS, type PlayerPosition } from "@/types";

interface PlayerPositionSelectorProps {
	selectedPositions: PlayerPosition[];
	onChange: (positions: PlayerPosition[]) => void;
	disabled?: boolean;
}

const POSITION_ICONS: Record<
	PlayerPosition,
	React.ComponentType<{ className?: string }>
> = {
	defensa: Shield,
	medio: Zap,
	banda: Wind,
	estaca: Target,
};

const POSITION_STYLES: Record<
	PlayerPosition,
	{ active: string; inactive: string; badge: string }
> = {
	defensa: {
		active: "bg-blue-600 text-white border-blue-600 shadow-sm",
		inactive: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
		badge: "bg-blue-100 text-blue-800 border-blue-300",
	},
	medio: {
		active: "bg-purple-600 text-white border-purple-600 shadow-sm",
		inactive:
			"bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
		badge: "bg-purple-100 text-purple-800 border-purple-300",
	},
	banda: {
		active: "bg-amber-500 text-white border-amber-500 shadow-sm",
		inactive: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
		badge: "bg-amber-100 text-amber-800 border-amber-300",
	},
	estaca: {
		active: "bg-rose-600 text-white border-rose-600 shadow-sm",
		inactive: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
		badge: "bg-rose-100 text-rose-800 border-rose-300",
	},
};

export function PlayerPositionSelector({
	selectedPositions = [],
	onChange,
	disabled = false,
}: PlayerPositionSelectorProps) {
	const handleToggle = (pos: PlayerPosition) => {
		if (disabled) return;
		const isSelected = selectedPositions.includes(pos);

		if (isSelected) {
			onChange(selectedPositions.filter((p) => p !== pos));
		} else {
			if (selectedPositions.length >= 2) {
				return;
			}
			onChange([...selectedPositions, pos]);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<span className="block text-sm font-medium text-gray-700">
					Posiciones habituales (Máximo 2)
				</span>
				<span className="text-xs text-gray-500">
					{selectedPositions.length}/2 seleccionadas
				</span>
			</div>

			<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
				{PLAYER_POSITIONS.map(({ value, label }) => {
					const Icon = POSITION_ICONS[value];
					const index = selectedPositions.indexOf(value);
					const isSelected = index !== -1;
					const styles = POSITION_STYLES[value];
					const isMaxReached = !isSelected && selectedPositions.length >= 2;

					return (
						<button
							key={value}
							type="button"
							onClick={() => handleToggle(value)}
							disabled={disabled || isMaxReached}
							className={`relative flex items-center justify-between gap-2 p-2.5 rounded-lg border text-sm font-medium transition-all ${
								isSelected
									? styles.active
									: isMaxReached
										? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
										: styles.inactive
							}`}
							title={
								isMaxReached
									? "Solo puedes seleccionar un máximo de 2 posiciones"
									: label
							}
						>
							<div className="flex items-center gap-1.5 truncate">
								<Icon className="w-4 h-4 shrink-0" />
								<span className="truncate">{label}</span>
							</div>
							{isSelected && (
								<span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold bg-white/30 text-white shrink-0">
									{index + 1}º
								</span>
							)}
						</button>
					);
				})}
			</div>

			{selectedPositions.length > 0 && (
				<p className="text-xs text-gray-500 italic">
					1ª posición:{" "}
					<strong className="text-gray-700 capitalize">
						{selectedPositions[0]}
					</strong>
					{selectedPositions[1] && (
						<>
							{" "}
							· 2ª posición:{" "}
							<strong className="text-gray-700 capitalize">
								{selectedPositions[1]}
							</strong>
						</>
					)}
				</p>
			)}
		</div>
	);
}

export function PositionBadge({
	position,
}: {
	position: PlayerPosition | "portero";
	isOutOfPosition?: boolean;
}) {
	if (position === "portero") {
		return (
			<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
				Portero
			</span>
		);
	}

	const styles = POSITION_STYLES[position] || {
		badge: "bg-gray-100 text-gray-800 border-gray-300",
	};
	const label =
		PLAYER_POSITIONS.find((p) => p.value === position)?.label || position;

	return (
		<span
			className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${styles.badge}`}
			title={label}
		>
			{label}
		</span>
	);
}
