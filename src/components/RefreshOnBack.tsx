"use client";

import { useEffect } from "react";

export function RefreshOnBack() {
  useEffect(() => {
    const reload = () => window.location.reload();
    window.addEventListener("popstate", reload);
    return () => window.removeEventListener("popstate", reload);
  }, []);

  return null;
}
