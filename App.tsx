import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Voting from "./pages/Voting";
import Attendance from "./pages/Attendance";
import Residents from "./pages/Residents";
import Candidates from "./pages/Candidates";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import AccessControl from "./pages/AccessControl";

const AppContent: React.FC = () => {
  const { currentUser } = useApp();
  const [activePage, setActivePage] = useState("dashboard");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  if (!currentUser) {
    if (isForgotPassword) {
      return <ForgotPassword onBack={() => setIsForgotPassword(false)} />;
    }
    return <Login onForgotPassword={() => setIsForgotPassword(true)} />;
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
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">{renderPage()}</main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
