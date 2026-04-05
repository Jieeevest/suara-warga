"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Edit2,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import * as yup from "yup";
import Modal from "@/features/components/Modal";
import { useApp } from "@/features/context/AppContext";
import type { Candidate } from "@/lib/types";

const candidateSchema = yup.object({
  number: yup
    .number()
    .typeError("No urut wajib diisi.")
    .required("No urut wajib diisi.")
    .integer("No urut harus berupa angka bulat.")
    .min(1, "No urut minimal 1."),
  name: yup
    .string()
    .trim()
    .required("Nama kandidat wajib diisi.")
    .min(3, "Nama kandidat minimal 3 karakter."),
  vision: yup
    .string()
    .trim()
    .required("Visi kandidat wajib diisi.")
    .min(10, "Visi kandidat minimal 10 karakter."),
  mission: yup
    .string()
    .trim()
    .required("Misi kandidat wajib diisi.")
    .min(10, "Misi kandidat minimal 10 karakter."),
  imageUrl: yup
    .string()
    .trim()
    .test("image-url", "Format foto kandidat tidak valid.", (value) => {
      if (!value) {
        return true;
      }

      return /^data:image\/[a-zA-Z]+;base64,/.test(value) || /^https?:\/\//.test(value);
    }),
});

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border p-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
    hasError ? "border-red-300 bg-red-50" : "border-gray-300"
  }`;

export default function Candidates() {
  const { candidates, addCandidate, updateCandidate, deleteCandidate, votingStatus } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Candidate>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
    setFormErrors({});
  };

  const setFieldValue = <K extends keyof Candidate>(field: K, value: Candidate[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => {
      if (!current[field as string]) {
        return current;
      }

      const next = { ...current };
      delete next[field as string];
      return next;
    });
  };

  const validateForm = async () => {
    try {
      const validated = await candidateSchema.validate(
        {
          number: formData.number,
          name: formData.name || "",
          vision: formData.vision || "",
          mission: formData.mission || "",
          imageUrl: formData.imageUrl || "",
        },
        { abortEarly: false, stripUnknown: true },
      );

      setFormErrors({});
      return validated;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const nextErrors: Record<string, string> = {};
        for (const issue of error.inner) {
          if (issue.path && !nextErrors[issue.path]) {
            nextErrors[issue.path] = issue.message;
          }
        }
        if (error.path && !nextErrors[error.path]) {
          nextErrors[error.path] = error.message;
        }
        setFormErrors(nextErrors);
      }

      return null;
    }
  };

  const handleAdd = async () => {
    if (votingStatus === "active") {
      return;
    }

    const validated = await validateForm();
    if (!validated) {
      return;
    }

    await addCandidate({
      number: validated.number,
      name: validated.name,
      vision: validated.vision,
      mission: validated.mission,
      imageUrl: validated.imageUrl || `https://i.pravatar.cc/300?u=${Date.now()}`,
    });
    closeModal();
  };

  const handleUpdate = async () => {
    if (!editingId) {
      return;
    }

    const validated = await validateForm();
    if (!validated) {
      return;
    }

    await updateCandidate(editingId, validated);
    closeModal();
  };

  const startEdit = (candidate: Candidate) => {
    setEditingId(candidate.id);
    setFormData(candidate);
    setFormErrors({});
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((current) => ({ ...current, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const rankedCandidates = useMemo(() => {
    return [...candidates].sort((left, right) => right.voteCount - left.voteCount);
  }, [candidates]);

  const deletingCandidate = useMemo(() => {
    if (!deletingId) {
      return null;
    }

    return candidates.find((candidate) => candidate.id === deletingId) || null;
  }, [candidates, deletingId]);

  const totalVotes = useMemo(() => {
    return candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
  }, [candidates]);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <Vote size={14} />
              Kandidat
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Kelola kandidat dan materi kampanye</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Simpan profil kandidat, visi-misi, dan pantau posisi suara sementara dari satu halaman.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={votingStatus === "active"}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Plus size={18} />
            Tambah Kandidat
          </button>
        </div>

        {votingStatus === "active" ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Penambahan kandidat dikunci selama sesi e-voting sedang berjalan.
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Kandidat</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{candidates.length}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-emerald-50 p-4">
            <p className="text-sm text-slate-500">Total Suara Tercatat</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalVotes}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-amber-50 p-4">
            <p className="text-sm text-slate-500">Kandidat Terdepan</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {rankedCandidates[0]?.name || "Belum ada data"}
            </p>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isAdding || !!editingId}
        onClose={closeModal}
        title={editingId ? "Edit Kandidat" : "Tambah Kandidat Baru"}
      >
        {Object.keys(formErrors).length > 0 ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Mohon lengkapi profil kandidat dengan benar sebelum disimpan.
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex gap-4">
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                No Urut <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={inputClass(Boolean(formErrors.number))}
                placeholder="0"
                value={formData.number || ""}
                onChange={(event) =>
                  setFieldValue("number", Number.parseInt(event.target.value, 10))
                }
              />
              {formErrors.number ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.number}</p>
              ) : null}
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Kandidat <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass(Boolean(formErrors.name))}
                placeholder="Masukkan nama lengkap kandidat"
                value={formData.name || ""}
                onChange={(event) => setFieldValue("name", event.target.value)}
              />
              {formErrors.name ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
              ) : null}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Visi <span className="text-red-500">*</span>
            </label>
            <textarea
              className={inputClass(Boolean(formErrors.vision))}
              placeholder="Jelaskan visi kandidat"
              rows={2}
              value={formData.vision || ""}
              onChange={(event) => setFieldValue("vision", event.target.value)}
            />
            {formErrors.vision ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.vision}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Misi <span className="text-red-500">*</span>
            </label>
            <textarea
              className={inputClass(Boolean(formErrors.mission))}
              placeholder="Jelaskan misi kandidat (poin-poin)"
              rows={3}
              value={formData.mission || ""}
              onChange={(event) => setFieldValue("mission", event.target.value)}
            />
            {formErrors.mission ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.mission}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Foto Kandidat</label>
            <div className="flex items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white">
                <ImagePlus size={16} />
                Unggah Foto
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {formData.imageUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-300">
                  <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: undefined })}
                    className="absolute right-0 top-0 cursor-pointer rounded-bl bg-red-500 p-0.5 text-white opacity-80 transition-opacity hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-300 pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void (editingId ? handleUpdate() : handleAdd())}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700"
          >
            <Save size={16} />
            Simpan
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!deletingCandidate}
        onClose={() => setDeletingId(null)}
        title="Konfirmasi Hapus Kandidat"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="rounded-full bg-red-100 p-2 text-red-700">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Hapus kandidat {deletingCandidate?.name}?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Data kandidat, foto, dan informasi kampanye akan dihapus dari daftar.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">No Urut:</span>{" "}
              {deletingCandidate?.number || "-"}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Nama:</span>{" "}
              {deletingCandidate?.name || "-"}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Suara Saat Ini:</span>{" "}
              {deletingCandidate?.voteCount || 0}
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-300 pt-4">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (!deletingId) {
                  return;
                }

                void deleteCandidate(deletingId).then(() => {
                  setDeletingId(null);
                });
              }}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700"
            >
              Ya, Hapus Kandidat
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {rankedCandidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm"
          >
            <div className="relative h-48 bg-slate-100">
              <img src={candidate.imageUrl} alt={candidate.name} className="h-full w-full object-cover" />
              <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {candidate.number}
              </div>
              {index === 0 ? (
                <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Trophy size={14} />
                  Terdepan
                </div>
              ) : null}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Share suara:{" "}
                    <span className="font-semibold text-slate-700">
                      {totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : "0.0"}%
                    </span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(candidate)}
                    className="cursor-pointer rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(candidate.id)}
                    className="cursor-pointer rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-300 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Suara</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{candidate.voteCount}</p>
                </div>
                <div className="rounded-xl border border-gray-300 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Peringkat</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">#{index + 1}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visi</p>
                <p className="mt-1 text-sm text-slate-700">{candidate.vision || "-"}</p>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Misi</p>
                <p className="mt-1 text-sm text-slate-700 line-clamp-3">{candidate.mission || "-"}</p>
              </div>
            </div>
          </div>
        ))}
        {rankedCandidates.length === 0 ? (
          <div className="rounded-2xl border border-gray-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm lg:col-span-3">
            Belum ada kandidat yang terdaftar.
          </div>
        ) : null}
      </div>
    </div>
  );
}
