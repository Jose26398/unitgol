import { db } from '../db';
import { Player } from '../types';

let goalScoreFactor = 10;
let assistScoreFactor = 5;

export const setScoreFactors = (goalFactor: number, assistFactor: number) => {
  goalScoreFactor = goalFactor;
  assistScoreFactor = assistFactor;
};

const loadScoreFactors = async () => {
  const goal = await db.getSetting("goalScoreFactor");
  const assist = await db.getSetting("assistScoreFactor");

  goalScoreFactor = goal ?? 10;
  assistScoreFactor = assist ?? 5;
};

loadScoreFactors();

export const calculateWinRate = (player: Player): number => {
  if (player.matches === 0) return 0;
  return (player.wins / player.matches) * 100;
};

/**
 * Adjusts a stat based on the number of matches played.
 * 
 * @param stat The stat to adjust.
 * @param matches The number of matches played.
 * @param scale The scale of the adjustment. Defaults to 10.
 * @returns The adjusted stat.
 */
const adjustForMatches = (stat: number, matches: number, scale: number = 10): number => {
  return stat * (1 - Math.exp(-matches / scale));
};

/**
 * Calculates the score of a player based on their win rate, goals per game, and assists per game.
 * 
 * @param player The player to calculate the score for.
 * @returns The score of the player.
 */
export const calculateScore = (player: Player): number => {
  const winRate = calculateWinRate(player);

  const goalsPerGame = player.matches > 0 ? player.goals / player.matches : 0;
  const assistsPerGame = player.matches > 0 ? player.assists / player.matches : 0;

  const adjustedWinRate = adjustForMatches(winRate, player.matches);
  const adjustedGoals = adjustForMatches(goalsPerGame, player.matches);
  const adjustedAssists = adjustForMatches(assistsPerGame, player.matches);

  return adjustedWinRate * 0.7 + adjustedGoals * goalScoreFactor + adjustedAssists * assistScoreFactor;
};

/**
 * Calculates the total score of a list of players.
 * 
 * @param players The players to calculate the total score for.
 * @returns The total score of the players.
 */
export const totalScore = (players: Player[]): number => players.reduce((acc, player) => acc + calculateScore(player), 0);

/**
 * Generates a balanced team based on the player's score.
 * 
 * @param players The players to generate the team from.
 * @returns The balanced team.
 */
export const generateBalancedTeams = (players: Player[]): { teamA: Player[]; teamB: Player[] } => {
  const sortedPlayers = [...players].sort((a, b) => calculateScore(b) - calculateScore(a));
  const totalPlayers = sortedPlayers.length;
  const totalScore = sortedPlayers.reduce((sum, player) => sum + calculateScore(player), 0);

  const teamsSize = Math.floor(totalPlayers / 2);
  let bestDiff = Infinity;
  let bestMask = 0;

  // We iterate over all possible subsets with the correct size
  const totalSubsets = 1 << totalPlayers;
  for (let mask = 0; mask < totalSubsets; mask++) {
    const subset: Player[] = [];
    let subsetScore = 0;

    for (let i = 0; i < totalPlayers; i++) {
      if (mask & (1 << i)) {
        subset.push(sortedPlayers[i]);
        subsetScore += calculateScore(sortedPlayers[i]);
      }
    }

    // Only consider subsets with the correct size
    if (subset.length === teamsSize || subset.length === teamsSize + 1) {
      const diff = Math.abs(totalScore - 2 * subsetScore);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestMask = mask;
      }
    }
  }

  // Build the teams from the best combination found
  const teamA: Player[] = [];
  const teamB: Player[] = [];
  for (let i = 0; i < totalPlayers; i++) {
    if (bestMask & (1 << i)) {
      teamA.push(sortedPlayers[i]);
    } else {
      teamB.push(sortedPlayers[i]);
    }
  }

  return { teamA, teamB };
};

