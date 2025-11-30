import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CoachStatistics() {
  const { user } = useAuth();
  const [trainees, setTrainees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Fetching statistics data...');
      
      // Fetch trainees
      const traineeRes = await api.get('/coach/trainees');
      const traineesList = traineeRes.data.data || [];
      console.log('✅ Trainees:', traineesList.length);
      setTrainees(traineesList);
      
      // Fetch all assignments for each trainee
      const allAssignments = [];
      for (const trainee of traineesList) {
        try {
          const traineeId = trainee.trainee_id || trainee.id;
          const assignmentRes = await api.get(`/assignments/trainee/${traineeId}`);
          if (assignmentRes.data.success) {
            const assignments = assignmentRes.data.data || [];
            console.log(`✅ Trainee ${trainee.full_name}: ${assignments.length} assignments`);
            allAssignments.push(...assignments.map(a => ({
              ...a,
              trainee_id: traineeId,
              trainee_name: trainee.full_name || trainee.username,
              trainee_email: trainee.email
            })));
          }
        } catch (err) {
          console.error(`❌ Error fetching assignments for trainee:`, err);
        }
      }
      
      console.log('✅ Total assignments:', allAssignments.length);
      setTasks(allAssignments);
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalTrainees = trainees.length;
  const activeTrainees = trainees.filter(t => t.status === 'active').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get top performers
  const traineeStats = trainees.map(trainee => {
    const traineeIdStr = (trainee.trainee_id || trainee.id)?.toString();
    const traineeTasks = tasks.filter(t => t.trainee_id?.toString() === traineeIdStr);
    const completed = traineeTasks.filter(t => t.status === 'completed').length;
    const inProgress = traineeTasks.filter(t => t.status === 'in_progress').length;
    const pending = traineeTasks.filter(t => t.status === 'pending').length;
    
    return {
      ...trainee,
      id: trainee.trainee_id || trainee.id,
      name: trainee.full_name || trainee.name || trainee.username,
      email: trainee.email,
      status: trainee.status || 'active',
      totalTasks: traineeTasks.length,
      completedTasks: completed,
      inProgressTasks: inProgress,
      pendingTasks: pending,
      completionRate: traineeTasks.length > 0 ? Math.round((completed / traineeTasks.length) * 100) : 0
    };
  }).sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a3d] to-[#002451] text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#002451] to-[#003166] border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3">
                <span className="text-5xl">📊</span>
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Statistics Dashboard
                </span>
              </h1>
              <p className="text-white/70 text-lg">
                Monitor your trainees' performance and progress
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10">
              <p className="text-sm text-white/60 mb-1">Coach</p>
              <p className="text-lg font-semibold text-yellow-400">{user?.full_name || user?.username}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading statistics...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-8 space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Trainees */}
            <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl p-6 border border-blue-400/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <span className="text-3xl font-bold text-white">{totalTrainees}</span>
              </div>
              <h3 className="text-white/70 text-sm mb-1">Total Trainees</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓ {activeTrainees} active</span>
              </div>
            </div>

            {/* Total Tasks */}
            <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl p-6 border border-yellow-400/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <span className="text-3xl font-bold text-white">{totalTasks}</span>
              </div>
              <h3 className="text-white/70 text-sm mb-1">Total Tasks Assigned</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-400">⏳ {pendingTasks} pending</span>
              </div>
            </div>

            {/* Completed Tasks */}
            <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl p-6 border border-green-400/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <span className="text-3xl font-bold text-white">{completedTasks}</span>
              </div>
              <h3 className="text-white/70 text-sm mb-1">Completed Tasks</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">🎯 {completionRate}% rate</span>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl p-6 border border-orange-400/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-400/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <span className="text-3xl font-bold text-white">{completionRate}%</span>
              </div>
              <h3 className="text-white/70 text-sm mb-1">Overall Completion</h3>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Task Status Distribution */}
            <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📊</span>
                Task Status Distribution
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Completed', value: completedTasks, color: 'from-green-500 to-green-400', bgColor: 'bg-green-500/10', icon: '✅' },
                  { label: 'Pending', value: pendingTasks, color: 'from-yellow-500 to-yellow-400', bgColor: 'bg-yellow-500/10', icon: '⏳' },
                  { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'from-blue-500 to-blue-400', bgColor: 'bg-blue-500/10', icon: '🔄' },
                  { label: 'Overdue', value: tasks.filter(t => t.status === 'overdue').length, color: 'from-red-500 to-red-400', bgColor: 'bg-red-500/10', icon: '⚠️' }
                ].map((item, index) => (
                  <div key={index} className={`${item.bgColor} rounded-xl p-4 border border-white/10`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        {item.label}
                      </span>
                      <span className="text-white font-bold text-xl">{item.value}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${item.color} h-3 rounded-full transition-all duration-1000`}
                        style={{ width: `${totalTasks > 0 ? (item.value / totalTasks) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-right text-xs text-white/60">
                      {totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                Top Performers
              </h2>
              {traineeStats.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-white/60">No trainees yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {traineeStats.slice(0, 5).map((trainee, index) => (
                    <div 
                      key={trainee.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-yellow-400/30 transition"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-[#001a3d]' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-[#001a3d]' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-white/10 text-white'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{trainee.name}</h3>
                          <p className="text-xs text-white/60">{trainee.email}</p>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">{trainee.completionRate}%</div>
                          <div className="text-xs text-white/60">
                            {trainee.completedTasks}/{trainee.totalTasks} tasks
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${trainee.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Trainee List */}
          <div className="bg-gradient-to-br from-[#002451] to-[#003166] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-b border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📋</span>
                All Trainees Performance
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">Trainee</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Total Tasks</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Completed</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Completion Rate</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {traineeStats.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-white/60">
                        No trainees data available
                      </td>
                    </tr>
                  ) : (
                    traineeStats.map(trainee => (
                      <tr key={trainee.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                              <span className="text-xl">👤</span>
                            </div>
                            <div>
                              <p className="font-semibold text-white">{trainee.name}</p>
                              <p className="text-xs text-white/60">{trainee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            trainee.status === 'active' 
                              ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                              : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                          }`}>
                            {trainee.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-white font-semibold text-lg">{trainee.totalTasks}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-400 font-semibold text-lg">{trainee.completedTasks}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-yellow-400 font-bold text-xl">{trainee.completionRate}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white/10 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${trainee.completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
