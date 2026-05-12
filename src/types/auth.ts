/**
 * Authentication and User Types
 */

export interface User {
  id: string;
  username: string;
  friendCode: string;
  createdAt: Date;
}

export interface Friend {
  username: string;
  friendCode: string;
  addedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}

export interface LoginResponse extends AuthResponse {
  user?: {
    username: string;
    friendCode: string;
  };
  friends?: Array<{
    username: string;
    friendCode: string;
    addedAt: string;
  }>;
}

export interface SignupResponse extends AuthResponse {
  user?: {
    username: string;
    friendCode: string;
  };
}

