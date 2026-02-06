import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Vote, UserCheck, Sparkles, RefreshCw } from 'lucide-react';
import { generateElectionAnalysis } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { residents, candidates } = useApp();
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const stats = useMemo(() => {
    const totalResidents = residents.length;
    const totalVotes = residents.filter(r => r.hasVoted).length;
    const presentCount = residents.filter(r => r.isPresent).length;
    const turnoutPercentage = totalResidents > 0 ? (totalVotes / totalResidents) * 100 : 0;
    
    return {
      totalResidents,
      totalVotes,
      presentCount,
      absentCount: totalResidents - presentCount,
      turnoutPercentage
    };
  }, [residents]);

  const chartData = useMemo(() => {
    return candidates.map(c => ({
      name: `No. ${c.number} ${c.name.split(' ')[0]}`, // Short name
      votes: c.voteCount
    }));
  }, [candidates]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const attendanceData = [
    { name: 'Hadir', value: stats.presentCount },
    { name: 'Tidak Hadir', value: stats.absentCount },
  ];

  const handleGenerateAnalysis = async () => {
    setLoadingAi(true);
    const analysis = await generateElectionAnalysis(stats, candidates);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };

  // Initial analysis on mount if not loaded
  useEffect(() => {
    // Optional: Auto generate on first load
    // handleGenerateAnalysis(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Analitik</h2>
        <span className="text-sm text-gray-500">Update Terakhir: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Warga (DPT)</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalResidents}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <Vote size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Suara Masuk</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalVotes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Partisipasi</p>
            <p className="text-2xl font-bold text-gray-800">{stats.turnoutPercentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Kehadiran Fisik</p>
            <p className="text-2xl font-bold text-gray-800">{stats.presentCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vote Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Perolehan Suara Sementara</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="votes" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rasio Kehadiran</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#e5e7eb'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-yellow-300" />
              <h3 className="text-xl font-bold">Analisis Cerdas AI</h3>
            </div>
            <button 
              onClick={handleGenerateAnalysis}
              disabled={loadingAi}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition flex items-center space-x-2 disabled:opacity-50"
            >
              {loadingAi ? <RefreshCw className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
              <span>{aiAnalysis ? "Perbarui Analisis" : "Buat Analisis"}</span>
            </button>
          </div>

          {loadingAi ? (
            <div className="h-24 flex items-center justify-center">
              <p className="animate-pulse">Sedang menganalisis data pemilihan...</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              {aiAnalysis ? (
                <p className="whitespace-pre-line leading-relaxed text-indigo-50">
                  {aiAnalysis}
                </p>
              ) : (
                <p className="text-indigo-200 italic">
                  Klik tombol "Buat Analisis" untuk mendapatkan wawasan mendalam tentang tren pemilihan saat ini menggunakan Gemini AI.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
