import { apiFetch } from "./client";
import type { DashboardStats } from "@/types/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export const dashboardApi = {
  get: () => apiFetch<DashboardStats>("/api/dashboard"),
};

export const authApi = {
  login: (data: LoginRequest) => apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: data }),
};
