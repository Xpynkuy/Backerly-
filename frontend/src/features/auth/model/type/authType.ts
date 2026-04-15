export interface LoginRequest {
  username: string;
  password: string;
}
export interface RegisterRequest {
  username: string;
  password: string;
}
export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    isCreator?: boolean;
  }
}
export interface RegisterResponse {
  userId: string;
  username: string;
}