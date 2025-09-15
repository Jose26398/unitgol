import { useState } from 'react';
import { supabase } from '../db/supabase';
import { AuthContext, TeamAuth } from './context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [teamAuth, setTeamAuth] = useState<TeamAuth | null>(() => {
    const saved = localStorage.getItem('teamAuth');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (team: string, code: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('name', team)
        .eq('code', code)
        .single();
      
      if (error || !data) {
        return false;
      }

      const auth = { id: data.id, team: data.name };
      setTeamAuth(auth);
      localStorage.setItem('teamAuth', JSON.stringify(auth));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setTeamAuth(null);
    localStorage.removeItem('teamAuth');
  };

  const register = async (team: string, code: string, email: string) => {
    try {
      // First check if team already exists
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('name', team)
        .single();

      if (existingTeam) {
        return false;
      }

      // Create new team
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: team,
          code: code,
          email: email
        })
        .select('id, name')
        .single();

      if (error || !data) {
        return false;
      }

      const auth = { id: data.id, team: data.name, email: email };
      setTeamAuth(auth);
      localStorage.setItem('teamAuth', JSON.stringify(auth));
      return true;
    } catch {
      return false;
    }
  };

  const value = {
    teamAuth,
    isAuthenticated: teamAuth !== null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


