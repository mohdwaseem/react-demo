"use client";
import { useAuth } from "@/context/AuthContext";

/** Renders its children only for logged-in users (e.g. "Add", "Edit", "Delete" buttons). */
export function AuthOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return <>{isAuthenticated ? children : fallback}</>;
}
