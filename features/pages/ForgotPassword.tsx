"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Send, ShieldCheck, User, Vote } from "lucide-react";

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 animate-fade-in sm:p-6 lg:p-8">
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
              Lupa password bukan akhir dari partisipasi Anda.
            </h1>
            <p className="max-w-sm text-sm text-blue-100">
              Ajukan permintaan reset dan panitia akan memverifikasi identitas
              Anda sebelum akses akun dipulihkan.
            </p>
          </div>

          <div className="relative mx-auto flex w-full max-w-[220px] items-center justify-center py-4">
            <svg viewBox="0 0 220 180" className="w-full drop-shadow-2xl" aria-hidden="true">
              <ellipse cx="110" cy="160" rx="76" ry="9" fill="black" opacity="0.15" />
              <circle cx="110" cy="82" r="62" fill="white" fillOpacity="0.1" />
              <circle
                cx="110"
                cy="82"
                r="62"
                fill="none"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
              <rect
                x="78"
                y="78"
                width="64"
                height="48"
                rx="10"
                fill="white"
                fillOpacity="0.9"
              />
              <path
                d="M92 78v-16a18 18 0 0 1 36 0v16"
                fill="none"
                stroke="white"
                strokeOpacity="0.9"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="110" cy="98" r="7" fill="#2563eb" />
              <rect x="107" y="102" width="6" height="12" rx="3" fill="#2563eb" />
              <circle cx="52" cy="46" r="5" fill="white" fillOpacity="0.5" />
              <circle cx="176" cy="54" r="4" fill="white" fillOpacity="0.4" />
              <circle cx="168" cy="126" r="6" fill="white" fillOpacity="0.3" />
            </svg>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-blue-100">
            <ShieldCheck size={16} />
            <span>Permintaan reset diverifikasi manual oleh panitia.</span>
          </div>
        </div>

        <div className="w-full bg-white px-6 py-10 sm:px-10 lg:w-1/2 lg:py-14">
          <div className="mx-auto flex max-w-sm flex-col">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Vote size={20} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">SuaraWarga</span>
            </div>

            {isSubmitted ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-slate-900">Permintaan Terkirim</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Jika username <strong className="text-slate-700">{username}</strong> terdaftar,
                  instruksi reset password telah dikirim ke kanal administrator terkait.
                </p>

                <button
                  type="button"
                  onClick={onBack}
                  className="mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Login
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900">Lupa Password?</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Masukkan Username atau NIK Anda untuk mengajukan reset.
                </p>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Username / NIK
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <User className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Masukkan Username / NIK"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                      />
                    </div>
                  </div>

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
                        <Send size={16} />
                        Kirim Permintaan Reset
                      </>
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={onBack}
                  className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <KeyRound size={16} />
                  Kembali ke Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
