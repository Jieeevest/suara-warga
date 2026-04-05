"use client";

import { useMemo, useState } from "react";
import { Search, UserCheck, Users } from "lucide-react";
import { useApp } from "@/features/context/AppContext";

export default function Attendance() {
  const { residents, votingStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <UserCheck size={14} />
              Registrasi
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verifikasi kehadiran warga</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kehadiran warga terverifikasi otomatis saat mereka berhasil login ke sesi e-voting.
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
            <p className="text-sm text-slate-500">Sudah Terverifikasi</p>
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
            <h3 className="text-lg font-semibold text-slate-900">Daftar verifikasi warga</h3>
            <p className="text-sm text-slate-500">Status kehadiran berbasis login warga aktif</p>
          </div>
          <Users className="text-slate-400" size={18} />
        </div>
        {votingStatus !== "active" ? (
          <div className="border-b border-gray-300 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            Verifikasi kehadiran otomatis berjalan saat sesi voting aktif dan warga berhasil login.
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                <th className="border-b border-gray-300 p-4">NIK / Nama</th>
                <th className="border-b border-gray-300 p-4">Alamat</th>
                <th className="border-b border-gray-300 p-4 text-center">Kehadiran</th>
                <th className="border-b border-gray-300 p-4 text-center">Status Voting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="transition-colors hover:bg-gray-50">
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
                    {resident.isPresent ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        Belum Login
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {resident.hasVoted ? (
                      <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
                        Selesai Memilih
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                        Menunggu Memilih
                      </span>
                    )}
                  </td>
                </tr>
              ))}

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
    </div>
  );
}
