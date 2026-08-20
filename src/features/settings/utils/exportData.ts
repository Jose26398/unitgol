import { supabaseService } from "@/db/supabase-service";

export async function exportDatabase() {
	const [players, matches, settings] = await Promise.all([
		supabaseService.getAllPlayers(),
		supabaseService.getAllMatches(),
		Promise.all([
			supabaseService.getSetting("goalScoreFactor"),
			supabaseService.getSetting("assistScoreFactor"),
		]),
	]);

	const [goalScoreFactor, assistScoreFactor] = settings;

	const exportData = {
		players,
		matches,
		settings: {
			goalScoreFactor,
			assistScoreFactor,
		},
	};

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
