import type { Candidate, Resident, User } from "./types";

export const INITIAL_RESIDENTS: Resident[] = [];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    number: 1,
    name: "H. Ahmad Sobari",
    vision: "Mewujudkan lingkungan RW 05 yang aman, bersih, dan religius.",
    mission: "1. Mengaktifkan Siskamling.\n2. Program Jumat Bersih.",
    imageUrl: "https://i.pravatar.cc/300?u=ahmad",
    voteCount: 0,
  },
  {
    id: "c2",
    number: 2,
    name: "Ir. Joko Susilo",
    vision: "RW 05 Digital dan Transparan.",
    mission: "1. Laporan keuangan online.\n2. WiFi gratis di pos ronda.",
    imageUrl: "https://i.pravatar.cc/300?u=joko",
    voteCount: 0,
  },
  {
    id: "c3",
    number: 3,
    name: "Ibu Linda Kusuma, S.Pd",
    vision: "Pemberdayaan Keluarga dan Kesehatan Lingkungan.",
    mission: "1. Optimalisasi Posyandu.\n2. Bank Sampah Mandiri.",
    imageUrl: "https://i.pravatar.cc/300?u=linda",
    voteCount: 0,
  },
];

export const getInitialUsers = (): User[] => [
  {
    id: "super-admin",
    name: "Super Administrator",
    role: "super_admin",
    username: process.env.SUPER_ADMIN_USERNAME || "superadmin",
    password: process.env.SUPER_ADMIN_PASSWORD || "superadmin",
  },
];
