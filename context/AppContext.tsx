import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Resident, Candidate } from '../types';

interface AppContextType {
  residents: Resident[];
  candidates: Candidate[];
  activeVoterId: string | null; // ID warga yang sedang diizinkan memilih
  addResident: (resident: Resident) => void;
  updateResident: (id: string, updates: Partial<Resident>) => void;
  deleteResident: (id: string) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  setActiveVoter: (id: string | null) => void; // Admin mengaktifkan bilik suara
  castVote: (candidateId: string, residentId: string) => void;
  toggleAttendance: (residentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_RESIDENTS: Resident[] = [
  { id: '1', nik: '320101001', name: 'Budi Santoso', address: 'Jl. Merpati No. 1', block: 'A', hasVoted: true, isPresent: true },
  { id: '2', nik: '320101002', name: 'Siti Aminah', address: 'Jl. Merpati No. 2', block: 'A', hasVoted: false, isPresent: false },
  { id: '3', nik: '320101003', name: 'Rudi Hermawan', address: 'Jl. Elang No. 10', block: 'B', hasVoted: true, isPresent: true },
  { id: '4', nik: '320101004', name: 'Dewi Lestari', address: 'Jl. Elang No. 12', block: 'B', hasVoted: false, isPresent: true },
  { id: '5', nik: '320101005', name: 'Agus Salim', address: 'Jl. Pipit No. 5', block: 'C', hasVoted: true, isPresent: true },
  { id: '6', nik: '320101006', name: 'Eko Prasetyo', address: 'Jl. Pipit No. 7', block: 'C', hasVoted: false, isPresent: false },
  { id: '7', nik: '320101007', name: 'Ratna Sari', address: 'Jl. Kutilang No. 3', block: 'D', hasVoted: true, isPresent: true },
  { id: '8', nik: '320101008', name: 'Bambang Wijaya', address: 'Jl. Kutilang No. 5', block: 'D', hasVoted: false, isPresent: false },
  { id: '9', nik: '320101009', name: 'Sri Wahyuni', address: 'Jl. Gelatik No. 8', block: 'E', hasVoted: true, isPresent: true },
  { id: '10', nik: '320101010', name: 'Hendra Gunawan', address: 'Jl. Gelatik No. 9', block: 'E', hasVoted: false, isPresent: true },
];

const INITIAL_CANDIDATES: Candidate[] = [
  { 
    id: 'c1', 
    number: 1, 
    name: 'H. Ahmad Sobari', 
    vision: 'Mewujudkan lingkungan RW 05 yang aman, bersih, dan religius.', 
    mission: '1. Mengaktifkan Siskamling.\n2. Program Jumat Bersih.', 
    imageUrl: 'https://i.pravatar.cc/300?u=ahmad', 
    voteCount: 18 
  },
  { 
    id: 'c2', 
    number: 2, 
    name: 'Ir. Joko Susilo', 
    vision: 'RW 05 Digital dan Transparan.', 
    mission: '1. Laporan keuangan online.\n2. WiFi gratis di pos ronda.', 
    imageUrl: 'https://i.pravatar.cc/300?u=joko', 
    voteCount: 14 
  },
  { 
    id: 'c3', 
    number: 3, 
    name: 'Ibu Linda Kusuma, S.Pd', 
    vision: 'Pemberdayaan Keluarga dan Kesehatan Lingkungan.', 
    mission: '1. Optimalisasi Posyandu.\n2. Bank Sampah Mandiri.', 
    imageUrl: 'https://i.pravatar.cc/300?u=linda', 
    voteCount: 10 
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [activeVoterId, setActiveVoterId] = useState<string | null>(null);

  const addResident = (resident: Resident) => setResidents([...residents, resident]);
  
  const updateResident = (id: string, updates: Partial<Resident>) => {
    setResidents(residents.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteResident = (id: string) => {
    setResidents(residents.filter(r => r.id !== id));
  };

  const addCandidate = (candidate: Candidate) => setCandidates([...candidates, candidate]);

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const setActiveVoter = (id: string | null) => {
    setActiveVoterId(id);
  };

  const castVote = (candidateId: string, residentId: string) => {
    setCandidates(candidates.map(c => 
      c.id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c
    ));
    updateResident(residentId, { hasVoted: true });
    // Reset active voter is handled in the component for better UX flow, or here instantly.
    // We will reset it via setActiveVoter(null) after animation.
  };

  const toggleAttendance = (residentId: string) => {
    const resident = residents.find(r => r.id === residentId);
    if (resident) {
      updateResident(residentId, { isPresent: !resident.isPresent });
    }
  };

  return (
    <AppContext.Provider value={{
      residents,
      candidates,
      activeVoterId,
      addResident,
      updateResident,
      deleteResident,
      addCandidate,
      updateCandidate,
      deleteCandidate,
      setActiveVoter,
      castVote,
      toggleAttendance
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
