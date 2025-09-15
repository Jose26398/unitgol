import { supabase } from './supabase';

export async function migrateUserData(userId: string) {
  const tables = ['players', 'matches', 'seasons', 'settings'];
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .update({ user_id: userId })
      .is('user_id', null);

    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  }

  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .eq('user_id', userId);

  if (matchError) {
    console.error('Error getting matches:', matchError);
    throw matchError;
  }

  const matchIds = matches.map(m => m.id);

  if (matchIds.length > 0) {
    const { error: mpError } = await supabase
      .from('match_players')
      .update({ user_id: userId })
      .is('user_id', null)
      .in('match_id', matchIds);

    if (mpError) {
      console.error('Error updating match_players:', mpError);
      throw mpError;
    }

    const { error: goalsError } = await supabase
      .from('goals')
      .update({ user_id: userId })
      .is('user_id', null)
      .in('match_id', matchIds);

    if (goalsError) {
      console.error('Error updating goals:', goalsError);
      throw goalsError;
    }
  }
}
