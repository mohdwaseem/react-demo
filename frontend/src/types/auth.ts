export interface LoginRequest {
  username: string;
  password: string;
}

/** Returned by POST /api/auth/login */
export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}

/** What the UI keeps about the logged-in user (no token here). */
export interface SessionUser {
  username: string;
  role: string;
}
