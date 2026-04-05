"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, LogOut } from "lucide-react";
import { useApp } from "@/features/context/AppContext";

export default function ResidentVoting() {
  const router = useRouter();
  const { candidates, castVote, currentUser, votingStatus, logout, residents } = useApp();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const residentData = useMemo(() => {
    return residents.find((resident) => resident.id === currentUser?.id);
  }, [currentUser?.id, residents]);

  const handleVoteConfirm = async () => {
    if (!selectedCandidateId || !currentUser) {
      return;
    }

    await castVote(selectedCandidateId);
    setIsConfirming(false);
    setIsSuccess(true);
  };

  if (isSuccess || residentData?.hasVoted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center animate-fade-in">
        <div className="w-full max-w-md rounded-2xl border border-gray-300 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-gray-800">Terima Kasih</h2>
          <p className="mb-8 text-gray-600">
            Suara Anda telah berhasil direkam. Partisipasi Anda sangat berarti untuk
            kemajuan lingkungan kita.
          </p>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => {
                router.replace("/");
              });
            }}
            className="w-full rounded-xl bg-gray-900 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-gray-800"
            
          >
            Keluar Aplikasi
          </button>
        </div>
      </div>
    );
  }

  if (votingStatus === "not_started") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center animate-fade-in">
        <div className="w-full max-w-md rounded-2xl border border-gray-300 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <AlertCircle size={40} className="text-yellow-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Belum Dimulai</h2>
          <p className="mb-8 text-gray-600">
            Pemilihan Ketua RW belum dimulai oleh panitia. Silakan kembali lagi nanti.
          </p>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => {
                router.replace("/");
              });
            }}
            className="w-full cursor-pointer rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  if (votingStatus === "closed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center animate-fade-in">
        <div className="w-full max-w-md rounded-2xl border border-gray-300 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <LogOut size={40} className="text-gray-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Pemilihan Selesai</h2>
          <p className="mb-8 text-gray-600">
            Sesi pemilihan telah berakhir. Terima kasih atas partisipasi Anda.
          </p>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => {
                router.replace("/");
              });
            }}
            className="w-full cursor-pointer rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">E-Voting RW 05</h1>
            <p className="text-sm text-gray-500">
              Halo, <span className="font-semibold">{currentUser?.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => {
                router.replace("/");
              });
            }}
            className="cursor-pointer p-2 text-gray-400 transition hover:text-red-500"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Tentukan Pilihan Anda</h2>
          <p className="text-gray-500">
            Pilihlah kandidat terbaik untuk masa depan lingkungan kita.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidateId(candidate.id)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-white transition-all duration-300 ${
                selectedCandidateId === candidate.id
                  ? "scale-[1.02] ring-4 ring-blue-500 shadow-xl"
                  : "border border-gray-300 shadow-sm hover:-translate-y-1 hover:shadow-md"
              }`}
            >
              <div className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-600 font-bold text-white shadow-lg">
                {candidate.number}
              </div>

              {selectedCandidateId === candidate.id && (
                <div className="absolute right-4 top-4 z-10 rounded-full bg-green-500 p-1.5 text-white shadow-lg animate-scale-in">
                  <CheckCircle2 size={20} />
                </div>
              )}

              <div className="h-56 overflow-hidden bg-gray-100">
                <img
                  src={candidate.imageUrl}
                  alt={candidate.name}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <h3 className="mb-1 text-center text-xl font-bold text-gray-800">
                  {candidate.name}
                </h3>
                <div className="mt-3 rounded-lg bg-blue-50 p-3 text-center">
                  <p className="mb-1 text-xs font-bold uppercase text-blue-600">Visi</p>
                  <p className="line-clamp-2 text-xs italic text-gray-700">
                    &quot;{candidate.vision}&quot;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCandidateId && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-gray-300 bg-white/80 p-6 backdrop-blur-md animate-slide-up">
          <button
            type="button"
            onClick={() => setIsConfirming(true)}
            className="flex w-full max-w-md cursor-pointer items-center justify-center space-x-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:bg-blue-700"
          >
            <span>
              Pilih Kandidat No.{" "}
              {candidates.find((candidate) => candidate.id === selectedCandidateId)?.number}
            </span>
          </button>
        </div>
      )}

      {isConfirming && selectedCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-gray-800">Konfirmasi</h3>
            <p className="mb-6 text-sm text-gray-500">
              Anda yakin memilih kandidat ini? Pilihan tidak dapat diubah.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="flex-1 cursor-pointer rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleVoteConfirm()}
                className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700"
              >
                Yakin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
