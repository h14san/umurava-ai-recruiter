import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";

export const metadata: Metadata = {
  title: "Umurava AI Recruiter",
  description:
    "AI-assisted candidate shortlisting for recruiters. Upload a job, pull in Umurava talent, and receive a ranked shortlist with reasoning.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
