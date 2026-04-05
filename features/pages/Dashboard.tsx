"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Target,
  Trophy,
  UserCheck,
  Users,
  Vote,
} from "lucide-react";
import { useApp } from "@/features/context/AppContext";

export default function Dashboard() {
  const { residents, candidates, votingStatus, setVotingStatus } = useApp();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString("id-ID"));
  }, []);

  const stats = useMemo(() => {
    const totalResidents = residents.length;
    const activeResidents = residents.filter((resident) => resident.status === "Aktif");
    const totalVotes = activeResidents.filter((resident) => resident.hasVoted).length;
    const presentResidents = activeResidents.filter((resident) => resident.isPresent);
    const presentCount = presentResidents.length;
    const activeVotersCount = activeResidents.length;
    const remainingVoters = activeResidents.filter((resident) => !resident.hasVoted);
    const presentButNotVoted = activeResidents.filter(
      (resident) => resident.isPresent && !resident.hasVoted,
    );
    const turnoutPercentage =
      activeVotersCount > 0 ? (totalVotes / activeVotersCount) * 100 : 0;
    const targetTurnout = 80;
    const targetVotes = Math.ceil((targetTurnout / 100) * activeVotersCount);
    const votesNeededForTarget = Math.max(targetVotes - totalVotes, 0);
    const attendanceConversion =
      presentCount > 0 ? (totalVotes / presentCount) * 100 : 0;

    return {
      totalResidents,
      activeVotersCount,
      totalVotes,
      presentCount,
      absentCount: Math.max(activeVotersCount - presentCount, 0),
      turnoutPercentage,
      targetTurnout,
      targetVotes,
      votesNeededForTarget,
      remainingVotersCount: remainingVoters.length,
      presentButNotVoted,
      remainingVoters,
      attendanceConversion,
    };
  }, [residents]);

  const rankedCandidates = useMemo(() => {
    return [...candidates].sort((left, right) => right.voteCount - left.voteCount);
  }, [candidates]);

  const leader = rankedCandidates[0];
  const runnerUp = rankedCandidates[1];
  const voteMargin = leader && runnerUp ? leader.voteCount - runnerUp.voteCount : leader?.voteCount || 0;
  const turnoutProgress = Math.min((stats.turnoutPercentage / stats.targetTurnout) * 100, 100);

  const chartData = useMemo(() => {
    return rankedCandidates.map((candidate) => ({
      name: `No. ${candidate.number} ${candidate.name.split(" ")[0]}`,
      votes: candidate.voteCount,
      fullName: candidate.name,
      shareOfVotes:
        stats.totalVotes > 0 ? (candidate.voteCount / stats.totalVotes) * 100 : 0,
    }));
  }, [rankedCandidates, stats.totalVotes]);

  const rtBreakdown = useMemo(() => {
    const grouped = new Map<
      string,
      {
        rt: string;
        total: number;
        voted: number;
        present: number;
      }
    >();

    for (const resident of residents.filter((item) => item.status === "Aktif")) {
      const bucket = grouped.get(resident.rt) || {
        rt: resident.rt,
        total: 0,
        voted: 0,
        present: 0,
      };
      bucket.total += 1;
      if (resident.hasVoted) {
        bucket.voted += 1;
      }
      if (resident.isPresent) {
        bucket.present += 1;
      }
      grouped.set(resident.rt, bucket);
    }

    return [...grouped.values()]
      .map((item) => ({
        ...item,
        turnout: item.total > 0 ? (item.voted / item.total) * 100 : 0,
        waiting: Math.max(item.present - item.voted, 0),
      }))
      .sort((left, right) => left.turnout - right.turnout);
  }, [residents]);

  const actionItems = useMemo(() => {
    const items: Array<{
      title: string;
      description: string;
      tone: "amber" | "blue" | "emerald";
    }> = [];

    if (stats.presentButNotVoted.length > 0) {
      items.push({
        title: `${stats.presentButNotVoted.length} warga hadir belum memilih`,
        description: "Arahkan petugas ke meja registrasi atau minta warga melanjutkan proses memilih.",
        tone: "amber",
      });
    }

    const lowestRt = rtBreakdown[0];
    if (lowestRt) {
      items.push({
        title: `RT ${lowestRt.rt} turnout terendah (${lowestRt.turnout.toFixed(1)}%)`,
        description: `${lowestRt.voted}/${lowestRt.total} warga aktif sudah memilih.`,
        tone: "blue",
      });
    }

    if (leader && runnerUp && voteMargin <= 3) {
      items.push({
        title: `Selisih kandidat sangat tipis: ${voteMargin} suara`,
        description: `Pantau ${leader.name} dan ${runnerUp.name} karena hasil masih sangat dinamis.`,
        tone: "amber",
      });
    }

    if (votingStatus === "not_started" && stats.presentCount > 0) {
      items.push({
        title: `${stats.presentCount} warga sudah hadir, sesi belum dibuka`,
        description: "Mulai sesi voting agar antrean tidak menumpuk di meja registrasi.",
        tone: "amber",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "Situasi terkendali",
        description: "Tidak ada exception mendesak. Fokus pada monitoring partisipasi total.",
        tone: "emerald",
      });
    }

    return items.slice(0, 4);
  }, [
    leader,
    runnerUp,
    rtBreakdown,
    stats.presentButNotVoted.length,
    stats.presentCount,
    voteMargin,
    votingStatus,
  ]);

  const quickActions = useMemo(() => {
    return [
      {
        label: votingStatus === "not_started" ? "Mulai Voting" : "Lihat Kontrol Voting",
        href: "/voting" as Route,
        helper:
          votingStatus === "not_started"
            ? "Buka sesi dan mulai penghitungan suara."
            : "Akses kontrol sesi dan status pemilihan.",
      },
      {
        label: "Meja Registrasi",
        href: "/attendance" as Route,
        helper: "Kelola kehadiran dan pantau warga yang belum memilih.",
      },
      {
        label: "Pantau Data Warga",
        href: "/residents" as Route,
        helper: "Cek warga aktif, alamat, dan status partisipasi.",
      },
    ];
  }, [votingStatus]);

  const closedSummary = useMemo(() => {
    if (votingStatus !== "closed" || !leader) {
      return null;
    }

    return {
      winner: leader,
      margin: voteMargin,
      totalVotes: stats.totalVotes,
      turnout: stats.turnoutPercentage,
    };
  }, [leader, stats.totalVotes, stats.turnoutPercentage, voteMargin, votingStatus]);

  const handlePrimaryAction = async () => {
    if (votingStatus === "not_started") {
      await setVotingStatus("active");
      return;
    }

    if (votingStatus === "active") {
      await setVotingStatus("closed");
      return;
    }

    if (window.confirm("Apakah Anda yakin ingin mereset seluruh sesi pemilihan?")) {
      await setVotingStatus("not_started", true);
    }
  };

  const primaryActionLabel =
    votingStatus === "not_started"
      ? "Mulai Sesi Voting"
      : votingStatus === "active"
        ? "Tutup dan Finalkan"
        : "Reset Sesi Baru";

  const primaryActionIcon =
    votingStatus === "not_started"
      ? Play
      : votingStatus === "active"
        ? Square
        : RotateCcw;

  const PrimaryActionIcon = primaryActionIcon;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Operasional</h2>
          <span className="text-sm text-gray-500">
            Update Terakhir: {lastUpdated ?? "--:--:--"}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-gray-300">
          <Clock3 size={16} />
          {votingStatus === "active" ? "Sesi voting sedang aktif" : "Sesi voting belum aktif"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-gray-300 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                <Sparkles size={14} />
                {votingStatus === "closed" ? "Rekap Final" : "Command Center"}
              </div>
              <h3 className="text-2xl font-bold">
                {closedSummary
                  ? `Pemenang sementara final: ${closedSummary.winner.name}`
                  : "Fokus pada keputusan operasional berikutnya"}
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                {closedSummary
                  ? `Sesi telah ditutup dengan ${closedSummary.totalVotes} suara masuk dan tingkat partisipasi ${closedSummary.turnout.toFixed(1)}%.`
                  : actionItems[0]?.description}
              </p>
            </div>
            <div
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                votingStatus === "active"
                  ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
                  : votingStatus === "closed"
                    ? "border border-rose-200 bg-rose-100 text-rose-700"
                    : "border border-slate-200 bg-slate-100 text-slate-700"
              }`}
            >
              {votingStatus === "active"
                ? "Sedang Berjalan"
                : votingStatus === "closed"
                  ? "Ditutup"
                  : "Belum Dimulai"}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-300 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">Status Kritis</p>
              <p className="mt-2 text-lg font-bold">
                {closedSummary
                  ? `Menang ${closedSummary.margin} suara`
                  : `${stats.presentButNotVoted.length} warga perlu ditindak`}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {closedSummary
                  ? runnerUp
                    ? `Unggul atas ${runnerUp.name}.`
                    : "Belum ada pembanding kandidat."
                  : "Prioritaskan warga yang sudah hadir namun belum mencoblos."}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-300 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">Target Partisipasi</p>
              <p className="mt-2 text-lg font-bold">{stats.turnoutPercentage.toFixed(1)}%</p>
              <p className="mt-1 text-sm text-slate-300">
                {stats.votesNeededForTarget > 0
                  ? `Butuh ${stats.votesNeededForTarget} suara lagi untuk menyentuh target ${stats.targetTurnout}%.`
                  : "Target partisipasi telah terlampaui."}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-300 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Konversi Hadir ke Suara
              </p>
              <p className="mt-2 text-lg font-bold">{stats.attendanceConversion.toFixed(1)}%</p>
              <p className="mt-1 text-sm text-slate-300">
                {stats.presentButNotVoted.length > 0
                  ? `${stats.presentButNotVoted.length} suara bisa masuk tanpa menunggu warga baru hadir.`
                  : "Semua warga yang hadir sudah dikonversi menjadi suara."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void handlePrimaryAction()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <PrimaryActionIcon size={16} />
              {primaryActionLabel}
            </button>
            <Link
              href="/attendance"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <UserCheck size={16} />
              Buka Meja Registrasi
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Progress Harian
              </p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {stats.turnoutPercentage.toFixed(1)}%
              </h3>
            </div>
            <Target className="text-blue-500" size={22} />
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
              style={{ width: `${turnoutProgress}%` }}
            />
          </div>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Suara masuk</span>
              <span className="font-semibold text-slate-900">
                {stats.totalVotes}/{stats.activeVotersCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Belum memilih</span>
              <span className="font-semibold text-slate-900">{stats.remainingVotersCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Hadir tapi belum memilih</span>
              <span className="font-semibold text-amber-700">{stats.presentButNotVoted.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Warga belum hadir</span>
              <span className="font-semibold text-slate-900">{stats.absentCount}</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Konteks Perubahan
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Jika antrean saat ini diselesaikan, partisipasi dapat naik dari{" "}
              {stats.turnoutPercentage.toFixed(1)}% menjadi{" "}
              {stats.activeVotersCount > 0
                ? (
                    ((stats.totalVotes + stats.presentButNotVoted.length) /
                      stats.activeVotersCount) *
                    100
                  ).toFixed(1)
                : "0.0"}
              % tanpa menunggu warga baru hadir.
            </p>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center space-x-4 rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">DPT Aktif</p>
            <p className="text-2xl font-bold text-gray-800">{stats.activeVotersCount}</p>
            <p className="mt-1 text-xs text-gray-400">{stats.totalResidents} total warga</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
            <Vote size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Suara Masuk</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalVotes}</p>
            <p className="mt-1 text-xs text-gray-400">
              {stats.totalVotes > 0 ? "Penghitungan berjalan real-time" : "Belum ada suara masuk"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Partisipasi</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.turnoutPercentage.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Target {stats.targetTurnout}% • sisa {stats.votesNeededForTarget} suara
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Kehadiran Fisik</p>
            <p className="text-2xl font-bold text-gray-800">{stats.presentCount}</p>
            <p className="mt-1 text-xs text-gray-400">
              {stats.absentCount} warga aktif belum hadir
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Aksi Cepat</h3>
              <p className="text-sm text-gray-500">
                Jalur cepat untuk kontrol sesi dan tindak lanjut lapangan.
              </p>
            </div>
            <BadgeCheck className="text-blue-500" size={20} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-xl border border-gray-300 bg-slate-50 p-4 transition hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{action.label}</p>
                  <ArrowRight
                    size={16}
                    className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">{action.helper}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Perlu Ditindaklanjuti Hari Ini
              </h3>
              <p className="text-sm text-gray-500">
                Exception yang perlu perhatian operator lebih dulu.
              </p>
            </div>
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <div className="mt-5 space-y-3">
            {actionItems.map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border border-gray-300 p-4 ${
                  item.tone === "amber"
                    ? "bg-amber-50"
                    : item.tone === "blue"
                      ? "bg-blue-50"
                      : "bg-emerald-50"
                }`}
              >
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {votingStatus === "closed" ? "Perolehan Suara Final" : "Perolehan Suara Saat Ini"}
            </h3>
            <span className="text-sm text-gray-500">{stats.totalVotes} suara tercatat</span>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="votes" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Insight Kandidat</h3>
            <Trophy className="text-amber-500" size={20} />
          </div>
          <div className="mt-5 space-y-3">
            {rankedCandidates.map((candidate, index) => {
              const gapFromLeader = Math.max((leader?.voteCount || 0) - candidate.voteCount, 0);
              const label =
                index === 0
                  ? "Unggul"
                  : gapFromLeader <= 3
                    ? "Mengejar"
                    : "Tertinggal";

              return (
                <div key={candidate.id} className="rounded-xl border border-gray-300 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        #{index + 1} • Kandidat {candidate.number}
                      </p>
                      <p className="mt-1 font-bold text-slate-900">{candidate.name}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        label === "Unggul"
                          ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
                          : label === "Mengejar"
                            ? "border border-amber-200 bg-amber-100 text-amber-700"
                            : "border border-slate-300 bg-slate-200 text-slate-700"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Suara</p>
                      <p className="font-semibold text-slate-900">{candidate.voteCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Share suara masuk</p>
                      <p className="font-semibold text-slate-900">
                        {stats.totalVotes > 0
                          ? ((candidate.voteCount / stats.totalVotes) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">
                        {index === 0 ? "Selisih dari runner-up" : "Gap ke pemimpin"}
                      </p>
                      <p className="font-semibold text-slate-900">
                        {index === 0 ? voteMargin : gapFromLeader} suara
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {rankedCandidates.length === 0 ? (
              <div className="rounded-xl border border-gray-300 bg-slate-50 p-4 text-sm text-slate-600">
                Belum ada kandidat terdaftar.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Monitoring Wilayah RT</h3>
              <p className="text-sm text-gray-500">
                Sorot RT yang tertinggal dan RT dengan antrean aktif.
              </p>
            </div>
            <Users className="text-blue-500" size={20} />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {rtBreakdown.slice(0, 6).map((item) => (
              <div key={item.rt} className="rounded-xl border border-gray-300 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">RT {item.rt}</p>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.turnout.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-blue-500"
                    style={{ width: `${item.turnout}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{item.voted}/{item.total} sudah memilih</span>
                  <span>{item.present} hadir</span>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  {item.waiting > 0
                    ? `${item.waiting} warga hadir menunggu giliran.`
                    : "Tidak ada antrean hadir saat ini."}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {votingStatus === "closed" ? "Rekap Final Sesi" : "Ringkasan Monitoring"}
              </h3>
              <p className="text-sm text-gray-500">
                {votingStatus === "closed"
                  ? "Ringkas hasil akhir untuk evaluasi cepat."
                  : "Fokus pada antrean, target, dan distribusi suara."}
              </p>
            </div>
            {votingStatus === "closed" ? (
              <CheckCircle2 className="text-emerald-500" size={20} />
            ) : (
              <BadgeCheck className="text-blue-500" size={20} />
            )}
          </div>
          <div className="mt-5 space-y-3">
            {votingStatus === "closed" && closedSummary ? (
              <>
                <div className="rounded-xl border border-gray-300 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Pemenang
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{closedSummary.winner.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {closedSummary.winner.voteCount} suara dengan margin {closedSummary.margin} suara.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    Total suara final {closedSummary.totalVotes} dari {stats.activeVotersCount} DPT aktif.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    RT dengan turnout terendah tetap perlu evaluasi untuk sesi berikutnya:{" "}
                    {rtBreakdown[0] ? `RT ${rtBreakdown[0].rt}` : "-"}.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    {stats.presentButNotVoted.length > 0
                      ? `${stats.presentButNotVoted.length} warga hadir belum memilih dan bisa segera dikonversi menjadi suara.`
                      : "Tidak ada antrean warga hadir yang belum memilih."}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    {leader
                      ? `${leader.name} memimpin dengan ${leader.voteCount} suara.`
                      : "Belum ada pemimpin sementara karena kandidat belum tersedia."}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    {stats.votesNeededForTarget > 0
                      ? `Masih perlu ${stats.votesNeededForTarget} suara untuk mencapai target partisipasi.`
                      : "Target partisipasi sudah tercapai dan bisa difokuskan ke pemerataan per RT."}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
