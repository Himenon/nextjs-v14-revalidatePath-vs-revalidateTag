"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RefreshOnBack() {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener("popstate", refresh);
    return () => window.removeEventListener("popstate", refresh);
  }, [router]);

  return null;
}
