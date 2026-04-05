export interface Resident {
  id: string;
  nik: string;
  name: string;
  email: string;
  address: string;
  rt: string;
  rw: string;
  phoneNumber: string;
  status: "Aktif" | "Pindah" | "Meninggal";
  block?: string;
  hasVoted: boolean;
  isPresent: boolean;
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

export type UserRole = "super_admin" | "admin" | "resident";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export type VotingStatus = "not_started" | "active" | "closed";

export interface BootstrapData {
  residents: Resident[];
  candidates: Candidate[];
  users: User[];
  activeVoterId: string | null;
  currentUser: SessionUser | null;
  votingStatus: VotingStatus;
  votingEncryptionPublicKey: string;
}
