"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  LayoutDashboard,
  Vote,
  Users,
  UserCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { useApp } from "@/features/context/AppContext";

interface SidebarProps {
  activePage: string;
}

export default function Sidebar({ activePage }: SidebarProps) {
  const { logout, currentUser, isBootstrapping } = useApp();
  const router = useRouter();
  const menuItems = [
    { id: "dashboard", href: "/dashboard" as Route, label: "Dashboard", icon: LayoutDashboard },
    { id: "voting", href: "/voting" as Route, label: "E-Voting", icon: Vote },
    { id: "attendance", href: "/attendance" as Route, label: "Kehadiran", icon: UserCheck },
    { id: "residents", href: "/residents" as Route, label: "Data Warga", icon: Users },
    { id: "candidates", href: "/candidates" as Route, label: "Kandidat", icon: Settings },
  ];

  if (currentUser?.role === "super_admin") {
    menuItems.push({
      id: "access-control",
      href: "/access-control" as Route,
      label: "Hak Akses",
      icon: Users,
    });
  }

  return (
    <aside className="fixed left-0 top-0 flex min-h-screen w-64 flex-col overflow-y-auto border-r border-gray-300 bg-white/95 text-slate-800 shadow-sm backdrop-blur">
      <div className="p-6">
        <h1 className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">
          SuaraWarga
        </h1>
        <p className="mt-1 text-xs text-slate-500">Sistem Pemilihan RT/RW</p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex w-full cursor-pointer items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          type="button"
          onClick={() => {
            void logout().then(() => {
              router.replace("/");
            });
          }}
          disabled={isBootstrapping}
          className="flex w-full cursor-pointer items-center space-x-3 px-4 py-2 text-slate-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
