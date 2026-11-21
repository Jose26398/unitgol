import type { Player } from "@/types";
export const calculateWinRate = (player: Player): number => {
  if (player.matches === 0) return 0;
  const draws = player.matches - player.wins - player.losses;
  return ((player.wins + draws * 0.5) / player.matches) * 100;
};

/**
 * Adjusts a stat based on the number of matches played.
 *
 * @param stat The stat to adjust.
 * @param matches The number of matches played.
 * @param scale The scale of the adjustment. Defaults to 10.
 * @returns The adjusted stat.
 */
const adjustForMatches = (
  stat: number,
  matches: number,
  scale: number = 10,
): number => {
  return stat * (1 - Math.exp(-matches / scale));
};

/**
 * Calculates the score of a player based on their win rate, goals per game, and assists per game.
 *
 * @param player The player to calculate the score for.
 * @returns The score of the player.
 */
export const calculateScore = (
  player: Player,
  factors = { goalScoreFactor: 10, assistScoreFactor: 5 },
): number => {
  const winRate = calculateWinRate(player);

  const goalsPerGame = player.matches > 0 ? player.goals / player.matches : 0;
  const assistsPerGame =
    player.matches > 0 ? player.assists / player.matches : 0;

  const adjustedWinRate = adjustForMatches(winRate, player.matches);
  const adjustedGoals = adjustForMatches(goalsPerGame, player.matches);
  const adjustedAssists = adjustForMatches(assistsPerGame, player.matches);

  return (
    adjustedWinRate * 0.7 +
    adjustedGoals * factors.goalScoreFactor +
    adjustedAssists * factors.assistScoreFactor
  );
};

export function generateBalancedTeams(
  players: Player[],
  getValue: (player: Player) => number = calculateScore,
): { teamA: Player[]; teamB: Player[] } {
  const ranked = players
    .map((player) => ({ player, value: getValue(player) }))
    .sort((a, b) => b.value - a.value);
  const size = Math.ceil(ranked.length / 2);
  const total = ranked.reduce((sum, item) => sum + item.value, 0);
  let chosen: number[] = [];

  if (ranked.length <= 20) {
    let best = Infinity;
    const selection: number[] = [];
    const search = (index: number, sum: number) => {
      if (selection.length === size) {
        const difference = Math.abs(total - 2 * sum);
        if (difference < best) {
          best = difference;
          chosen = [...selection];
        }
        return;
      }
      for (let i = index; i <= ranked.length - (size - selection.length); i++) {
        selection.push(i);
        search(i + 1, sum + ranked[i].value);
        selection.pop();
      }
    };
    search(0, 0);
  } else {
    // shortcut: above 20 players use greedy balancing and swaps; exact search is exponential.
    let sumA = 0;
    let sumB = 0;
    for (const [i, item] of ranked.entries()) {
      if (
        chosen.length < size &&
        (i - chosen.length >= ranked.length - size || sumA <= sumB)
      ) {
        chosen.push(i);
        sumA += item.value;
      } else {
        sumB += item.value;
      }
    }
    const inA = new Set(chosen);
    for (let pass = 0; pass < ranked.length; pass++) {
      let best = Math.abs(sumA - sumB);
      let swap: [number, number] | undefined;
      for (const a of inA) {
        for (let b = 0; b < ranked.length; b++) {
          if (inA.has(b)) continue;
          const delta = ranked[b].value - ranked[a].value;
          const difference = Math.abs(sumA - sumB + 2 * delta);
          if (difference < best - 1e-9) {
            best = difference;
            swap = [a, b];
          }
        }
      }
      if (!swap) break;
      const [a, b] = swap;
      const delta = ranked[b].value - ranked[a].value;
      sumA += delta;
      sumB -= delta;
      inA.delete(a);
      inA.add(b);
    }
    chosen = [...inA];
  }
  const inA = new Set(chosen);
  return {
    teamA: ranked.filter((_, i) => inA.has(i)).map((item) => item.player),
    teamB: ranked.filter((_, i) => !inA.has(i)).map((item) => item.player),
  };
}
