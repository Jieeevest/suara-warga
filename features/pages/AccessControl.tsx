"use client";

import { useMemo, useState } from "react";
import { Edit2, Eye, EyeOff, Plus, Save, Shield, Trash2, Users } from "lucide-react";
import * as yup from "yup";
import AppSelect, { type SelectOption } from "@/features/components/AppSelect";
import Modal from "@/features/components/Modal";
import { useApp } from "@/features/context/AppContext";
import {
  PASSWORD_POLICY_HINT,
  PASSWORD_POLICY_MESSAGE,
  validatePasswordStrength,
} from "@/lib/password-policy";
import type { User, UserRole } from "@/lib/types";

const addUserSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username wajib diisi.")
    .min(4, "Username minimal 4 karakter."),
  name: yup
    .string()
    .trim()
    .required("Nama lengkap wajib diisi.")
    .min(3, "Nama lengkap minimal 3 karakter."),
  role: yup
    .mixed<UserRole>()
    .oneOf(["admin", "resident"], "Role user tidak valid.")
    .required("Role user wajib dipilih."),
  password: yup
    .string()
    .required("Password wajib diisi.")
    .test("password-strength", PASSWORD_POLICY_MESSAGE, (value) =>
      value ? validatePasswordStrength(value) : false,
    ),
  confirmPassword: yup
    .string()
    .required("Konfirmasi password wajib diisi.")
    .oneOf([yup.ref("password")], "Konfirmasi password harus sama."),
});

const updateUserSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username wajib diisi.")
    .min(4, "Username minimal 4 karakter."),
  name: yup
    .string()
    .trim()
    .required("Nama lengkap wajib diisi.")
    .min(3, "Nama lengkap minimal 3 karakter."),
  role: yup
    .mixed<UserRole>()
    .oneOf(["admin", "resident"], "Role user tidak valid.")
    .required("Role user wajib dipilih."),
  password: yup
    .string()
    .transform((value) => value || "")
    .test(
      "password-strength",
      PASSWORD_POLICY_MESSAGE,
      (value) => !value || validatePasswordStrength(value),
    ),
  confirmPassword: yup.string().test(
    "confirm-password",
    "Konfirmasi password harus sama.",
    function confirmPassword(value) {
      const password = this.parent.password as string;
      if (!password) {
        return !value;
      }

      if (!value) {
        return this.createError({ message: "Konfirmasi password wajib diisi." });
      }

      return value === password;
    },
  ),
});

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border p-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
    hasError ? "border-red-300 bg-red-50" : "border-gray-300"
  }`;

export default function AccessControl() {
  const { users, addUser, updateUser, deleteUser, isSuperAdmin } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
    setConfirmPassword("");
    setShowPassword(false);
    setFormErrors({});
  };

  const setFieldValue = <K extends keyof User>(field: K, value: User[K]) => {
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
      const schema = editingId ? updateUserSchema : addUserSchema;
      const validated = await schema.validate(
        {
          username: formData.username || "",
          name: formData.name || "",
          role: (formData.role === "admin" || formData.role === "resident"
            ? formData.role
            : "resident") as UserRole,
          password: formData.password || "",
          confirmPassword,
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

    await addUser({
      username: validated.username,
      password: validated.password,
      name: validated.name,
      role: validated.role,
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

    await updateUser(editingId, {
      username: validated.username,
      name: validated.name,
      role: validated.role,
      ...(validated.password ? { password: validated.password } : {}),
    });
    closeModal();
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({ ...user, password: "" });
    setConfirmPassword("");
    setShowPassword(false);
    setFormErrors({});
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      await deleteUser(id);
    }
  };

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      residents: users.filter((user) => user.role === "resident").length,
    };
  }, [users]);

  const roleOptions = useMemo<SelectOption[]>(
    () => [
      { value: "admin", label: "Administrator" },
      { value: "resident", label: "Warga (User Biasa)" },
    ],
    [],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <Shield size={14} />
              Hak Akses
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Kelola akun dan peran sistem</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Atur administrator dan akun warga dengan kontrol akses yang lebih rapi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={!isSuperAdmin}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            Tambah User
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Akun</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-blue-50 p-4">
            <p className="text-sm text-slate-500">Administrator</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.admins}</p>
          </div>
          <div className="rounded-xl border border-gray-300 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Akun Warga</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.residents}</p>
          </div>
        </div>

        {!isSuperAdmin ? (
          <div className="mt-6 rounded-xl border border-gray-300 bg-amber-50 p-4 text-sm text-amber-800">
            Halaman ini hanya dapat dikelola oleh super admin. Anda masih bisa melihat daftar user, tetapi perubahan dinonaktifkan.
          </div>
        ) : null}
      </section>

      <Modal
        isOpen={isAdding || !!editingId}
        onClose={closeModal}
        title={editingId ? "Edit User" : "Tambah User Baru"}
      >
        {Object.keys(formErrors).length > 0 ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Mohon periksa kembali data user sebelum disimpan.
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass(Boolean(formErrors.username))}
              placeholder="Username login"
              value={formData.username || ""}
              onChange={(event) => setFieldValue("username", event.target.value)}
            />
            {formErrors.username ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.username}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass(Boolean(formErrors.name))}
              placeholder="Nama pengguna"
              value={formData.name || ""}
              onChange={(event) => setFieldValue("name", event.target.value)}
            />
            {formErrors.name ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <AppSelect
              options={roleOptions}
              value={
                roleOptions.find(
                  (option) =>
                    option.value ===
                    (formData.role === "admin" || formData.role === "resident"
                      ? formData.role
                      : "resident"),
                ) || null
              }
              onChange={(option) =>
                setFieldValue("role", (option?.value || "resident") as UserRole)
              }
            />
            {formErrors.role ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.role}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password {!editingId ? <span className="text-red-500">*</span> : null}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`${inputClass(Boolean(formErrors.password))} pr-10`}
                placeholder={
                  editingId ? "Isi jika ingin mengganti password" : "Masukkan password"
                }
                value={formData.password || ""}
                onChange={(event) => setFieldValue("password", event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">{PASSWORD_POLICY_HINT}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Konfirmasi Password {!editingId ? <span className="text-red-500">*</span> : null}
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className={inputClass(Boolean(formErrors.confirmPassword))}
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setFormErrors((current) => {
                  if (!current.confirmPassword) {
                    return current;
                  }

                  const next = { ...current };
                  delete next.confirmPassword;
                  return next;
                });
              }}
            />
            {formErrors.confirmPassword ? (
              <p className="mt-1 text-xs text-red-600">{formErrors.confirmPassword}</p>
            ) : null}
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
            disabled={!isSuperAdmin}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            Simpan
          </button>
        </div>
      </Modal>

      <section className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Daftar akun sistem</h3>
            <p className="text-sm text-slate-500">Super admin, administrator, dan warga</p>
          </div>
          <Users className="text-slate-400" size={18} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
                <th className="p-4 font-semibold">Username</th>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="w-32 p-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Shield size={16} className="text-gray-400" />
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{user.name}</td>
                  <td className="p-4 text-sm">
                    <span
                      className={`rounded-full border px-2 py-1 text-xs font-medium ${
                        user.role === "super_admin"
                          ? "border-rose-200 bg-rose-100 text-rose-800"
                          : user.role === "admin"
                            ? "border-violet-200 bg-violet-100 text-violet-800"
                            : "border-slate-200 bg-slate-100 text-slate-800"
                      }`}
                    >
                      {user.role === "super_admin"
                        ? "Super Admin"
                        : user.role === "admin"
                          ? "Administrator"
                          : "Warga"}
                    </span>
                  </td>
                  <td className="w-32 p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        disabled={!isSuperAdmin || user.role === "super_admin"}
                        className="cursor-pointer rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Edit2 size={16} />
                      </button>
                      {user.id !== "super-admin" ? (
                        <button
                          type="button"
                          onClick={() => void handleDelete(user.id)}
                          disabled={!isSuperAdmin}
                          className="cursor-pointer rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
