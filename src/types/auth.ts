export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
