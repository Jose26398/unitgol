import type { Player } from "@/types";

interface PlayerSelectorProps {
  player: Player;
  isSelected: boolean;
  onToggle: (player: Player) => void;
}

export function PlayerSelector({
  player,
  isSelected,
  onToggle,
}: PlayerSelectorProps) {
  return (
    <label
      className={`flex items-center p-2 border rounded-md cursor-pointer transition-colors duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-emerald-600 ${
        isSelected
          ? "bg-emerald-50 border-emerald-300"
          : "hover:bg-emerald-50/50 hover:border-emerald-200"
      }`}
    >
      <span className="flex-1 cursor-pointer text-gray-700 truncate">
        {player.name}
      </span>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(player)}
        className="form-checkbox text-emerald-600 accent-emerald-600"
        aria-label={`Seleccionar a ${player.name}`}
      />
    </label>
  );
}
