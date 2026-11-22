import api from "../axios";
import type { ApiResponse, AuthResponse } from "../types";

export interface AuthCredentials {
  username: string;
  password: string;
}

function unwrapAuthResponse(
  response: AuthResponse | ApiResponse<AuthResponse>,
): AuthResponse {
  return "data" in response ? response.data : response;
}

export async function register(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse | ApiResponse<AuthResponse>>(
    "/auth/register",
    credentials,
  );

  return unwrapAuthResponse(data);
}

export async function login(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse | ApiResponse<AuthResponse>>(
    "/auth/login",
    credentials,
  );

  return unwrapAuthResponse(data);
}
