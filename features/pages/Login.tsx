"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, LogIn, ShieldCheck, User, Users, Vote } from "lucide-react";
import { useApp } from "@/features/context/AppContext";

interface LoginProps {
  onForgotPassword: () => void;
}

type LoginMode = "resident" | "admin";

export default function Login({ onForgotPassword }: LoginProps) {
  const { login } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("resident");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await login(username, password);
      router.replace(user.role === "resident" ? "/" : "/dashboard");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Username atau Password salah. Silakan coba lagi.";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 bg-cover bg-center p-4 animate-fade-in sm:p-6 lg:p-8"
      style={{ backgroundImage: "url(/background-suara-warga.png)" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-slate-950/70" />

      <div className="relative flex w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl shadow-blue-950/40 animate-scale-in">
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-10 text-white lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Vote size={20} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">SuaraWarga</span>
          </div>

          <div className="relative space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight">
              Pemilihan yang aman, transparan, dan mudah diikuti warga.
            </h1>
            <p className="max-w-sm text-sm text-blue-100">
              Sistem e-voting RT/RW dengan kontrol bilik suara, enkripsi
              suara, dan pemantauan hasil secara langsung.
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-blue-100">
            <ShieldCheck size={16} />
            <span>Suara Anda terenkripsi dan tercatat aman.</span>
          </div>
        </div>

        <div className="w-full bg-white px-6 py-10 sm:px-10 lg:w-1/2 lg:py-14">
          <div className="mx-auto flex max-w-sm flex-col">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Vote size={20} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                SuaraWarga
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Selamat datang</h2>
            <p className="mt-1 text-sm text-slate-500">
              Masuk untuk melanjutkan ke sistem e-voting.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("resident")}
                className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === "resident"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Users size={16} />
                Warga
              </button>
              <button
                type="button"
                onClick={() => switchMode("admin")}
                className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === "admin"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ShieldCheck size={16} />
                Admin
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-700"
                >
                  {mode === "resident" ? "8 Digit Terakhir NIK" : "Username Admin"}
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    {mode === "resident" ? (
                      <Users className="h-4.5 w-4.5 text-slate-400" />
                    ) : (
                      <User className="h-4.5 w-4.5 text-slate-400" />
                    )}
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    inputMode={mode === "resident" ? "numeric" : undefined}
                    pattern={mode === "resident" ? "\\d{8}" : undefined}
                    maxLength={mode === "resident" ? 8 : undefined}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    placeholder={
                      mode === "resident" ? "Masukkan 8 digit terakhir NIK" : "Masukkan username admin"
                    }
                    value={username}
                    onChange={(event) => {
                      const value = event.target.value;
                      setUsername(
                        mode === "resident" ? value.replace(/\D/g, "").slice(0, 8) : value,
                      );
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-500"
                  >
                    <KeyRound size={13} />
                    Lupa password?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="animate-slide-up rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isLoading ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                }`}
              >
                {isLoading ? (
                  "Memproses..."
                ) : (
                  <>
                    <LogIn size={16} />
                    Masuk
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
