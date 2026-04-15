export interface User {
  id: string
  username: string
  isCreator?: boolean
}
 
export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated?: boolean;
  error?: string | null;
}