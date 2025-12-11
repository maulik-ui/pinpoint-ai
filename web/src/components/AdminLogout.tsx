"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-full bg-destructive/10 text-destructive px-4 py-2 text-sm hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-destructive/20"
      style={{ fontWeight: 500 }}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}


