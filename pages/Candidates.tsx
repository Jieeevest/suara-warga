import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Candidate } from "../types";
import Modal from "../components/Modal";

const Candidates: React.FC = () => {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } =
    useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Candidate>>({});

  const handleAdd = () => {
    if (formData.name && formData.number) {
      const newCandidate: Candidate = {
        id: Date.now().toString(),
        number: Number(formData.number),
        name: formData.name || "",
        vision: formData.vision || "",
        mission: formData.mission || "",
        imageUrl:
          formData.imageUrl || `https://i.pravatar.cc/300?u=${Date.now()}`,
        voteCount: 0,
      };
      addCandidate(newCandidate);
      setIsAdding(false);
      setFormData({});
    }
  };

  const handleUpdate = () => {
    if (editingId && formData.name) {
      updateCandidate(editingId, formData);
      setEditingId(null);
      setFormData({});
    }
  };

  const startEdit = (c: Candidate) => {
    setEditingId(c.id);
    setFormData(c);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Kandidat</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Tambah Kandidat</span>
        </button>
      </div>

      <Modal
        isOpen={isAdding || !!editingId}
        onClose={() => {
          setIsAdding(false);
          setEditingId(null);
          setFormData({});
        }}
        title={editingId ? "Edit Kandidat" : "Tambah Kandidat Baru"}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="flex gap-4">
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No Urut
              </label>
              <input
                type="number"
                className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="0"
                value={formData.number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, number: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kandidat
              </label>
              <input
                className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Masukkan nama lengkap kandidat"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visi
            </label>
            <textarea
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Jelaskan visi kandidat"
              rows={2}
              value={formData.vision || ""}
              onChange={(e) =>
                setFormData({ ...formData, vision: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Misi
            </label>
            <textarea
              className="p-3 border rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Jelaskan misi kandidat (poin-poin)"
              rows={3}
              value={formData.mission || ""}
              onChange={(e) =>
                setFormData({ ...formData, mission: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto Kandidat
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
              />
              {formData.imageUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setFormData({ ...formData, imageUrl: undefined })
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Format: JPG, PNG. Maksimal 2MB.
            </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidates.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row"
          >
            <div className="w-full md:w-32 h-32 bg-gray-100 flex-shrink-0 relative">
              <img
                src={c.imageUrl}
                alt={c.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 left-0 bg-blue-600 text-white w-8 h-8 flex items-center justify-center font-bold">
                {c.number}
              </div>
            </div>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{c.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {c.vision}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteCandidate(c.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Suara saat ini:{" "}
                <span className="font-bold text-gray-800">{c.voteCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Candidates;
