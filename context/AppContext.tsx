import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { Resident, Candidate, User, UserRole } from "../types";

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

  currentUser: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // New User Management
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_RESIDENTS: Resident[] = [
  {
    id: "1",
    nik: "320101001",
    name: "Budi Santoso",
    address: "Jl. Merpati No. 1",
    rt: "001",
    rw: "05",
    phoneNumber: "081234567890",
    status: "Aktif",
    block: "A",
    hasVoted: true,
    isPresent: true,
  },
  {
    id: "2",
    nik: "320101002",
    name: "Siti Aminah",
    address: "Jl. Merpati No. 2",
    rt: "001",
    rw: "05",
    phoneNumber: "081234567891",
    status: "Aktif",
    block: "A",
    hasVoted: false,
    isPresent: false,
  },
  {
    id: "3",
    nik: "320101003",
    name: "Rudi Hermawan",
    address: "Jl. Elang No. 10",
    rt: "002",
    rw: "05",
    phoneNumber: "081234567892",
    status: "Aktif",
    block: "B",
    hasVoted: true,
    isPresent: true,
  },
  {
    id: "4",
    nik: "320101004",
    name: "Dewi Lestari",
    address: "Jl. Elang No. 12",
    rt: "002",
    rw: "05",
    phoneNumber: "081234567893",
    status: "Pindah",
    block: "B",
    hasVoted: false,
    isPresent: true,
  },
  {
    id: "5",
    nik: "320101005",
    name: "Agus Salim",
    address: "Jl. Pipit No. 5",
    rt: "003",
    rw: "05",
    phoneNumber: "081234567894",
    status: "Aktif",
    block: "C",
    hasVoted: true,
    isPresent: true,
  },
  {
    id: "6",
    nik: "320101006",
    name: "Eko Prasetyo",
    address: "Jl. Pipit No. 7",
    rt: "003",
    rw: "05",
    phoneNumber: "081234567895",
    status: "Aktif",
    block: "C",
    hasVoted: false,
    isPresent: false,
  },
  {
    id: "7",
    nik: "320101007",
    name: "Ratna Sari",
    address: "Jl. Kutilang No. 3",
    rt: "004",
    rw: "05",
    phoneNumber: "081234567896",
    status: "Aktif",
    block: "D",
    hasVoted: true,
    isPresent: true,
  },
  {
    id: "8",
    nik: "320101008",
    name: "Bambang Wijaya",
    address: "Jl. Kutilang No. 5",
    rt: "004",
    rw: "05",
    phoneNumber: "081234567897",
    status: "Pindah",
    block: "D",
    hasVoted: false,
    isPresent: false,
  },
  {
    id: "9",
    nik: "320101009",
    name: "Sri Wahyuni",
    address: "Jl. Gelatik No. 8",
    rt: "005",
    rw: "05",
    phoneNumber: "081234567898",
    status: "Aktif",
    block: "E",
    hasVoted: true,
    isPresent: true,
  },
  {
    id: "10",
    nik: "320101010",
    name: "Hendra Gunawan",
    address: "Jl. Gelatik No. 9",
    rt: "005",
    rw: "05",
    phoneNumber: "081234567899",
    status: "Meninggal",
    block: "E",
    hasVoted: false,
    isPresent: true,
  },
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    number: 1,
    name: "H. Ahmad Sobari",
    vision: "Mewujudkan lingkungan RW 05 yang aman, bersih, dan religius.",
    mission: "1. Mengaktifkan Siskamling.\n2. Program Jumat Bersih.",
    imageUrl: "https://i.pravatar.cc/300?u=ahmad",
    voteCount: 18,
  },
  {
    id: "c2",
    number: 2,
    name: "Ir. Joko Susilo",
    vision: "RW 05 Digital dan Transparan.",
    mission: "1. Laporan keuangan online.\n2. WiFi gratis di pos ronda.",
    imageUrl: "https://i.pravatar.cc/300?u=joko",
    voteCount: 14,
  },
  {
    id: "c3",
    number: 3,
    name: "Ibu Linda Kusuma, S.Pd",
    vision: "Pemberdayaan Keluarga dan Kesehatan Lingkungan.",
    mission: "1. Optimalisasi Posyandu.\n2. Bank Sampah Mandiri.",
    imageUrl: "https://i.pravatar.cc/300?u=linda",
    voteCount: 10,
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [users, setUsers] = useState<User[]>([
    {
      id: "admin",
      name: "Administrator",
      role: "admin",
      username: import.meta.env.VITE_ADMIN_USERNAME || "admin",
      password: import.meta.env.VITE_ADMIN_PASSWORD || "admin",
    },
  ]);
  const [activeVoterId, setActiveVoterId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const isAdmin = useMemo(() => currentUser?.role === "admin", [currentUser]);

  const login = (username: string, password: string): boolean => {
    // 1. Check System Users (Admins/Operators)
    const user = users.find(
      (u) => u.username === username && u.password === password,
    );

    if (user) {
      setCurrentUser(user);
      return true;
    }

    // 2. Check Resident Credentials (NIK/NIK)
    const resident = residents.find((r) => r.nik === username);
    if (resident && password === resident.nik) {
      setCurrentUser({
        id: resident.id,
        name: resident.name,
        role: "resident",
        username: resident.nik,
      });
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addResident = (resident: Resident) =>
    setResidents([...residents, resident]);

  const updateResident = (id: string, updates: Partial<Resident>) => {
    setResidents(
      residents.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  };

  const deleteResident = (id: string) => {
    setResidents(residents.filter((r) => r.id !== id));
  };

  const addCandidate = (candidate: Candidate) =>
    setCandidates([...candidates, candidate]);

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(
      candidates.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const deleteCandidate = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  // User Management
  const addUser = (user: User) => setUsers([...users, user]);
  const updateUser = (id: string, updates: Partial<User>) =>
    setUsers(users.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  const deleteUser = (id: string) => setUsers(users.filter((u) => u.id !== id));

  const setActiveVoter = (id: string | null) => {
    setActiveVoterId(id);
  };

  const castVote = (candidateId: string, residentId: string) => {
    setCandidates(
      candidates.map((c) =>
        c.id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c,
      ),
    );
    updateResident(residentId, { hasVoted: true });
  };

  const toggleAttendance = (residentId: string) => {
    const resident = residents.find((r) => r.id === residentId);
    if (resident) {
      updateResident(residentId, { isPresent: !resident.isPresent });
    }
  };

  return (
    <AppContext.Provider
      value={{
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
        toggleAttendance,
        currentUser,
        isAdmin,
        login,
        logout,
        // User capabilities
        users, // @ts-ignore - added to context but interface not yet updated in this block
        addUser, // @ts-ignore
        updateUser, // @ts-ignore
        deleteUser, // @ts-ignore
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
