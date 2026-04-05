"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, MonitorPlay, Search, UserCheck, Users, UserX } from "lucide-react";
import Modal from "@/features/components/Modal";
import { useApp } from "@/features/context/AppContext";

export default function Attendance() {
  const { residents, toggleAttendance, setActiveVoter, activeVoterId, votingStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [boothConfirmResidentId, setBoothConfirmResidentId] = useState<string | null>(null);
  const [attendanceConfirmResidentId, setAttendanceConfirmResidentId] = useState<string | null>(
    null,
  );

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      if (resident.status !== "Aktif") {
        return false;
      }

      const block = resident.block || "";
      return (
        resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.nik.includes(searchTerm) ||
        block.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [residents, searchTerm]);

  const stats = useMemo(() => {
    const activeResidents = residents.filter((resident) => resident.status === "Aktif");
    const present = activeResidents.filter((resident) => resident.isPresent).length;
    const voted = activeResidents.filter((resident) => resident.hasVoted).length;

    return {
      total: activeResidents.length,
      present,
      waiting: activeResidents.filter((resident) => resident.isPresent && !resident.hasVoted).length,
      voted,
    };
  }, [residents]);

  const handleActivateBooth = async (residentId: string) => {
    if (activeVoterId === residentId) {
      await setActiveVoter(null);
      return;
    }

    setBoothConfirmResidentId(residentId);
  };

  const handleAttendanceAction = async (residentId: string, isPresent: boolean) => {
    if (votingStatus !== "active") {
      return;
    }

    if (!isPresent) {
      await toggleAttendance(residentId);
      return;
    }

    setAttendanceConfirmResidentId(residentId);
  };

  const boothConfirmResident = useMemo(() => {
    if (!boothConfirmResidentId) {
      return null;
    }

    return residents.find((resident) => resident.id === boothConfirmResidentId) || null;
  }, [boothConfirmResidentId, residents]);

  const attendanceConfirmResident = useMemo(() => {
    if (!attendanceConfirmResidentId) {
      return null;
    }

    return residents.find((resident) => resident.id === attendanceConfirmResidentId) || null;
  }, [attendanceConfirmResidentId, residents]);

  const closeBoothConfirmModal = () => {
    setBoothConfirmResidentId(null);
  };

  const closeAttendanceConfirmModal = () => {
    setAttendanceConfirmResidentId(null);
  };

  const handleConfirmActivateBooth = async () => {
    if (!boothConfirmResidentId) {
      return;
    }

    await setActiveVoter(boothConfirmResidentId);
    closeBoothConfirmModal();
  };

  const handleConfirmAbsent = async () => {
    if (!attendanceConfirmResidentId) {
      return;
    }

    await toggleAttendance(attendanceConfirmResidentId);
    closeAttendanceConfirmModal();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <UserCheck size={14} />
              Registrasi
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Meja registrasi dan kontrol bilik</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Verifikasi kehadiran warga dan aktifkan akses bilik suara tanpa berpindah halaman.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama, NIK, blok..."
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-80"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">DPT Aktif</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-emerald-50 p-4">
            <p className="text-sm text-slate-500">Sudah Hadir</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.present}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-amber-50 p-4">
            <p className="text-sm text-slate-500">Menunggu Memilih</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.waiting}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-blue-50 p-4">
            <p className="text-sm text-slate-500">Sudah Memilih</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.voted}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Daftar registrasi warga</h3>
            <p className="text-sm text-slate-500">Kelola kehadiran dan aktivasi bilik</p>
          </div>
          <Users className="text-slate-400" size={18} />
        </div>
        {votingStatus !== "active" ? (
          <div className="flex flex-col gap-3 border-b border-gray-300 bg-amber-50 px-6 py-3 text-sm text-amber-800 md:flex-row md:items-center md:justify-between">
            <p>Registrasi kehadiran dan akses bilik hanya tersedia saat sesi voting aktif.</p>
            <Link
              href="/voting"
              className="inline-flex items-center gap-2 self-start rounded-lg bg-amber-400 px-4 py-2 font-semibold text-white transition hover:bg-amber-500 md:self-auto"
            >
              Buka Halaman E-Voting
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                <th className="border-b border-gray-300 p-4">NIK / Nama</th>
                <th className="border-b border-gray-300 p-4">Alamat</th>
                <th className="border-b border-gray-300 p-4 text-center">Kehadiran</th>
                <th className="border-b border-gray-300 p-4 text-center">Akses Bilik Suara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.map((resident) => {
                const isActive = activeVoterId === resident.id;

                return (
                  <tr
                    key={resident.id}
                    className={`transition-colors ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-800">{resident.name}</div>
                      <div className="text-xs text-gray-500">{resident.nik}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {resident.address}{" "}
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">
                        Blok {resident.block || "-"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => void handleAttendanceAction(resident.id, resident.isPresent)}
                        disabled={votingStatus !== "active"}
                        className={`inline-flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                          votingStatus !== "active"
                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                            : resident.isPresent
                              ? "cursor-pointer bg-amber-500 text-white shadow hover:bg-amber-600 hover:shadow-md"
                              : "cursor-pointer bg-emerald-600 text-white shadow hover:bg-emerald-700 hover:shadow-md"
                        }`}
                      >
                        {resident.isPresent ? <UserX size={16} /> : <UserCheck size={16} />}
                        <span>{resident.isPresent ? "Tandai Absen" : "Tandai Hadir"}</span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      {resident.hasVoted ? (
                        <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
                          Selesai Memilih
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleActivateBooth(resident.id)}
                          disabled={!resident.isPresent || votingStatus !== "active"}
                          className={`inline-flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                            !resident.isPresent || votingStatus !== "active"
                              ? "cursor-not-allowed bg-gray-100 text-gray-400"
                              : isActive
                                ? "cursor-pointer bg-red-500 text-white ring-2 ring-red-200 hover:bg-red-600"
                                : "cursor-pointer bg-blue-600 text-white shadow hover:bg-blue-700 hover:shadow-md"
                          }`}
                        >
                          <MonitorPlay size={16} />
                          <span>{isActive ? "Batalkan Akses" : "Buka Bilik"}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Data warga tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={!!boothConfirmResident}
        onClose={closeBoothConfirmModal}
        title="Konfirmasi Buka Bilik"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Buka akses bilik untuk {boothConfirmResident?.name}?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Setelah dikonfirmasi, akun ini akan menjadi pemilih aktif di bilik suara.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">NIK:</span>{" "}
              {boothConfirmResident?.nik || "-"}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Alamat:</span>{" "}
              {boothConfirmResident?.address || "-"}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">RT/RW:</span>{" "}
              {boothConfirmResident?.rt || "-"}/{boothConfirmResident?.rw || "-"}
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-300 pt-4">
            <button
              type="button"
              onClick={closeBoothConfirmModal}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmActivateBooth()}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700"
            >
              Ya, Buka Bilik
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!attendanceConfirmResident}
        onClose={closeAttendanceConfirmModal}
        title="Konfirmasi Tandai Absen"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Ubah status kehadiran {attendanceConfirmResident?.name} menjadi absen?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Gunakan aksi ini jika kehadiran warga perlu dibatalkan atau tercatat keliru.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">NIK:</span>{" "}
              {attendanceConfirmResident?.nik || "-"}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Alamat:</span>{" "}
              {attendanceConfirmResident?.address || "-"}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">RT/RW:</span>{" "}
              {attendanceConfirmResident?.rt || "-"}/{attendanceConfirmResident?.rw || "-"}
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-300 pt-4">
            <button
              type="button"
              onClick={closeAttendanceConfirmModal}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmAbsent()}
              className="cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-amber-600"
            >
              Ya, Tandai Absen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
