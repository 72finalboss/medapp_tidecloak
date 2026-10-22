"use client";

import React from "react";
import { AuthProvider } from "../lib/authContext";
import { HospitalProvider } from "../lib/hospitalContext";
import { ThemeProvider } from "../lib/themeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HospitalProvider>{children}</HospitalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
