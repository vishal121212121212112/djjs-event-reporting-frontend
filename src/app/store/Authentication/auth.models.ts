export interface LoginRequest {
  identifier: string;  // Can be email or username
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  type: string;
}

export class User {
  id?: string;
  userId?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  email?: string;
  type?: string;
}
