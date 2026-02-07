export interface Resident {
  id: string;
  nik: string;
  name: string;
  address: string;
  rt: string;
  rw: string;
  phoneNumber: string;
  status: "Aktif" | "Pindah" | "Meninggal";
  block?: string; // Optional/Deprecated
  hasVoted: boolean;
  isPresent: boolean; // For attendance
}

export interface Candidate {
  id: string;
  number: number;
  name: string;
  vision: string;
  mission: string;
  imageUrl: string;
  voteCount: number;
}

export interface AnalyticsData {
  totalResidents: number;
  totalVotes: number;
  turnoutPercentage: number;
  presentCount: number;
  absentCount: number;
}

export type UserRole = "admin" | "resident";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string; // For mock auth
}
