"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const json = await res.json();
      if (json.ok) {
        router.push("/admin");
      } else {
        setError(json.error ?? "Ошибка входа");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-950 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-8 text-center text-2xl font-bold text-white">Вход</h1>

        <label className="mb-1 block text-sm text-zinc-400">Логин</label>
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition-colors focus:border-red-500"
          autoFocus
          required
        />

        <label className="mb-1 block text-sm text-zinc-400">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition-colors focus:border-red-500"
          required
        />

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-red-600 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
