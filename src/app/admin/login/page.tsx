"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import BobaField from "@/components/BobaField";
import CupArt from "@/components/CupArt";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No pudimos iniciar sesión.");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-[2rem] border-2 border-ink bg-cream p-8 text-ink shadow-[8px_8px_0_var(--color-ink)]"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto w-fit animate-float">
          <CupArt name="Cold Brew" categorySlug="cold-brew" className="h-24" />
        </div>
        <h1 className="mt-3 font-display text-3xl">Panel interno</h1>
        <p className="mt-1 text-sm text-ink/55">Solo para el equipo Roa</p>
      </div>

      <label className="mb-4 block">
        <span className="mb-1.5 block text-sm font-bold text-roa-700">Correo</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@roabrew.com"
          className="w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 outline-none transition focus:border-roa-500"
        />
      </label>

      <label className="mb-5 block">
        <span className="mb-1.5 block text-sm font-bold text-roa-700">Contraseña</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border-2 border-ink/15 bg-white/70 px-4 py-3 outline-none transition focus:border-roa-500"
        />
      </label>

      {error && (
        <p className="mb-4 rounded-xl border-2 border-berry bg-berry/10 px-3 py-2 text-sm font-medium text-berry">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-shine w-full rounded-full border-2 border-ink bg-roa-500 py-4 font-display text-xl text-cream transition hover:bg-roa-600 disabled:opacity-60"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>

      <Link
        href="/"
        className="mt-5 block text-center text-sm text-ink/45 transition hover:text-roa-600"
      >
        ← Volver al sitio
      </Link>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grain relative grid min-h-dvh place-items-center overflow-hidden bg-roa-900 px-5 py-16">
      <div className="glow pointer-events-none absolute left-1/2 top-1/4 h-96 w-[32rem] -translate-x-1/2 opacity-50" />
      <BobaField count={14} />

      <div className="relative flex flex-col items-center gap-8">
        <Logo className="text-[30px]" tone="cream" />
        <Suspense fallback={<div className="h-96" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
