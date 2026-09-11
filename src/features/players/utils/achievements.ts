import type { Match, Player } from "@/types";
import { calculateScore } from "@/utils/playerStats";

export interface AchievementContext {
	player: Player;
	players: Player[];
	matches: Match[];
}

export interface AchievementDefinition {
	id: string;
	emoji: string;
	name: string;
	description: string;
	isUnlocked: (context: AchievementContext) => boolean;
}

function playerParticipates(player: Player, match: Match) {
	return (
		match.teamA.players.some((teamPlayer) => teamPlayer.id === player.id) ||
		match.teamB.players.some((teamPlayer) => teamPlayer.id === player.id)
	);
}

function goalsInMatch(player: Player, match: Match) {
	return match.goals.filter((goal) => goal.playerId === player.id).length;
}

function assistsInMatch(player: Player, match: Match) {
	return match.goals.filter((goal) => goal.assistById === player.id).length;
}

function hasWinningStreak(
	player: Player,
	matches: Match[],
	streakLength: number,
) {
	const orderedMatches = matches
		.filter((match) => playerParticipates(player, match))
		.sort(
			(first, second) =>
				new Date(second.date).getTime() - new Date(first.date).getTime(),
		);
	let currentStreak = 0;

	for (const match of orderedMatches) {
		const isTeamA = match.teamA.players.some(
			(teamPlayer) => teamPlayer.id === player.id,
		);
		const playerScore = isTeamA ? match.teamA.score : match.teamB.score;
		const opponentScore = isTeamA ? match.teamB.score : match.teamA.score;

		if (playerScore > opponentScore) {
			currentStreak += 1;
			if (currentStreak >= streakLength) return true;
		} else {
			return false;
		}
	}

	return false;
}

function hasUnbeatenStreak(
	player: Player,
	matches: Match[],
	streakLength: number,
) {
	const orderedMatches = matches
		.filter((match) => playerParticipates(player, match))
		.sort(
			(first, second) =>
				new Date(second.date).getTime() - new Date(first.date).getTime(),
		);
	let currentStreak = 0;

	for (const match of orderedMatches) {
		const isTeamA = match.teamA.players.some(
			(teamPlayer) => teamPlayer.id === player.id,
		);
		const playerScore = isTeamA ? match.teamA.score : match.teamB.score;
		const opponentScore = isTeamA ? match.teamB.score : match.teamA.score;

		if (playerScore >= opponentScore) {
			currentStreak += 1;
			if (currentStreak >= streakLength) return true;
		} else {
			return false;
		}
	}

	return false;
}

function scoredAfterTenMatches(player: Player, matches: Match[]) {
	const orderedMatches = matches
		.filter((match) => playerParticipates(player, match))
		.sort(
			(first, second) =>
				new Date(first.date).getTime() - new Date(second.date).getTime(),
		);
	const firstGoalIndex = orderedMatches.findIndex(
		(match) => goalsInMatch(player, match) > 0,
	);

	return firstGoalIndex >= 10;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
	{
		id: "killer",
		emoji: "⚽",
		name: "Killer",
		description: "15 goles en la temporada",
		isUnlocked: ({ player }) => player.goals >= 15,
	},
	{
		id: "sniper",
		emoji: "🎯",
		name: "Francotirador",
		description: "5 goles en un partido",
		isUnlocked: ({ player, matches }) =>
			matches.some((match) => goalsInMatch(player, match) >= 5),
	},
	{
		id: "wizard",
		emoji: "🧙",
		name: "Mago",
		description: "10 asistencias en la temporada",
		isUnlocked: ({ player }) => player.assists >= 10,
	},
	{
		id: "on-fire",
		emoji: "🔥",
		name: "OnFire",
		description: "3 victorias consecutivas",
		isUnlocked: ({ player, matches }) => hasWinningStreak(player, matches, 3),
	},
	{
		id: "all-rounder",
		emoji: "🚘",
		name: "Todoterreno",
		description: "Marcar y asistir en el mismo partido",
		isUnlocked: ({ player, matches }) =>
			matches.some(
				(match) =>
					goalsInMatch(player, match) > 0 && assistsInMatch(player, match) > 0,
			),
	},
	{
		id: "consistent",
		emoji: "🔨",
		name: "Constante",
		description: "Jugar 20 partidos",
		isUnlocked: ({ player }) => player.matches >= 20,
	},
	{
		id: "unbeaten",
		emoji: "🧊",
		name: "Invicto",
		description: "5 partidos consecutivos sin perder",
		isUnlocked: ({ player, matches }) => hasUnbeatenStreak(player, matches, 5),
	},
	{
		id: "slow-starter",
		emoji: "🐌",
		name: "A tu ritmo",
		description: "Marcar por primera vez después de 10 partidos",
		isUnlocked: ({ player, matches }) =>
			player.goals > 0 && scoredAfterTenMatches(player, matches),
	},
	{
		id: "veteran",
		emoji: "👴🏻",
		name: "Veterano",
		description: "Más de 15 partidos y ser quien más ha jugado",
		isUnlocked: ({ player, players }) =>
			players.length > 0 &&
			player.matches > 15 &&
			player.matches >=
				Math.max(...players.map((seasonPlayer) => seasonPlayer.matches)),
	},
	{
		id: "virgin",
		emoji: "🐣",
		name: "Virgen",
		description: "No marcar ni asistir en la temporada",
		isUnlocked: ({ player }) => player.goals === 0 && player.assists === 0,
	},
	{
		id: "goat",
		emoji: "🐐",
		name: "GOAT",
		description: "Mejor puntuación de la temporada",
		isUnlocked: ({ player, players }) =>
			players.length > 0 &&
			calculateScore(player) >= Math.max(...players.map(calculateScore)),
	},
	{
		id: "villain",
		emoji: "💀",
		name: "Villano",
		description: "Más derrotas de la temporada",
		isUnlocked: ({ player, players }) =>
			players.length > 0 &&
			player.losses >=
				Math.max(...players.map((seasonPlayer) => seasonPlayer.losses)),
	},
	{
		id: "cone",
		emoji: "🦥",
		name: "El cono",
		description: "10 partidos sin marcar",
		isUnlocked: ({ player }) => player.matches >= 10 && player.goals === 0,
	},
];

export function getUnlockedAchievements(context: AchievementContext) {
	return ACHIEVEMENTS.filter((achievement) => achievement.isUnlocked(context));
}
