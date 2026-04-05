"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/features/components/Sidebar";
import { ToastProvider } from "@/features/components/ToastProvider";
import { AppProvider, useApp } from "@/features/context/AppContext";
import AccessControl from "@/features/pages/AccessControl";
import Attendance from "@/features/pages/Attendance";
import Candidates from "@/features/pages/Candidates";
import Dashboard from "@/features/pages/Dashboard";
import ForgotPassword from "@/features/pages/ForgotPassword";
import Login from "@/features/pages/Login";
import ResidentVoting from "@/features/pages/ResidentVoting";
import Residents from "@/features/pages/Residents";
import Voting from "@/features/pages/Voting";
import type { BootstrapData } from "@/lib/types";

function AppContent() {
  const { currentUser, isBootstrapping } = useApp();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const pathname = usePathname();

  const activePage = (() => {
    switch (pathname) {
      case "/voting":
        return "voting";
      case "/attendance":
        return "attendance";
      case "/residents":
        return "residents";
      case "/candidates":
        return "candidates";
      case "/access-control":
        return "access-control";
      case "/dashboard":
      case "/":
      default:
        return "dashboard";
    }
  })();

  const pageTitle = useMemo(() => {
    switch (activePage) {
      case "voting":
        return "E-Voting";
      case "attendance":
        return "Kehadiran";
      case "residents":
        return "Data Warga";
      case "candidates":
        return "Kandidat";
      case "access-control":
        return "Hak Akses";
      case "dashboard":
      default:
        return "Dashboard";
    }
  }, [activePage]);

  const userInitials = useMemo(() => {
    if (!currentUser?.name) {
      return "U";
    }

    return currentUser.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [currentUser?.name]);

  if (isBootstrapping && !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Memuat aplikasi...
      </div>
    );
  }

  if (!currentUser) {
    if (isForgotPassword) {
      return <ForgotPassword onBack={() => setIsForgotPassword(false)} />;
    }
    return <Login onForgotPassword={() => setIsForgotPassword(true)} />;
  }

  if (currentUser.role === "resident") {
    return <ResidentVoting />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "voting":
        return <Voting />;
      case "attendance":
        return <Attendance />;
      case "residents":
        return <Residents />;
      case "candidates":
        return <Candidates />;
      case "access-control":
        return <AccessControl />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar activePage={activePage} />
      <main className="ml-64 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-gray-300 bg-white/90 px-8 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
              <p className="text-sm text-slate-500">Panel administrasi SuaraWarga</p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-slate-100 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {userInitials}
              </div>
              <div className="pr-1 text-right">
                <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs capitalize text-slate-500">
                  {currentUser.role === "super_admin"
                    ? "Super Admin"
                    : currentUser.role === "admin"
                      ? "Administrator"
                      : "Warga"}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="p-8">{renderPage()}</div>
      </main>
    </div>
  );
}

export function AppShell({ initialData }: { initialData: BootstrapData }) {
  return (
    <AppProvider initialData={initialData}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}
