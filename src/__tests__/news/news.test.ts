import { describe, expect, it, vi } from "vitest";
import { createMatchNews, createTeamNews } from "@/features/news/utils/news";
import type { Match, Player } from "@/types";

function player(id: string, name = id): Player {
	return {
		id,
		name,
		matches: 0,
		wins: 0,
		losses: 0,
		goals: 0,
		assists: 0,
	};
}

function match(
	id: string,
	date: string,
	teamAScore: number,
	teamBScore: number,
	teamAPlayers: Player[] = [player("javi", "Javi")],
	teamBPlayers: Player[] = [player("ana", "Ana")],
	goals: Match["goals"] = [],
	seasonId = "season",
): Match {
	return {
		id,
		date,
		seasonId,
		teamA: { players: teamAPlayers, score: teamAScore },
		teamB: { players: teamBPlayers, score: teamBScore },
		goals,
	};
}

describe("createTeamNews", () => {
	it("reports a balanced matchup when the team values are close", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const news = createTeamNews(100, 105);

		expect(news.title).toBe("Duelo de máxima igualdad");
		expect(news.body).toContain("solo un 5%");
		expect(news.body.split(/\s+/).length).toBeGreaterThan(25);
		pickFirst.mockRestore();
	});

	it("names the favored team when the difference is large", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const news = createTeamNews(160, 100);

		expect(news.title).toBe("Equipo A parte con ventaja");
		expect(news.body).toContain("60% superior");
		pickFirst.mockRestore();
	});

	it("treats two teams without rating data as evenly matched", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		expect(createTeamNews(0, 0).title).toBe("Duelo de máxima igualdad");
		pickFirst.mockRestore();
	});

	it("creates previews for balanced player duels, winning streaks, and hat-tricks", () => {
		const javi = {
			...player("javi", "Javi"),
			matches: 4,
			wins: 3,
			goals: 5,
			assists: 2,
		};
		const ana = {
			...player("ana", "Ana"),
			matches: 4,
			wins: 3,
			goals: 5,
			assists: 2,
		};
		const other = player("other", "Leo");
		const pickStory = vi.spyOn(Math, "random").mockReturnValue(0);
		const context = {
			teamAPlayers: [javi],
			teamBPlayers: [ana],
			previousMatches: [],
			seasonId: "season",
		};

		const duelNews = createTeamNews(100, 100, context);
		expect(duelNews.body).toContain("Javi");
		expect(duelNews.body).toContain("Ana");
		pickStory.mockReturnValue(0.83);
		const individualNews = createTeamNews(100, 100, context);
		expect(individualNews.body).toContain("Javi");
		expect(individualNews.body).not.toContain("Ana");

		const winningRun = [
			match("old-1", "2026-10-01", 3, 1, [javi], [other]),
			match("old-2", "2026-10-08", 2, 0, [javi], [other]),
		];
		const streakNews = createTeamNews(100, 100, {
			...context,
			previousMatches: winningRun,
		});
		expect(streakNews.body).toContain("2 victorias consecutivas");
		expect(streakNews.body).toContain("5 goles en su trayectoria");
		expect(streakNews.body.match(/2 victorias consecutivas/g)).toHaveLength(1);

		const hatTrickMatch = match(
			"hat-trick",
			"2026-10-15",
			3,
			1,
			[javi],
			[other],
			[
				{ playerId: "javi", minute: 5 },
				{ playerId: "javi", minute: 20 },
				{ playerId: "javi", minute: 30 },
			],
		);
		pickStory.mockReturnValue(0.95);
		const hatTrickNews = createTeamNews(100, 100, {
			...context,
			previousMatches: [hatTrickMatch],
		});
		expect(hatTrickNews.body).toContain("Javi");
		expect(hatTrickNews.body).toContain("Tres goles");
		expect(hatTrickNews.body).not.toContain("3 3 goles");

		const newerMatch = match(
			"newer",
			"2026-10-22",
			1,
			0,
			[javi],
			[other],
			[{ playerId: "javi", minute: 20 }],
		);
		const noLongerRecentHatTrick = createTeamNews(100, 100, {
			...context,
			previousMatches: [hatTrickMatch, newerMatch],
		});
		expect(noLongerRecentHatTrick.body).not.toContain(
			"Javi viene de firmar un hat-trick",
		);

		pickStory.mockRestore();
	});

	it("does not repeat the featured player's scoring total in a goal-leader story", () => {
		const pickGoalLeaderStory = vi.spyOn(Math, "random").mockReturnValue(0.8);
		const enrique = {
			...player("enrique", "Enrique"),
			matches: 7,
			wins: 5,
			goals: 12,
			assists: 3,
		};
		const ana = {
			...player("ana", "Ana"),
			matches: 7,
			wins: 2,
			goals: 2,
			assists: 1,
		};
		const news = createTeamNews(100, 100, {
			teamAPlayers: [enrique],
			teamBPlayers: [ana],
			previousMatches: [],
			seasonId: "season",
		});

		expect(news.title).toBe("El gol tiene nombre propio");
		expect(news.body.match(/12 tantos/g)).toHaveLength(1);
		expect(news.body).toContain("71% de victorias");
		expect(news.body).toContain("3 asistencias repartidas");

		pickGoalLeaderStory.mockRestore();
	});
});

