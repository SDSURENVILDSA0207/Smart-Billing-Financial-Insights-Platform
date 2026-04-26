"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../components/spinner";

/**
 * Entry route: send authenticated users to the app, others to sign-in (no hop through /dashboard).
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      router.replace("/login");
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <Spinner />
    </div>
  );
}
