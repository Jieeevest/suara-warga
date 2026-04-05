"use client";

import { useState } from "react";
import { ArrowLeft, Mail, User } from "lucide-react";

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

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 animate-fade-in sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="border border-gray-300 bg-white px-4 py-8 text-center shadow sm:rounded-lg sm:px-10">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Permintaan Terkirim</h3>
            <p className="mt-2 text-sm text-gray-500">
              Jika username <strong>{username}</strong> terdaftar, instruksi reset
              password telah dikirim ke kanal administrator terkait.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex cursor-pointer w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 animate-fade-in sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <User size={28} strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Lupa Password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Masukkan Username atau NIK Anda untuk mereset password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-gray-300 bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username / NIK
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
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 ${
                  isLoading ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                }`}
              >
                {isLoading ? "Memproses..." : "Kirim Permintaan Reset"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex cursor-pointer w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4 text-gray-500" />
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
