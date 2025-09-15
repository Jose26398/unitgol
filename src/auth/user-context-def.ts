import { createContext } from 'react';
import { User } from '@supabase/supabase-js';

export interface UserContextType {
  user: User | null;
  loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
