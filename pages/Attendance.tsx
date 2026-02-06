import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, UserCheck, UserX, MonitorPlay } from 'lucide-react';

const Attendance: React.FC = () => {
  const { residents, toggleAttendance, setActiveVoter, activeVoterId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.nik.includes(searchTerm) ||
    r.block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActivateBooth = (residentId: string) => {
    if (activeVoterId === residentId) {
        setActiveVoter(null); // Cancel activation if needed
    } else {
        const confirmed = window.confirm("Buka akses bilik suara untuk warga ini?");
        if (confirmed) {
            setActiveVoter(residentId);
        }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Meja Registrasi & Kontrol Bilik</h2>
            <p className="text-gray-500 text-sm">Verifikasi kehadiran dan aktifkan bilik suara untuk pemilih.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari Nama / NIK / Blok..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                <th className="p-4 border-b">NIK / Nama</th>
                <th className="p-4 border-b">Alamat</th>
                <th className="p-4 border-b text-center">Kehadiran</th>
                <th className="p-4 border-b text-center">Akses Bilik Suara</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.map((resident) => {
                const isActive = activeVoterId === resident.id;
                const canVote = resident.isPresent && !resident.hasVoted;

                return (
                <tr key={resident.id} className={`transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-800">{resident.name}</div>
                    <div className="text-xs text-gray-500">{resident.nik}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {resident.address} <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">Blok {resident.block}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleAttendance(resident.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                        resident.isPresent 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {resident.isPresent ? (
                        <>Hadir</>
                      ) : (
                        <>Absen</>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    {resident.hasVoted ? (
                        <span className="text-xs font-bold text-green-600 border border-green-200 bg-green-50 px-3 py-1.5 rounded-full">
                            Selesai Memilih
                        </span>
                    ) : (
                        <button
                            onClick={() => handleActivateBooth(resident.id)}
                            disabled={!resident.isPresent}
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                !resident.isPresent 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : isActive
                                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-md ring-2 ring-red-200'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow hover:shadow-md'
                            }`}
                        >
                            <MonitorPlay size={16} />
                            <span>{isActive ? 'Batalkan Akses' : 'Buka Bilik'}</span>
                        </button>
                    )}
                  </td>
                </tr>
              )})}
              {filteredResidents.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Data warga tidak ditemukan.
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

export default Attendance;
