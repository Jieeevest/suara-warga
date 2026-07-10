"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  History,
  Play,
  RotateCcw,
  Save,
  Square,
  Trophy,
  Users,
  Vote,
  X,
} from "lucide-react";
import Modal from "@/features/components/Modal";
import { useApp } from "@/features/context/AppContext";
import type { VotingSessionRecord } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null) {
  if (!iso) {
    return "-";
  }
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sessionWinner(session: VotingSessionRecord) {
  if (session.results.length === 0) {
    return "-";
  }
  return [...session.results].sort((a, b) => b.voteCount - a.voteCount)[0].name;
}

export default function Voting() {
  const { candidates, residents, votingStatus, setVotingStatus, isAdmin } = useApp();
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [agenda, setAgenda] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [startError, setStartError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [sessions, setSessions] = useState<VotingSessionRecord[]>([]);

  const loadSessions = async () => {
    const response = await fetch("/api/voting/sessions", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as { sessions: VotingSessionRecord[] };
    setSessions(payload.sessions);
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const openStartModal = () => {
    setAgenda("");
    setScheduledAt(new Date().toISOString().slice(0, 10));
    setStartError("");
    setIsStartModalOpen(true);
  };

  const handleStartSubmit = async () => {
    if (!agenda.trim()) {
      setStartError("Agenda sesi wajib diisi.");
      return;
    }

    setIsStarting(true);
    try {
      await setVotingStatus("active", { agenda: agenda.trim(), scheduledAt });
      setIsStartModalOpen(false);
    } catch (error) {
      setStartError(error instanceof Error ? error.message : "Gagal memulai sesi voting.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleClose = async () => {
    await setVotingStatus("closed");
    await loadSessions();
  };

  const stats = useMemo(() => {
    const activeResidents = residents.filter((resident) => resident.status === "Aktif");
    const totalVoters = activeResidents.length;
    const votedCount = activeResidents.filter((resident) => resident.hasVoted).length;
    const notVotedCount = totalVoters - votedCount;
    const turnoutPercentage = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;

    return {
      totalVoters,
      votedCount,
      notVotedCount,
      turnoutPercentage,
    };
  }, [residents]);

  const chartData = useMemo(() => {
    return [...candidates]
      .sort((a, b) => b.voteCount - a.voteCount)
      .map((candidate) => ({
        name: candidate.name,
        label: `No. ${candidate.number}`,
        votes: candidate.voteCount,
      }));
  }, [candidates]);

  const notVotedResidents = useMemo(() => {
    return residents.filter((resident) => resident.status === "Aktif" && !resident.hasVoted);
  }, [residents]);

  const colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];

  if (!isAdmin) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-300 bg-white text-sm text-gray-500 shadow-sm">
        Halaman ini khusus untuk Administrator.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <Vote size={14} />
              Voting Control
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Kontrol sesi dan rekap e-voting</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Buka atau tutup sesi pemilihan, lalu pantau suara masuk dan warga yang belum menggunakan hak pilih.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {votingStatus === "not_started" ? (
              <button
                type="button"
                onClick={openStartModal}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                <Play size={16} />
                Mulai Pemilihan
              </button>
            ) : null}
            {votingStatus === "active" ? (
              <button
                type="button"
                onClick={() => void handleClose()}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <Square size={16} />
                Tutup Pemilihan
              </button>
            ) : null}
            {votingStatus === "closed" ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Apakah Anda yakin ingin mereset seluruh sesi pemilihan?")) {
                    void setVotingStatus("not_started", { reset: true });
                  }
                }}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <RotateCcw size={16} />
                Reset Sesi
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Status Sesi</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {votingStatus === "active"
                ? "Sedang Berjalan"
                : votingStatus === "closed"
                  ? "Ditutup"
                  : "Belum Dimulai"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-blue-50 p-4">
            <p className="text-sm text-slate-500">DPT Aktif</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalVoters}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-emerald-50 p-4">
            <p className="text-sm text-slate-500">Sudah Memilih</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.votedCount}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-amber-50 p-4">
            <p className="text-sm text-slate-500">Belum Memilih</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.notVotedCount}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Grafik perolehan suara</h3>
              <p className="text-sm text-slate-500">
                Turnout saat ini {stats.turnoutPercentage.toFixed(1)}% dari DPT aktif.
              </p>
            </div>
          </div>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={78} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${value} suara`, "Perolehan"]}
                  labelFormatter={(label) => `Kandidat: ${label}`}
                />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]} barSize={42}>
                  {chartData.map((entry, index) => (
                    <Cell key={`${entry.label}-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Detail perolehan</h3>
          <div className="mt-5 space-y-3">
            {[...candidates]
              .sort((a, b) => b.voteCount - a.voteCount)
              .map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between rounded-xl border border-gray-300 bg-gray-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-bold text-slate-700">
                      {candidate.number}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{candidate.name}</p>
                      <p className="text-xs text-gray-500">
                        {stats.totalVoters > 0
                          ? ((candidate.voteCount / stats.totalVoters) * 100).toFixed(1)
                          : 0}
                        % dari DPT aktif
                      </p>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">{candidate.voteCount}</div>
                </div>
              ))}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-300 p-6">
          <h3 className="text-lg font-semibold text-slate-900">Daftar warga belum memilih</h3>
          <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            {stats.notVotedCount} Orang
          </span>
        </div>
        <div className="max-h-96 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">NIK</th>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Alamat</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notVotedResidents.length > 0 ? (
                notVotedResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-mono text-gray-600">{resident.nik}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">{resident.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {resident.address} (RT {resident.rt}/RW {resident.rw})
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded border border-slate-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                        Belum Voting
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Semua warga aktif telah menggunakan hak pilihnya.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-300 p-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Riwayat Sesi Pemilihan</h3>
            <p className="text-sm text-slate-500">Arsip agenda, jadwal, dan hasil tiap sesi.</p>
          </div>
          <History className="text-slate-400" size={20} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Agenda</th>
                <th className="px-6 py-3">Jadwal</th>
                <th className="px-6 py-3">Mulai</th>
                <th className="px-6 py-3">Tutup</th>
                <th className="px-6 py-3 text-center">Total Suara</th>
                <th className="px-6 py-3 text-center">Turnout</th>
                <th className="px-6 py-3">Pemenang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">{session.agenda}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatDate(session.scheduledAt)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatDateTime(session.startedAt)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {formatDateTime(session.closedAt)}
                    </td>
                    <td className="px-6 py-3 text-center text-sm font-semibold text-slate-900">
                      {session.totalVotes}
                    </td>
                    <td className="px-6 py-3 text-center text-sm text-slate-600">
                      {session.turnoutPercentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-800">
                      {session.closedAt ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Trophy size={14} className="text-amber-500" />
                          {sessionWinner(session)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Belum ditutup</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Belum ada riwayat sesi pemilihan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="Mulai Sesi Pemilihan"
      >
        {startError ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {startError}
          </div>
        ) : null}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Agenda <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="Pemilihan Ketua RW 05 Periode 2026-2029"
              value={agenda}
              onChange={(event) => setAgenda(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <CalendarClock size={14} />
              Jadwal Pelaksanaan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-300 pt-4">
          <button
            type="button"
            onClick={() => setIsStartModalOpen(false)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <X size={16} />
            Batal
          </button>
          <button
            type="button"
            disabled={isStarting}
            onClick={() => void handleStartSubmit()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {isStarting ? "Memulai..." : "Mulai Sesi"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
