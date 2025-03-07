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

  const teamA: Player[] = [];
  const teamB: Player[] = [];
  let scoreA = 0;
  let scoreB = 0;

  sortedPlayers.forEach((player) => {
    const playerScore = calculateScore(player);
    if (
      (teamA.length < teamB.length) ||
      (teamA.length === teamB.length && scoreA <= scoreB)
    ) {
      teamA.push(player);
      scoreA += playerScore;
    } else {
      teamB.push(player);
      scoreB += playerScore;
    }
  });

  return { teamA, teamB };
};
