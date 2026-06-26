'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api, TimetableItem, TaskItem, NoticeItem, AttendanceStats } from '../../lib/api';
import {
  Calendar,
  CheckSquare,
  FileText,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Percent,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<TimetableItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStats | null>(null);
  
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [schedRes, taskRes, noticeRes, attendRes] = await Promise.all([
          api.get('/timetable'),
          api.get('/tasks'),
          api.get('/notices'),
          api.get('/attendance/stats'),
        ]);

        setSchedules(schedRes.data);
        setTasks(taskRes.data);
        setNotices(noticeRes.data);
        setAttendance(attendRes.data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter today's classes
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  
  // Sort schedule items by time
  const todaysClasses = schedules
    .filter((item) => item.dayOfWeek === todayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Filter pending tasks
  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 3);
  const completedTasksCount = tasks.filter((t) => t.completed).length;

  // Toggle task completion from dashboard
  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/toggle`);
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--primary)]"></div>
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">Compiling dashboard data...</p>
        </div>
      </div>
    );
  }

  // Pre-process chart data
  const chartData = attendance?.summary.map((sub) => ({
    name: sub.subject.length > 15 ? sub.subject.substring(0, 12) + '...' : sub.subject,
    percentage: sub.percentage,
  })) || [];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-brand-navy to-brand-navy-light text-white p-6 rounded-[var(--radius)] border border-brand-navy-light shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-teal-200 text-xs md:text-sm mt-1">
            Hope you are having a productive {todayName}. You have {todaysClasses.length} classes and {pendingTasks.length} pending tasks today.
          </p>
        </div>
        <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-[var(--radius)] border border-white/15 text-center">
          <span className="text-xs uppercase font-extrabold tracking-wider text-teal-300">Overall Attendance</span>
          <p className="text-3xl font-extrabold mt-0.5">{attendance?.overallPercentage ?? 100}%</p>
        </div>
        
        {/* Abstract background blobs */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-500/10 blur-2xl transform translate-x-12 -translate-y-12"></div>
      </div>

      {/* 2. Top Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance Card */}
        <Card className="hover-lift">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Classes Attended</span>
              <p className="text-2xl font-bold">{attendance?.totalAttended} / {attendance?.totalClasses}</p>
              <div className="w-24 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden mt-1.5">
                <div 
                  className="bg-[var(--primary)] h-full rounded-full transition-all duration-300"
                  style={{ width: `${attendance?.overallPercentage ?? 100}%` }}
                />
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
              <Percent size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="hover-lift">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Task Completion</span>
              <p className="text-2xl font-bold">
                {completedTasksCount} / {tasks.length}
              </p>
              <span className="text-xs text-[var(--muted-foreground)]">
                {tasks.filter((t) => !t.completed).length} assignments pending
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <CheckSquare size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedules Count Card */}
        <Card className="hover-lift">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Today's Lectures</span>
              <p className="text-2xl font-bold">{todaysClasses.length} Classes</p>
              <span className="text-xs text-[var(--muted-foreground)]">
                Next up: {todaysClasses[0]?.subject || 'None'}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Calendar size={20} />
            </div>
          </CardContent>
        </Card>

        {/* Notice board Card */}
        <Card className="hover-lift">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">Campus Bulletins</span>
              <p className="text-2xl font-bold">{notices.length} Notices</p>
              <span className="text-xs text-[var(--muted-foreground)]">
                {notices.filter((n) => n.pinned).length} pinned announcements
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Bell size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Today's Schedule & Tasks Tracker */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Schedule Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Today's Class Schedule</CardTitle>
                <CardDescription className="text-xs">Classes scheduled for {todayName}</CardDescription>
              </div>
              <Link href="/timetable" className="text-xs text-[var(--primary)] font-bold flex items-center gap-1 hover:underline">
                View Timetable <ArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              {todaysClasses.length === 0 ? (
                <div className="text-center py-8 bg-black/5 dark:bg-white/5 rounded-[var(--radius)] border border-[var(--border)] border-dashed">
                  <Calendar className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
                  <p className="text-sm font-semibold">No classes scheduled for today</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Enjoy your day off or catch up on studies!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysClasses.map((item) => (
                    <div 
                      key={item._id}
                      className="flex items-center gap-4 p-3 rounded-[var(--radius)] bg-black/5 dark:bg-white/5 border-l-4 transition-all hover:bg-black/10 dark:hover:bg-white/10"
                      style={{ borderLeftColor: item.color }}
                    >
                      <div className="shrink-0 bg-white dark:bg-[var(--card)] p-2 rounded-lg border border-[var(--border)] text-center shadow-xs">
                        <Clock size={16} className="mx-auto text-[var(--primary)] mb-1" />
                        <span className="text-[10px] font-extrabold block text-[var(--foreground)]">{item.startTime}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.subject}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)] mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {item.room || 'No Room'}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} /> {item.teacher || 'Staff'}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {item.startTime} - {item.endTime}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recharts Attendance Chart widget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Attendance Analysis Dashboard</CardTitle>
              <CardDescription className="text-xs">Subject-wise attendance percentage comparison</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-8 bg-black/5 dark:bg-white/5 rounded-[var(--radius)] border border-dashed border-[var(--border)] text-sm text-[var(--muted-foreground)]">
                  Log subject attendance records to populate graphs.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          borderColor: 'var(--border)', 
                          color: 'var(--foreground)',
                          borderRadius: 'var(--radius)',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="percentage" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pending Tasks & Recent Bulletins */}
        <div className="space-y-6">
          
          {/* Upcoming Tasks Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Upcoming Assignments</CardTitle>
                <CardDescription className="text-xs">Tasks due in the next few days</CardDescription>
              </div>
              <Link href="/tasks" className="text-xs text-[var(--primary)] font-bold flex items-center gap-1 hover:underline">
                All Tasks <ArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-6 bg-black/5 dark:bg-white/5 rounded-[var(--radius)] border border-[var(--border)] border-dashed">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold">All caught up!</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">No pending assignments at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((task) => {
                    const isOverdue = new Date(task.dueDate) < new Date();
                    return (
                      <div 
                        key={task._id}
                        className="flex items-start gap-3 p-3 rounded-[var(--radius)] bg-black/5 dark:bg-white/5 border border-[var(--border)] hover:border-[var(--primary)] transition-all"
                      >
                        <button
                          onClick={() => handleToggleTask(task._id)}
                          className="mt-0.5 h-4 w-4 rounded border border-[var(--border)] hover:border-[var(--primary)] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        >
                          <div className="h-2.5 w-2.5 bg-[var(--primary)] rounded-xs opacity-0 hover:opacity-50" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs truncate text-[var(--foreground)]">{task.title}</h4>
                          <p className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">{task.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-[var(--muted-foreground)]'}`}>
                              Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <Badge 
                              variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'outline'}
                              className="text-[8px] uppercase tracking-wider py-0 px-1.5"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notices Board Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Recent Announcements</CardTitle>
                <CardDescription className="text-xs">Latest campus notifications</CardDescription>
              </div>
              <Link href="/notices" className="text-xs text-[var(--primary)] font-bold flex items-center gap-1 hover:underline">
                Board <ArrowRight size={14} />
              </Link>
            </CardHeader>
            <CardContent>
              {notices.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-[var(--radius)]">
                  No announcements posted recently.
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.slice(0, 3).map((notice) => (
                    <div 
                      key={notice._id}
                      onClick={() => setSelectedNotice(notice)}
                      className="p-3 rounded-[var(--radius)] bg-black/5 dark:bg-white/5 border border-[var(--border)] hover:border-[var(--primary)] transition-all cursor-pointer relative"
                    >
                      <div className="flex items-center gap-2">
                        {notice.pinned && (
                          <Badge variant="danger" className="text-[8px] py-0 px-1">
                            Pinned
                          </Badge>
                        )}
                        <h4 className="font-semibold text-xs truncate flex-1 text-[var(--foreground)]">{notice.title}</h4>
                      </div>
                      <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 mt-1">{notice.content}</p>
                      <span className="text-[9px] text-[var(--muted-foreground)] block mt-2">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notice Viewer Modal */}
      <Modal
        isOpen={selectedNotice !== null}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || ''}
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3 text-xs text-[var(--muted-foreground)]">
              <span>Author: <strong className="text-[var(--foreground)]">{selectedNotice.authorName}</strong></span>
              <span>Posted on: <strong>{new Date(selectedNotice.createdAt).toLocaleString()}</strong></span>
            </div>
            
            <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--foreground)]">
              {selectedNotice.content}
            </p>

            <div className="flex gap-2 justify-between items-center pt-2">
              <Badge variant="secondary" className="text-xs">
                Dept: {selectedNotice.targetDepartment}
              </Badge>
              {selectedNotice.pinned && (
                <Badge variant="danger" className="text-xs">
                  Important / Pinned Announcement
                </Badge>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
