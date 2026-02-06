import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Resident } from '../types';

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
        nik: formData.nik || '',
        name: formData.name || '',
        address: formData.address || '',
        block: formData.block || '',
        hasVoted: false,
        isPresent: false
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
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Data Warga</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <Plus size={18} />
          <span>Tambah Warga</span>
        </button>
      </div>

      {/* Add Form Modal/Card */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Warga' : 'Tambah Warga Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                    className="p-2 border rounded text-sm" 
                    placeholder="NIK" 
                    value={formData.nik || ''} 
                    onChange={e => setFormData({...formData, nik: e.target.value})}
                />
                <input 
                    className="p-2 border rounded text-sm" 
                    placeholder="Nama Lengkap" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input 
                    className="p-2 border rounded text-sm" 
                    placeholder="Alamat" 
                    value={formData.address || ''} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                />
                <input 
                    className="p-2 border rounded text-sm" 
                    placeholder="Blok" 
                    value={formData.block || ''} 
                    onChange={e => setFormData({...formData, block: e.target.value})}
                />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <button 
                    onClick={() => { setIsAdding(false); setEditingId(null); setFormData({}); }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
                >
                    Batal
                </button>
                <button 
                    onClick={editingId ? handleUpdate : handleAdd}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                    Simpan
                </button>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-xs uppercase tracking-wider text-gray-600">
                <th className="p-4 font-semibold">NIK</th>
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Blok</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {residents.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-700">{r.nik}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{r.name}</td>
                  <td className="p-4 text-sm text-gray-600">{r.block}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => startEdit(r)} className="text-blue-600 hover:text-blue-800 p-1">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteResident(r.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {residents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 text-sm">
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
