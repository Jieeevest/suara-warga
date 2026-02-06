import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Candidate } from '../types';

const Candidates: React.FC = () => {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Candidate>>({});

  const handleAdd = () => {
    if (formData.name && formData.number) {
      const newCandidate: Candidate = {
        id: Date.now().toString(),
        number: Number(formData.number),
        name: formData.name || '',
        vision: formData.vision || '',
        mission: formData.mission || '',
        imageUrl: formData.imageUrl || `https://i.pravatar.cc/300?u=${Date.now()}`,
        voteCount: 0
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

       {/* Form Section */}
       {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Kandidat' : 'Tambah Kandidat Baru'}</h3>
            <div className="grid grid-cols-1 gap-4">
                <div className="flex gap-4">
                    <input 
                        type="number"
                        className="p-2 border rounded w-24 text-sm" 
                        placeholder="No Urut" 
                        value={formData.number || ''} 
                        onChange={e => setFormData({...formData, number: parseInt(e.target.value)})}
                    />
                    <input 
                        className="p-2 border rounded flex-1 text-sm" 
                        placeholder="Nama Kandidat" 
                        value={formData.name || ''} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <textarea 
                    className="p-2 border rounded text-sm" 
                    placeholder="Visi" 
                    rows={2}
                    value={formData.vision || ''} 
                    onChange={e => setFormData({...formData, vision: e.target.value})}
                />
                <textarea 
                    className="p-2 border rounded text-sm" 
                    placeholder="Misi" 
                    rows={3}
                    value={formData.mission || ''} 
                    onChange={e => setFormData({...formData, mission: e.target.value})}
                />
                <input 
                    className="p-2 border rounded text-sm" 
                    placeholder="URL Foto (Opsional, kosongkan untuk auto-generate)" 
                    value={formData.imageUrl || ''} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidates.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-32 h-32 bg-gray-100 flex-shrink-0 relative">
               <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
               <div className="absolute top-0 left-0 bg-blue-600 text-white w-8 h-8 flex items-center justify-center font-bold">
                 {c.number}
               </div>
            </div>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{c.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{c.vision}</p>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => startEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => deleteCandidate(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Suara saat ini: <span className="font-bold text-gray-800">{c.voteCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Candidates;
