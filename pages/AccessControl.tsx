import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, Edit2, Shield, Eye, EyeOff } from "lucide-react";
import { User, UserRole } from "../types";
import Modal from "../components/Modal";

const AccessControl: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleAdd = () => {
    if (formData.username && formData.password && formData.name) {
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role || "resident",
      };
      addUser(newUser);
      setIsAdding(false);
      setFormData({});
      setShowPassword(false);
    }
  };

  const handleUpdate = () => {
    if (editingId && formData.username) {
      updateUser(editingId, formData);
      setEditingId(null);
      setFormData({});
      setShowPassword(false);
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setFormData(user);
    setShowPassword(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Hak Akses Sistem</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <Plus size={18} />
          <span>Tambah User</span>
        </button>
      </div>

      <Modal
        isOpen={isAdding || !!editingId}
        onClose={() => {
          setIsAdding(false);
          setEditingId(null);
          setFormData({});
          setShowPassword(false);
        }}
        title={editingId ? "Edit User" : "Tambah User Baru"}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Username login"
              value={formData.username || ""}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Nama pengguna"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              value={formData.role || "resident"}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
            >
              <option value="resident">Warga (User Biasa)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10"
                placeholder="Password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              setIsAdding(false);
              setEditingId(null);
              setFormData({});
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={editingId ? handleUpdate : handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-all"
          >
            Simpan
          </button>
        </div>
      </Modal>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-xs uppercase tracking-wider text-gray-600">
                <th className="p-4 font-semibold">Username</th>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Shield size={16} className="text-gray-400" />
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{u.name}</td>
                  <td className="p-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {u.role === "admin" ? "Administrator" : "Warga"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => startEdit(u)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    {u.id !== "admin" && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
