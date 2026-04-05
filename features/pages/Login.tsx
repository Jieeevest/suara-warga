"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { useApp } from "@/features/context/AppContext";

interface LoginProps {
  onForgotPassword: () => void;
}

export default function Login({ onForgotPassword }: LoginProps) {
  const { login } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const user = await login(username, password);
    if (!user) {
      setError("Username atau Password salah. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }

    router.replace(user.role === "resident" ? "/" : "/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 animate-fade-in sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <User size={28} strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SuaraWarga
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistem E-Voting RT/RW
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-gray-300 bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-md border-gray-300 py-2.5 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Masukkan Username / NIK"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-gray-300 py-2.5 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="mt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Lupa password?
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <h3 className="text-sm font-medium text-red-800">Login Gagal</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isLoading ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                }`}
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
