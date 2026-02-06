import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, User, Fingerprint, Lock, ChevronRight } from 'lucide-react';

const Voting: React.FC = () => {
  const { residents, candidates, activeVoterId, castVote, setActiveVoter } = useApp();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Determine current state
  const activeResident = residents.find(r => r.id === activeVoterId);
  const isStandby = !activeResident;

  // Reset local state when active voter changes
  useEffect(() => {
    setSelectedCandidateId(null);
    setIsConfirming(false);
    setIsSuccess(false);
  }, [activeVoterId]);

  const handleVoteConfirm = () => {
    if (activeResident && selectedCandidateId) {
      castVote(selectedCandidateId, activeResident.id);
      setIsConfirming(false);
      setIsSuccess(true);
      
      // Auto reset booth after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setActiveVoter(null);
      }, 5000);
    }
  };

  // --- VIEW: SUCCESS SCREEN ---
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle2 size={64} className="text-green-600" />
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Suara Diterima!</h2>
        <p className="text-gray-600 text-xl max-w-lg">
          Terima kasih Bapak/Ibu <span className="font-bold text-gray-900">{activeResident?.name}</span> telah berpartisipasi dalam pemilihan ini.
        </p>
        <p className="text-sm text-gray-400 mt-12">Layar akan kembali ke menu utama dalam beberapa detik...</p>
      </div>
    );
  }

  // --- VIEW: STANDBY SCREEN (KIOSK MODE) ---
  if (isStandby) {
    return (
      <div className="h-[85vh] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm">
        <div className="bg-blue-50 p-6 rounded-full mb-8">
            <Lock size={64} className="text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Bilik Suara Digital</h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-12">
          Selamat datang di E-Voting RT/RW. Silakan menuju meja panitia untuk verifikasi identitas dan aktivasi bilik suara.
        </p>
        <div className="flex items-center space-x-2 text-sm text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-200">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Menunggu Aktivasi Admin</span>
        </div>
      </div>
    );
  }

  // --- VIEW: VOTING SCREEN ---
  return (
    <div className="max-w-6xl mx-auto pb-24 animate-fade-in relative">
      
      {/* Header Info Pemilih */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 mb-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <User size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500">Pemilih Aktif</p>
                <h2 className="text-2xl font-bold text-gray-800">{activeResident?.name}</h2>
            </div>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <Fingerprint className="text-blue-600" size={20} />
            <span className="font-mono text-blue-800 font-medium">{activeResident?.nik}</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-700">Silakan Tentukan Pilihan Anda</h3>
        <p className="text-gray-500">Klik pada foto kandidat untuk memilih.</p>
      </div>

      {/* Grid Kandidat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id}
            onClick={() => setSelectedCandidateId(candidate.id)}
            className={`relative group cursor-pointer bg-white rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 ${
              selectedCandidateId === candidate.id 
                ? 'ring-4 ring-blue-500 shadow-2xl scale-[1.02]' 
                : 'border border-gray-200 shadow-lg hover:shadow-xl'
            }`}
          >
            {/* Nomor Urut Badge */}
            <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg border-2 border-white">
                {candidate.number}
            </div>

            {/* Checkmark Overlay when selected */}
            {selectedCandidateId === candidate.id && (
                <div className="absolute top-4 right-4 z-10 bg-green-500 text-white rounded-full p-2 shadow-lg animate-scale-in">
                    <CheckCircle2 size={32} />
                </div>
            )}

            <div className="h-64 overflow-hidden bg-gray-100">
              <img 
                src={candidate.imageUrl} 
                alt={candidate.name} 
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">{candidate.name}</h3>
              <div className="space-y-3 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">Visi</p>
                      <p className="text-sm text-gray-700 italic">"{candidate.vision}"</p>
                  </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className={`fixed bottom-8 left-0 right-0 flex justify-center transition-transform duration-300 ${selectedCandidateId ? 'translate-y-0' : 'translate-y-32'}`}>
         <button
            onClick={() => setIsConfirming(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-12 rounded-full shadow-2xl flex items-center space-x-3 transform hover:scale-105 transition-all"
         >
            <span>Konfirmasi Pilihan</span>
            <ChevronRight size={24} />
         </button>
      </div>

      {/* Confirmation Modal */}
      {isConfirming && selectedCandidateId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Konfirmasi Pilihan</h3>
                <p className="text-gray-500 mb-6">Anda akan memberikan suara untuk:</p>
                
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                        No. {candidates.find(c => c.id === selectedCandidateId)?.number}
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                        {candidates.find(c => c.id === selectedCandidateId)?.name}
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button 
                        onClick={() => setIsConfirming(false)}
                        className="flex-1 py-3 px-6 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleVoteConfirm}
                        className="flex-1 py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition"
                    >
                        Ya, Saya Yakin
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Voting;
