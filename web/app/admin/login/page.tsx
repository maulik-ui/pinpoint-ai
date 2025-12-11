"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/src/components/Logo";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const redirect = searchParams.get("redirect") || "/admin/tools";
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Logo size="md" />
            <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>
              Pinpoint AI
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="min-h-[calc(100vh-120px)] flex items-center justify-center px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight mb-2" style={{ fontWeight: 600 }}>
              Admin Login
            </h1>
            <p className="text-muted-foreground">
              Enter your credentials to access the admin panel
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-[20px] border border-border/50 shadow-sm">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-[12px] text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-[12px] border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  autoComplete="username"
                />
              </label>
              <label className="block text-sm font-medium">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-[12px] border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  autoComplete="current-password"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-primary text-primary-foreground px-6 py-3 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{ fontWeight: 500 }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <nav className="px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <Logo size="md" />
              <span className="text-3xl tracking-tight" style={{ fontWeight: 500 }}>
                Pinpoint AI
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </nav>
        <main className="min-h-[calc(100vh-120px)] flex items-center justify-center px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight mb-2" style={{ fontWeight: 600 }}>
                Admin Login
              </h1>
              <p className="text-muted-foreground">
                Loading...
              </p>
            </div>
          </div>
        </main>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}

