import { createContext, useCallback, useContext } from "react";
import { DEFAULT_SETTINGS, type Player } from "@/types";
import { calculateScore } from "@/utils/playerStats";

export const SettingsContext = createContext(DEFAULT_SETTINGS);

export function usePlayerScore() {
  const settings = useContext(SettingsContext);
  return useCallback(
    (player: Player) => calculateScore(player, settings),
    [settings],
  );
}
