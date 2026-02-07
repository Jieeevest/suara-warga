import React from "react";
import {
  LayoutDashboard,
  Vote,
  Users,
  UserCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { logout, currentUser } = useApp();
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "voting", label: "E-Voting", icon: Vote },
    { id: "attendance", label: "Kehadiran", icon: UserCheck },
    { id: "residents", label: "Data Warga", icon: Users },
    { id: "candidates", label: "Kandidat", icon: Settings },
  ];

  if (currentUser?.role === "admin") {
    menuItems.push({
      id: "access-control",
      label: "Hak Akses",
      icon: Users, // Using Users icon again, or maybe Shield/Lock if available
    });
  }

  return (
    <div className="w-64 bg-white text-slate-800 min-h-screen flex flex-col fixed left-0 top-0 overflow-y-auto border-r border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          SuaraWarga
        </h1>
        <p className="text-xs text-slate-500 mt-1">Sistem Pemilihan RT/RW</p>
        {currentUser && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-800">
              {currentUser.name}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {currentUser.role === "admin" ? "Administrator" : "Warga"}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-slate-500 hover:text-red-600 transition-colors px-4 py-2 w-full"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
