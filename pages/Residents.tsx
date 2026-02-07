import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Resident } from "../types";
import Modal from "../components/Modal";

const Residents: React.FC = () => {
  const { residents, addResident, deleteResident, updateResident } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Resident>>({});

  const handleAdd = () => {
    if (formData.name && formData.nik) {
      const newResident: Resident = {
        id: Date.now().toString(),
        nik: formData.nik || "",
        name: formData.name || "",
        address: formData.address || "",
        rt: formData.rt || "",
        rw: formData.rw || "",
        phoneNumber: formData.phoneNumber || "",
        status:
          (formData.status as "Aktif" | "Pindah" | "Meninggal") || "Aktif",
        block: formData.block || "",
        hasVoted: false,
        isPresent: false,
      };
      addResident(newResident);
      setIsAdding(false);
      setFormData({});
    }
  };

  const handleUpdate = () => {
    if (editingId && formData.name) {
      updateResident(editingId, formData);
      setEditingId(null);
      setFormData({});
    }
  };

  const startEdit = (resident: Resident) => {
    setEditingId(resident.id);
    setFormData(resident);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Manajemen Data Warga
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <Plus size={18} />
          <span>Tambah Warga</span>
        </button>
      </div>

      <Modal
        isOpen={isAdding || !!editingId}
        onClose={() => {
          setIsAdding(false);
          setEditingId(null);
          setFormData({});
        }}
        title={editingId ? "Edit Warga" : "Tambah Warga Baru"}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Induk Kependudukan (NIK)
            </label>
            <input
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan 16 digit NIK"
              value={formData.nik || ""}
              onChange={(e) =>
                setFormData({ ...formData, nik: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan nama lengkap sesuai KTP"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Domisili
            </label>
            <textarea
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan alamat lengkap"
              rows={3}
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RT
              </label>
              <select
                className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                value={formData.rt || ""}
                onChange={(e) =>
                  setFormData({ ...formData, rt: e.target.value })
                }
              >
                <option value="">Pilih RT</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={(i + 1).toString().padStart(3, "0")}>
                    {(i + 1).toString().padStart(3, "0")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RW
              </label>
              <select
                className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                value={formData.rw || ""}
                onChange={(e) =>
                  setFormData({ ...formData, rw: e.target.value })
                }
              >
                <option value="">Pilih RW</option>
                <option value="05">05</option>
                <option value="06">06</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Telepon
            </label>
            <input
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan no. telepon"
              value={formData.phoneNumber || ""}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
              value={formData.status || "Aktif"}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
            >
              <option value="Aktif">Aktif</option>
              <option value="Pindah">Pindah</option>
              <option value="Meninggal">Meninggal</option>
            </select>
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
                <th className="p-4 font-semibold">NIK</th>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Alamat</th>
                <th className="p-4 font-semibold">RT/RW</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {residents.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-700">{r.nik}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {r.name}
                    <div className="text-xs text-gray-500">{r.phoneNumber}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 truncate max-w-xs">
                    {r.address}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {r.rt}/{r.rw}
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.status === "Aktif"
                          ? "bg-green-100 text-green-800"
                          : r.status === "Pindah"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => startEdit(r)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteResident(r.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {residents.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    Belum ada data warga.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Residents;
