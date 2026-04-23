"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          fontSize: "13px",
          padding: "12px 14px",
          boxShadow: "var(--shadow-panel)",
        },
        success: {
          iconTheme: { primary: "#10B981", secondary: "white" },
        },
        error: {
          iconTheme: { primary: "#EF4444", secondary: "white" },
        },
        loading: {
          iconTheme: { primary: "#6366F1", secondary: "white" },
        },
      }}
    />
  );
}
