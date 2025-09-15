import { createContext } from 'react';

export interface TeamAuth {
  id: string;
  team: string;
  email?: string;
}

export interface AuthContextType {
  teamAuth: TeamAuth | null;
  isAuthenticated: boolean;
  login: (team: string, code: string) => Promise<boolean>;
  register: (team: string, code: string, email: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
