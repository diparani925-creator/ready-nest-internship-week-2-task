'use client';

import React, { useEffect, useState } from 'react';
import { api, AttendanceLog, AttendanceStats, SubjectStats } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Minus, 
  Calendar, 
  FileText,
  TrendingUp, 
  TrendingDown, 
  Info
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function AttendancePage() {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<'present' | 'absent' | 'cancelled'>('present');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default subject options based on timetable or standard list
  const preDefinedSubjects = [
    'Algorithms & Data Structures',
    'Software Engineering',
    'Database Management Systems',
    'Computer Networks',
    'Artificial Intelligence',
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching attendance statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (initialSubject: string = '') => {
    setSubject(initialSubject || preDefinedSubjects[0]);
    setStatus('present');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleQuickMark = async (sub: string, quickStatus: 'present' | 'absent' | 'cancelled') => {
    try {
      await api.post('/attendance', {
        subject: sub,
        status: quickStatus,
        date: new Date().toISOString(),
        note: `Quick logged via dashboard`,
      });
      // Refresh statistics
      const res = await api.get('/attendance/stats');
      setStats(res.data);
    } catch (err: any) {
      console.error('Error marking attendance:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!subject || !status || !date) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      await api.post('/attendance', { subject, status, date, note });
      setIsModalOpen(false);
      fetchStats();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error logging attendance');
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await api.delete(`/attendance/${id}`);
        fetchStats();
      } catch (err) {
        console.error('Error deleting log:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  // Pre-process pie chart data (Present vs Absent)
  const totalAtt = stats?.totalAttended || 0;
  const totalAbs = (stats?.totalClasses || 0) - totalAtt;
  const pieData = [
    { name: 'Attended Classes', value: totalAtt, color: '#0d9488' }, // Teal
    { name: 'Absent Classes', value: totalAbs, color: '#f43f5e' }, // Rose
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Attendance Tracker</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Track academic class metrics and verify target goals</p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} /> Log Attendance
        </button>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Stats Progress Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold">Overall Percentage</CardTitle>
            <CardDescription className="text-xs">Consolidated metrics across all courses</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pb-8 pt-2">
            <div className="relative h-36 w-36 flex items-center justify-center">
              {/* SVG Radial Progress Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-[var(--border)] fill-transparent"
                  strokeWidth="10"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  className="stroke-[var(--primary)] fill-transparent transition-all duration-500"
                  strokeWidth="10"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * (stats?.overallPercentage ?? 100)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold">{stats?.overallPercentage ?? 100}%</span>
                <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">Overall</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 w-full text-center">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Attended</span>
                <p className="text-lg font-bold mt-0.5">{stats?.totalAttended} classes</p>
              </div>
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Absent</span>
                <p className="text-lg font-bold mt-0.5">{totalAbs} classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Analytics Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold">Attendance Share Ratio</CardTitle>
            <CardDescription className="text-xs">Classes distribution between attended and missed slots</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center h-48 md:h-full gap-4">
            {totalAtt === 0 && totalAbs === 0 ? (
              <div className="text-xs text-[var(--muted-foreground)] my-auto">Log present/absent classes to display charts.</div>
            ) : (
              <>
                <div className="h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full bg-teal-500" />
                    <span>Attended: <strong className="text-[var(--foreground)]">{totalAtt} classes</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <span>Missed / Absent: <strong className="text-[var(--foreground)]">{totalAbs} classes</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span>Cancelled: <strong className="text-[var(--foreground)]">{stats?.logs.filter(l => l.status === 'cancelled').length} classes</strong></span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject-Wise Summary */}
      <h2 className="text-lg font-bold mt-8 text-[var(--foreground)]">Subject-Wise Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats?.summary.map((sub) => {
          const isAtRisk = sub.percentage < 75;
          return (
            <Card key={sub.subject} className={`hover-lift ${isAtRisk ? 'border-rose-500/35 bg-rose-500/[0.01]' : ''}`}>
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm font-bold truncate flex-1 text-[var(--foreground)]" title={sub.subject}>
                    {sub.subject}
                  </CardTitle>
                  <span className={`text-base font-extrabold shrink-0 ${isAtRisk ? 'text-rose-500' : 'text-teal-500'}`}>
                    {sub.percentage}%
                  </span>
                </div>
                <CardDescription className="text-[10px] mt-0.5">
                  Goal: min 75% for examinations eligibility
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {/* Horizontal Progress Bar */}
                <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${isAtRisk ? 'bg-rose-500' : 'bg-teal-500'}`}
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>

                {/* Substats */}
                <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>Attended: <strong className="text-[var(--foreground)]">{sub.present}</strong></span>
                  <span>Absent: <strong className="text-[var(--foreground)]">{sub.absent}</strong></span>
                  <span>Total: <strong className="text-[var(--foreground)]">{sub.total}</strong></span>
                </div>

                {/* Mark Quick Attendance actions */}
                <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                  <button
                    onClick={() => handleQuickMark(sub.subject, 'present')}
                    className="flex-1 py-1 px-2 border border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] rounded-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Check size={10} /> Present
                  </button>
                  <button
                    onClick={() => handleQuickMark(sub.subject, 'absent')}
                    className="flex-1 py-1 px-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[10px] rounded-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <X size={10} /> Absent
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attendance Logs Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base font-bold">Recent Log Details</CardTitle>
          <CardDescription className="text-xs">Browse and manage raw class entries</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {stats?.logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-[var(--radius)]">
              No historical logs recorded. Start marking attendance.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Subject Course</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Comment Notes</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.logs.map((log) => (
                  <tr key={log._id} className="border-b border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-medium flex items-center gap-1.5">
                      <Calendar size={12} className="text-[var(--primary)]" />
                      {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[var(--foreground)]">{log.subject}</td>
                    <td className="py-3 px-3">
                      <Badge 
                        variant={log.status === 'present' ? 'success' : log.status === 'absent' ? 'danger' : 'outline'}
                        className="text-[9px] uppercase px-1.5"
                      >
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-[var(--muted-foreground)] truncate max-w-[200px]" title={log.note}>
                      {log.note || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteLog(log._id)}
                        className="p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors cursor-pointer"
                        title="Delete log entry"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Attendance Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Past Attendance Class"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-[var(--radius)] text-xs text-rose-500">
              {errorMsg}
            </div>
          )}

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="attend-subject">
              Subject Name *
            </label>
            <select
              id="attend-subject"
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {preDefinedSubjects.map((sub) => (
                <option key={sub} value={sub} className="bg-[var(--card)] text-[var(--foreground)]">
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="attend-status">
                Attendance Status *
              </label>
              <select
                id="attend-status"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="present" className="bg-[var(--card)]">Present</option>
                <option value="absent" className="bg-[var(--card)]">Absent</option>
                <option value="cancelled" className="bg-[var(--card)]">Cancelled</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="attend-date">
                Class Date *
              </label>
              <input
                id="attend-date"
                type="date"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="attend-note">
              Comment / Excuse Notes
            </label>
            <input
              id="attend-note"
              type="text"
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              placeholder="e.g. Woke up late / Doctor checkup"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Modal Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-[var(--border)] text-sm font-semibold rounded-[var(--radius)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer"
            >
              Log Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
