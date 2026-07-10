"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

interface VoteNotification {
  id: string;
  residentName: string;
  castAt: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<VoteNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { residentName: string; castAt: string };
      setNotifications((current) =>
        [{ id: crypto.randomUUID(), ...payload }, ...current].slice(0, 20),
      );
      setUnreadCount((count) => count + 1);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    setIsOpen((current) => !current);
    setUnreadCount(0);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <Bell size={20} />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl animate-scale-in">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Aktivitas Voting</p>
            <p className="text-xs text-slate-500">Notifikasi real-time saat warga memilih</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                Belum ada aktivitas voting.
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                >
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">{notification.residentName}</span> telah
                    memilih
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatTime(notification.castAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
