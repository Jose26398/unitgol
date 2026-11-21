import type { Match, Player, Season, TeamSettings } from "@/types";

export function exportDatabase(exportData: {
  players: Player[];
  matches: Match[];
  seasons: Season[];
  settings: TeamSettings;
}) {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "unitgol.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
