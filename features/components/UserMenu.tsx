"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useApp } from "@/features/context/AppContext";

interface UserMenuProps {
  name: string;
  roleLabel: string;
  initials: string;
}

export default function UserMenu({ name, roleLabel, initials }: UserMenuProps) {
  const { logout } = useApp();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    void logout().then(() => {
      router.replace("/");
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-3 rounded-full bg-slate-100 px-3 py-2 transition hover:bg-slate-200"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="pr-1 text-right">
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs capitalize text-slate-500">{roleLabel}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl animate-scale-in">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      ) : null}
    </div>
  );
}