describe("createMatchNews", () => {
	it("adds relevant player history and match details to the news", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const javi = {
			...player("javi", "Javi"),
			matches: 8,
			goals: 3,
			assists: 2,
		};
		const ana = {
			...player("ana", "Ana"),
			matches: 8,
			goals: 2,
			assists: 1,
		};
		const preview = createTeamNews(100, 105, {
			teamAPlayers: [javi],
			teamBPlayers: [ana],
			previousMatches: [],
			seasonId: "season",
		});
		const recapMatch = match(
			"latest",
			"2026-10-22",
			2,
			1,
			[javi],
			[ana],
			[{ playerId: "javi", minute: 20, assistById: "ana" }],
		);
		const recap = createMatchNews(recapMatch, []);

		expect(preview.body).toContain("Javi");
		expect(preview.body).toContain("Ana");
		expect(preview.body).not.toContain("3 3 goles");
		expect(preview.body).not.toContain("2 2 goles");
		expect(recap.body).toContain("Javi, sus goles llegaron en los minutos 20");
		expect(recap.body).toContain("Ana, también dio 1 asistencia");

		pickFirst.mockRestore();
	});

	it("highlights a scorer and their current winning streak", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const javi = player("javi", "Javi");
		const ana = player("ana", "Ana");
		const previousMatches = [
			match("old-1", "2026-10-01", 3, 1, [javi], [ana]),
			match("old-2", "2026-10-08", 2, 0, [javi], [ana]),
			match("old-3", "2026-10-15", 4, 2, [javi], [ana]),
		];
		const latestMatch = match(
			"latest",
			"2026-10-22",
			7,
			4,
			[javi],
			[ana],
			[
				{ playerId: "javi", minute: 5 },
				{ playerId: "javi", minute: 20 },
				{ playerId: "javi", minute: 30 },
			],
		);

		const news = createMatchNews(latestMatch, previousMatches);

		expect(news.title).toBe("¡Hat-trick de Javi!");
		expect(news.body).toContain("3 goles");
		expect(news.body.match(/3 goles/g)).toHaveLength(1);
		expect(news.body).toContain("7-4");
		expect(news.body).toContain("4 victorias consecutivas");
		expect(news.body.split(/\s+/).length).toBeGreaterThan(35);
		pickFirst.mockRestore();
	});

	it("does not claim a scorer when the match has no goal attribution", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const news = createMatchNews(match("latest", "2026-10-22", 2, 1), []);

		expect(news.title).toBe("Equipo A se impone 2-1");
		expect(news.body).toContain("2-1");
		pickFirst.mockRestore();
	});

	it("writes a draw recap without inventing a winner", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const javi = player("javi", "Javi");
		const latestMatch = match(
			"latest",
			"2026-10-22",
			2,
			2,
			[javi],
			[player("ana", "Ana")],
			[{ playerId: "javi", minute: 20 }],
		);

		const news = createMatchNews(latestMatch, []);

		expect(news.body).toContain("2-2");
		expect(news.body).toContain("anotó 1 gol");
		expect(news.body).not.toContain("victoria");
		pickFirst.mockRestore();
	});

	it("highlights a hat-trick even when its scorer's team loses", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const javi = player("javi", "Javi");
		const latestMatch = match(
			"latest",
			"2026-10-22",
			3,
			4,
			[javi],
			[player("ana", "Ana")],
			[
				{ playerId: "javi", minute: 5 },
				{ playerId: "javi", minute: 20 },
				{ playerId: "javi", minute: 30 },
			],
		);

		const news = createMatchNews(latestMatch, []);

		expect(news.title).toBe("¡Hat-trick de Javi!");
		expect(news.body).toContain("3 goles");
		expect(news.body).toContain("sus goles llegaron en los minutos 5, 20, 30");
		expect(news.body).not.toContain("aportó 3 goles");
		pickFirst.mockRestore();
	});

	it("makes a winning hat-trick the headline when there is no longer streak", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const javi = player("javi", "Javi");
		const latestMatch = match(
			"latest",
			"2026-10-22",
			3,
			2,
			[javi],
			[player("ana", "Ana")],
			[
				{ playerId: "javi", minute: 5 },
				{ playerId: "javi", minute: 20 },
				{ playerId: "javi", minute: 30 },
			],
		);

		expect(createMatchNews(latestMatch, []).title).toBe("¡Hat-trick de Javi!");
		pickFirst.mockRestore();
	});

	it("does not include wins from a different season in the streak", () => {
		const pickFirst = vi.spyOn(Math, "random").mockReturnValue(0);
		const javi = player("javi", "Javi");
		const previousMatch = match(
			"old",
			"2026-10-15",
			3,
			1,
			[javi],
			[player("ana", "Ana")],
			[],
			"previous-season",
		);
		const latestMatch = match(
			"latest",
			"2026-10-22",
			2,
			1,
			[javi],
			[player("ana", "Ana")],
			[{ playerId: "javi", minute: 20 }],
		);

		const news = createMatchNews(latestMatch, [previousMatch]);
		expect(news.body).toContain("sus goles llegaron en los minutos 20");
		expect(news.body).not.toContain("victorias seguidas");
		pickFirst.mockRestore();
	});
});
