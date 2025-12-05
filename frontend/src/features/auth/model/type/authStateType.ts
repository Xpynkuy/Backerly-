export interface User {
  id: string
  username: string
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated?: boolean;
  error?: string | null;
}