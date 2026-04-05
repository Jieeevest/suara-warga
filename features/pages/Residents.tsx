"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { Download, Edit2, Mail, Plus, Save, Search, Trash2, Upload, Users } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as yup from "yup";
import AppSelect, { type SelectOption } from "@/features/components/AppSelect";
import Modal from "@/features/components/Modal";
import { useToast } from "@/features/components/ToastProvider";
import { useApp } from "@/features/context/AppContext";
import type { Resident } from "@/lib/types";

const residentSchema = yup.object({
  nik: yup
    .string()
    .trim()
    .required("NIK wajib diisi.")
    .matches(/^\d{16}$/, "NIK harus terdiri dari 16 digit angka."),
  name: yup
    .string()
    .trim()
    .required("Nama lengkap wajib diisi.")
    .min(3, "Nama lengkap minimal 3 karakter."),
  email: yup
    .string()
    .trim()
    .required("Email wajib diisi.")
    .email("Format email tidak valid."),
  birthPlace: yup.string().trim().default(""),
  gender: yup
    .mixed<Resident["gender"]>()
    .oneOf(["", "Laki-laki", "Perempuan"], "Jenis kelamin tidak valid.")
    .default(""),
  identityIssuedPlace: yup.string().trim().default(""),
  occupation: yup.string().trim().default(""),
  phoneNumber: yup
    .string()
    .trim()
    .required("No. telepon wajib diisi.")
    .matches(/^[0-9+\-\s()]{8,20}$/, "No. telepon tidak valid."),
  address: yup
    .string()
    .trim()
    .required("Alamat domisili wajib diisi.")
    .min(10, "Alamat domisili minimal 10 karakter."),
  rt: yup.string().trim().required("RT wajib dipilih."),
  rw: yup.string().trim().required("RW wajib dipilih."),
  status: yup
    .mixed<Resident["status"]>()
    .oneOf(["Aktif", "Pindah", "Meninggal"], "Status warga tidak valid.")
    .required("Status warga wajib dipilih."),
  block: yup.string().trim().default(""),
});

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border p-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
    hasError ? "border-red-300 bg-red-50" : "border-gray-300"
  }`;

export default function Residents() {
  const { residents, addResident, deleteResident, importResidents, updateResident, votingStatus } = useApp();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [sendingResidentId, setSendingResidentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Resident["status"] | "all">("all");
  const [formData, setFormData] = useState<Partial<Resident>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
    setFormErrors({});
  };

  const setFieldValue = <K extends keyof Resident>(field: K, value: Resident[K]) => {
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
      const validated = await residentSchema.validate(
        {
          nik: formData.nik || "",
          name: formData.name || "",
          email: formData.email || "",
          birthPlace: formData.birthPlace || "",
          gender: (formData.gender as Resident["gender"]) || "",
          identityIssuedPlace: formData.identityIssuedPlace || "",
          occupation: formData.occupation || "",
          phoneNumber: formData.phoneNumber || "",
          address: formData.address || "",
          rt: formData.rt || "",
          rw: formData.rw || "",
          status: formData.status || "Aktif",
          block: formData.block || "",
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
    const validated = await validateForm();
    if (!validated) {
      return;
    }

    await addResident({
      nik: validated.nik,
      name: validated.name,
      email: validated.email,
      birthPlace: validated.birthPlace,
      gender: validated.gender,
      identityIssuedPlace: validated.identityIssuedPlace,
      occupation: validated.occupation,
      address: validated.address,
      rt: validated.rt,
      rw: validated.rw,
      phoneNumber: validated.phoneNumber,
      status: validated.status,
      block: validated.block,
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

    await updateResident(editingId, validated);
    closeModal();
  };

  const startEdit = (resident: Resident) => {
    setEditingId(resident.id);
    setFormData(resident);
    setFormErrors({});
  };

  const handleDownloadAccess = async (resident: Resident) => {
    if (resident.status !== "Aktif") {
      return;
    }

    const response = await fetch(`/api/residents/${resident.id}/access`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      showToast({
        title: "Gagal mengambil hak akses",
        description: payload?.error || "Hak akses warga tidak dapat dimuat.",
        tone: "error",
      });
      return;
    }

    const payload = (await response.json()) as {
      resident: {
        name: string;
        nik: string;
        email: string;
        password: string;
      };
    };

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    page.drawRectangle({
      x: 40,
      y: 720,
      width: 515,
      height: 90,
      color: rgb(0.93, 0.96, 1),
      borderColor: rgb(0.23, 0.51, 0.96),
      borderWidth: 1,
    });

    page.drawText("Hak Akses Sistem E-Voting", {
      x: 56,
      y: 780,
      size: 20,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16),
    });

    page.drawText("Sura Warga", {
      x: 56,
      y: 755,
      size: 12,
      font: fontRegular,
      color: rgb(0.29, 0.33, 0.41),
    });

    const lines = [
      { label: "Nama", value: payload.resident.name },
      { label: "NIK / Username", value: payload.resident.nik },
      { label: "Password", value: payload.resident.password },
      { label: "Email", value: payload.resident.email || "-" },
      { label: "RT / RW", value: `${resident.rt || "-"} / ${resident.rw || "-"}` },
      { label: "Alamat", value: resident.address || "-" },
    ];

    let currentY = 675;
    for (const line of lines) {
      page.drawText(`${line.label}:`, {
        x: 56,
        y: currentY,
        size: 12,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      });
      page.drawText(line.value, {
        x: 180,
        y: currentY,
        size: 12,
        font: fontRegular,
        color: rgb(0.2, 0.24, 0.31),
      });
      currentY -= 28;
    }

    page.drawLine({
      start: { x: 56, y: currentY - 6 },
      end: { x: 540, y: currentY - 6 },
      thickness: 1,
      color: rgb(0.82, 0.85, 0.89),
    });

    const notes = [
      "Silakan login menggunakan NIK sebagai username.",
      "Gunakan password 6 karakter yang diberikan petugas.",
      "Simpan dokumen ini dengan aman dan jangan bagikan ke pihak lain.",
    ];

    currentY -= 40;
    page.drawText("Catatan Penggunaan", {
      x: 56,
      y: currentY,
      size: 13,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16),
    });

    currentY -= 26;
    for (const note of notes) {
      page.drawText(`- ${note}`, {
        x: 64,
        y: currentY,
        size: 11,
        font: fontRegular,
        color: rgb(0.29, 0.33, 0.41),
      });
      currentY -= 20;
    }

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `hak-akses-${payload.resident.nik}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleSendAccessEmail = (resident: Resident) => {
    if (!resident.email || sendingResidentId) {
      return;
    }

    setSendingResidentId(resident.id);
    void fetch(`/api/residents/${resident.id}/send-access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || "Gagal mengirim email akses.");
        }

        showToast({
          title: "Email akses terkirim",
          description: `Hak akses berhasil dikirim ke ${resident.email}.`,
          tone: "success",
        });
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Gagal mengirim email akses.";
        showToast({
          title: "Gagal mengirim email akses",
          description: message,
          tone: "error",
        });
      })
      .finally(() => {
        setSendingResidentId(null);
      });
  };

  const normalizeGender = (value: string): Resident["gender"] => {
    const normalized = value.trim().toLowerCase();
    if (["l", "laki-laki", "laki laki", "male", "pria"].includes(normalized)) {
      return "Laki-laki";
    }
    if (["p", "perempuan", "female", "wanita"].includes(normalized)) {
      return "Perempuan";
    }
    return "";
  };

  const getExcelValue = (
    row: Record<string, unknown>,
    keys: string[],
  ) => {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
        return String(row[key]).trim();
      }
    }
    return "";
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        throw new Error("Sheet pertama pada file Excel tidak ditemukan.");
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      const importedResidents = rows
        .map((row) => ({
          name: getExcelValue(row, ["Nama"]),
          birthPlace: getExcelValue(row, ["Tempat Lahir"]),
          gender: normalizeGender(getExcelValue(row, ["Jenis Kelamin"])),
          nik: getExcelValue(row, ["NIK"]),
          identityIssuedPlace: getExcelValue(row, [
            "Tempat di Keluarkan identitas",
            "Tempat Dikeluarkan Identitas",
            "Tempat dikeluarkan identitas",
          ]),
          occupation: getExcelValue(row, ["Pekerjaan"]),
        }))
        .filter((row) => row.name && row.nik);

      if (importedResidents.length === 0) {
        throw new Error(
          "Tidak ada data yang cocok. Pastikan kolom Excel berisi Nama, Tempat Lahir, Jenis Kelamin, NIK, Tempat di Keluarkan identitas, dan Pekerjaan.",
        );
      }

      const result = await importResidents(importedResidents);
      showToast({
        title: "Import Excel selesai",
        description: `${result.created} data baru ditambahkan dan ${result.updated} data diperbarui.`,
        tone: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengimpor file Excel warga.";
      showToast({
        title: "Gagal mengimpor data warga",
        description: message,
        tone: "error",
      });
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const filteredResidents = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return residents.filter((resident) => {
      const block = resident.block || "";
      const matchesSearch =
        resident.name.toLowerCase().includes(term) ||
        resident.nik.includes(searchTerm) ||
        resident.birthPlace.toLowerCase().includes(term) ||
        resident.occupation.toLowerCase().includes(term) ||
        resident.address.toLowerCase().includes(term) ||
        block.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || resident.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [residents, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const active = residents.filter((resident) => resident.status === "Aktif").length;
    const moved = residents.filter((resident) => resident.status === "Pindah").length;
    const deceased = residents.filter((resident) => resident.status === "Meninggal").length;

    return {
      total: residents.length,
      active,
      moved,
      deceased,
    };
  }, [residents]);

  const statusOptions = useMemo<SelectOption[]>(
    () => [
      { value: "all", label: "Semua Status" },
      { value: "Aktif", label: "Aktif" },
      { value: "Pindah", label: "Pindah" },
      { value: "Meninggal", label: "Meninggal" },
    ],
    [],
  );

  const residentStatusOptions = useMemo<SelectOption[]>(
    () => statusOptions.filter((option) => option.value !== "all"),
    [statusOptions],
  );

  const genderOptions = useMemo<SelectOption[]>(
    () => [
      { value: "Laki-laki", label: "Laki-laki" },
      { value: "Perempuan", label: "Perempuan" },
    ],
    [],
  );

  const rtOptions = useMemo<SelectOption[]>(
    () =>
      [...Array(10)].map((_, index) => {
        const value = (index + 1).toString().padStart(3, "0");
        return { value, label: value };
      }),
    [],
  );

  const rwOptions = useMemo<SelectOption[]>(
    () => [
      { value: "05", label: "05" },
      { value: "06", label: "06" },
    ],
    [],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <Users size={14} />
              Data Warga
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Basis data kependudukan RT/RW</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kelola identitas warga, status domisili, dan data kontak dalam satu tabel operasional.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(event) => void handleImportFile(event)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting || votingStatus === "active"}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={18} />
              {isImporting ? "Mengimpor..." : "Import Excel"}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={18} />
              Tambah Warga
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Warga</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-emerald-50 p-4">
            <p className="text-sm text-slate-500">Status Aktif</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.active}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-amber-50 p-4">
            <p className="text-sm text-slate-500">Pindah</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.moved}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-rose-50 p-4">
            <p className="text-sm text-slate-500">Meninggal</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.deceased}</p>
          </div>
        </div>
        {votingStatus === "active" ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Import data warga dinonaktifkan selama sesi voting aktif agar daftar pemilih tetap konsisten.
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Password akun warga dibuat otomatis secara acak dengan panjang 6 karakter saat data dibuat atau diimpor.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Filter dan pencarian</h3>
            <p className="text-sm text-slate-500">
              Telusuri warga berdasarkan nama, NIK, alamat, blok, atau status.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Format Excel: No., Nama, Tempat Lahir, Jenis Kelamin, NIK, Tempat di Keluarkan identitas, Pekerjaan.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 md:w-80"
                placeholder="Cari nama, NIK, alamat, blok..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="md:w-56">
              <AppSelect
                options={statusOptions}
                value={statusOptions.find((option) => option.value === statusFilter) || null}
                onChange={(option) =>
                  setStatusFilter((option?.value || "all") as Resident["status"] | "all")
                }
              />
            </div>
          </div>
        </div>
      </section>

      <Modal
        isOpen={isAdding || !!editingId}
        onClose={closeModal}
        title={editingId ? "Edit Warga" : "Tambah Warga Baru"}
      >
        {Object.keys(formErrors).length > 0 ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Mohon lengkapi data warga dengan benar sebelum disimpan.
          </div>
        ) : null}
        <p className="mb-5 text-sm text-slate-500">
          <span className="font-semibold text-red-500">*</span> wajib diisi
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass(Boolean(formErrors.nik))}
                placeholder="Masukkan 16 digit NIK"
                value={formData.nik || ""}
                onChange={(event) => setFieldValue("nik", event.target.value)}
              />
              {formErrors.nik ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.nik}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass(Boolean(formErrors.name))}
                placeholder="Masukkan nama lengkap sesuai KTP"
                value={formData.name || ""}
                onChange={(event) => setFieldValue("name", event.target.value)}
              />
              {formErrors.name ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tempat Lahir
              </label>
              <input
                className={inputClass(Boolean(formErrors.birthPlace))}
                placeholder="Masukkan tempat lahir"
                value={formData.birthPlace || ""}
                onChange={(event) => setFieldValue("birthPlace", event.target.value)}
              />
              {formErrors.birthPlace ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.birthPlace}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Jenis Kelamin
              </label>
              <AppSelect
                options={genderOptions}
                placeholder="Pilih jenis kelamin"
                value={
                  genderOptions.find(
                    (option) => option.value === ((formData.gender as string) || ""),
                  ) || null
                }
                onChange={(option) =>
                  setFieldValue("gender", (option?.value || "") as Resident["gender"])
                }
              />
              {formErrors.gender ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.gender}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={inputClass(Boolean(formErrors.email))}
                placeholder="Masukkan email warga"
                value={formData.email || ""}
                onChange={(event) => setFieldValue("email", event.target.value)}
              />
              {formErrors.email ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                No. Telepon <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass(Boolean(formErrors.phoneNumber))}
                placeholder="Masukkan no. telepon"
                value={formData.phoneNumber || ""}
                onChange={(event) => setFieldValue("phoneNumber", event.target.value)}
              />
              {formErrors.phoneNumber ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.phoneNumber}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Pekerjaan
              </label>
              <input
                className={inputClass(Boolean(formErrors.occupation))}
                placeholder="Masukkan pekerjaan"
                value={formData.occupation || ""}
                onChange={(event) => setFieldValue("occupation", event.target.value)}
              />
              {formErrors.occupation ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.occupation}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tempat Dikeluarkan Identitas
              </label>
              <input
                className={inputClass(Boolean(formErrors.identityIssuedPlace))}
                placeholder="Masukkan lokasi penerbit identitas"
                value={formData.identityIssuedPlace || ""}
                onChange={(event) => setFieldValue("identityIssuedPlace", event.target.value)}
              />
              {formErrors.identityIssuedPlace ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.identityIssuedPlace}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Alamat Domisili <span className="text-red-500">*</span>
              </label>
              <textarea
                className={inputClass(Boolean(formErrors.address))}
                placeholder="Masukkan alamat lengkap"
                rows={4}
                value={formData.address || ""}
                onChange={(event) => setFieldValue("address", event.target.value)}
              />
              {formErrors.address ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  RT <span className="text-red-500">*</span>
                </label>
                <AppSelect
                  options={rtOptions}
                  placeholder="Pilih RT"
                  value={rtOptions.find((option) => option.value === (formData.rt || "")) || null}
                  onChange={(option) => setFieldValue("rt", option?.value || "")}
                />
                {formErrors.rt ? <p className="mt-1 text-xs text-red-600">{formErrors.rt}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  RW <span className="text-red-500">*</span>
                </label>
                <AppSelect
                  options={rwOptions}
                  placeholder="Pilih RW"
                  value={rwOptions.find((option) => option.value === (formData.rw || "")) || null}
                  onChange={(option) => setFieldValue("rw", option?.value || "")}
                />
                {formErrors.rw ? <p className="mt-1 text-xs text-red-600">{formErrors.rw}</p> : null}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <AppSelect
                options={residentStatusOptions}
                value={
                  residentStatusOptions.find(
                    (option) => option.value === ((formData.status as string) || "Aktif"),
                  ) || null
                }
                onChange={(option) =>
                  setFieldValue("status", (option?.value || "Aktif") as Resident["status"])
                }
              />
              {formErrors.status ? (
                <p className="mt-1 text-xs text-red-600">{formErrors.status}</p>
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

      <section className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Daftar warga</h3>
            <p className="text-sm text-slate-500">{filteredResidents.length} data ditampilkan</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                <th className="p-4 font-semibold">Identitas</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Kontak</th>
                <th className="p-4 font-semibold">Alamat</th>
                <th className="p-4 text-center font-semibold">RT/RW</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="text-sm font-semibold text-slate-900">{resident.name}</div>
                    <div className="text-xs text-slate-500">{resident.nik}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {resident.gender || "-"} • {resident.birthPlace || "-"} • {resident.occupation || "-"}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{resident.email || "-"}</td>
                  <td className="p-4 text-sm text-slate-600">{resident.phoneNumber || "-"}</td>
                  <td className="max-w-sm p-4 text-sm text-slate-600">
                    <div>{resident.address || "-"}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      Blok {resident.block || "-"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Identitas diterbitkan di {resident.identityIssuedPlace || "-"}
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm text-slate-600">
                    {resident.rt || "-"}/{resident.rw || "-"}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex justify-center">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${
                          resident.status === "Aktif"
                            ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                            : resident.status === "Pindah"
                              ? "border-amber-200 bg-amber-100 text-amber-800"
                              : "border-rose-200 bg-rose-100 text-rose-800"
                        }`}
                      >
                        {resident.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadAccess(resident)}
                      disabled={resident.status !== "Aktif"}
                      className="cursor-pointer rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Download access"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAccessEmail(resident)}
                      disabled={
                        resident.status !== "Aktif" ||
                        !resident.email ||
                        sendingResidentId === resident.id
                      }
                      className="cursor-pointer rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Send access via email"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(resident)}
                      className="cursor-pointer rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteResident(resident.id)}
                      className="cursor-pointer rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-gray-500">
                    Tidak ada data warga yang cocok dengan filter saat ini.
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
