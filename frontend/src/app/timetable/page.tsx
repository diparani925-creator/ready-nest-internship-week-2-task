'use client';

import React, { useEffect, useState } from 'react';
import { api, TimetableItem } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Calendar, MapPin, User, Clock } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLOR_PALETTE = [
  '#0d9488', // Teal
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#eab308', // Amber
  '#10b981', // Emerald
  '#f97316', // Orange
];

export default function TimetablePage() {
  const [schedules, setSchedules] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Monday');
  const [isWeeklyView, setIsWeeklyView] = useState(false);

  // Form states for schedule create/edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TimetableItem | null>(null);
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load timetable
    fetchSchedules();
    
    // Set active tab to today if it's a weekday
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    if (WEEKDAYS.includes(today)) {
      setActiveTab(today);
    }
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/timetable');
      setSchedules(res.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSchedule(null);
    setSubject('');
    setRoom('');
    setTeacher('');
    setDayOfWeek(activeTab);
    setStartTime('09:00');
    setEndTime('10:30');
    setColor(COLOR_PALETTE[0]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TimetableItem) => {
    setEditingSchedule(item);
    setSubject(item.subject);
    setRoom(item.room);
    setTeacher(item.teacher);
    setDayOfWeek(item.dayOfWeek);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setColor(item.color);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!subject || !startTime || !endTime) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (startTime.localeCompare(endTime) >= 0) {
      setErrorMsg('Start time must be before end time.');
      return;
    }

    const payload = { subject, room, teacher, dayOfWeek, startTime, endTime, color };

    try {
      if (editingSchedule) {
        // Update schedule
        const res = await api.put(`/timetable/${editingSchedule._id}`, payload);
        setSchedules(schedules.map((s) => (s._id === editingSchedule._id ? res.data : s)));
      } else {
        // Create schedule
        const res = await api.post('/timetable', payload);
        setSchedules([...schedules, res.data]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error saving class schedule');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this class schedule?')) {
      try {
        await api.delete(`/timetable/${id}`);
        setSchedules(schedules.filter((s) => s._id !== id));
      } catch (err) {
        console.error('Error deleting schedule:', err);
      }
    }
  };

  // Group classes by weekday
  const filteredClasses = schedules
    .filter((s) => s.dayOfWeek === activeTab)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Class Timetable</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Manage and view your weekly lecture schedules</p>
        </div>

        <div className="flex gap-2">
          {/* Toggle Daily/Weekly view */}
          <button
            onClick={() => setIsWeeklyView(!isWeeklyView)}
            className="px-4 py-2 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--muted)] text-sm font-semibold transition-colors cursor-pointer"
          >
            {isWeeklyView ? 'Daily View' : 'Weekly Grid'}
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} /> Add Class
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : isWeeklyView ? (
        
        /* WEEKLY GRID VIEW */
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle className="text-base font-bold">Weekly Overview</CardTitle>
            <CardDescription className="text-xs">Schedule distribution across the week</CardDescription>
          </CardHeader>
          <CardContent className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-2 border-b border-[var(--border)] pb-2 text-center text-xs font-bold text-[var(--muted-foreground)]">
              <div>Time</div>
              {WEEKDAYS.map((day) => (
                <div key={day} className={activeTab === day ? 'text-[var(--primary)]' : ''}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Display time blocks (e.g. 9-10:30, 11-12:30, 1-2:30, 3-4:30) */}
            {['09:00', '11:00', '13:00', '15:00'].map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-8 gap-2 border-b border-[var(--border)] py-4 min-h-[100px]">
                {/* Time slot header */}
                <div className="flex flex-col justify-center items-center text-[10px] font-bold text-[var(--muted-foreground)] border-r border-[var(--border)] pr-2">
                  <Clock size={12} className="mb-1 text-[var(--primary)]" />
                  <span>{timeSlot}</span>
                </div>

                {/* Days of week columns */}
                {WEEKDAYS.map((day) => {
                  // Find if there is a class starting at or near this timeSlot
                  const cls = schedules.find((s) => {
                    if (s.dayOfWeek !== day) return false;
                    const classHour = parseInt(s.startTime.split(':')[0]);
                    const slotHour = parseInt(timeSlot.split(':')[0]);
                    return classHour >= slotHour && classHour < slotHour + 2;
                  });

                  return (
                    <div 
                      key={day} 
                      className={`rounded-[var(--radius)] p-2 text-left relative overflow-hidden transition-all flex flex-col justify-between ${
                        cls ? 'text-white' : 'bg-black/5 dark:bg-white/5 border border-dashed border-[var(--border)] opacity-30'
                      }`}
                      style={cls ? { backgroundColor: cls.color } : undefined}
                    >
                      {cls ? (
                        <>
                          <div className="space-y-1">
                            <p className="text-[10px] font-extrabold truncate leading-tight">{cls.subject}</p>
                            <span className="text-[9px] opacity-85 block truncate">{cls.room}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/20">
                            <span className="text-[8px] opacity-90">{cls.startTime} - {cls.endTime}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleOpenEditModal(cls)}
                                className="p-0.5 hover:bg-white/20 rounded transition-colors text-white cursor-pointer"
                              >
                                <Edit2 size={10} />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] m-auto text-[var(--muted-foreground)]">-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        
        /* DAILY VIEW (TABS LAYOUT) */
        <div className="space-y-4">
          {/* Weekday selector tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveTab(day)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  activeTab === day
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule entries panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.length === 0 ? (
              <Card className="col-span-full py-12 text-center border-dashed">
                <CardContent className="space-y-3">
                  <Calendar className="h-10 w-10 mx-auto text-[var(--muted-foreground)]" />
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold">No lectures scheduled</CardTitle>
                    <CardDescription className="text-xs">There are no classes logged for {activeTab} yet.</CardDescription>
                  </div>
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-[var(--radius)] transition-colors cursor-pointer"
                  >
                    <Plus size={14} /> Add Class
                  </button>
                </CardContent>
              </Card>
            ) : (
              filteredClasses.map((item) => (
                <Card 
                  key={item._id}
                  className="hover-lift border-l-4"
                  style={{ borderLeftColor: item.color }}
                >
                  <CardHeader className="p-5 flex flex-row justify-between items-start">
                    <div className="space-y-1 max-w-[80%]">
                      <Badge variant="outline" className="text-[10px]">
                        {item.startTime} - {item.endTime}
                      </Badge>
                      <CardTitle className="text-sm font-bold truncate mt-1 text-[var(--foreground)]">
                        {item.subject}
                      </CardTitle>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Edit Schedule"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors cursor-pointer"
                        title="Delete Schedule"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 flex flex-col gap-2 border-t border-[var(--border)] mt-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-2">
                      <MapPin size={14} className="text-[var(--primary)]" />
                      <span>Room: <strong className="text-[var(--foreground)]">{item.room || 'Not Specified'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <User size={14} className="text-[var(--primary)]" />
                      <span>Lecturer: <strong className="text-[var(--foreground)]">{item.teacher || 'Not Specified'}</strong></span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Edit Class Schedule' : 'Add Class Schedule'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-[var(--radius)] text-xs text-rose-500">
              {errorMsg}
            </div>
          )}

          {/* Subject Title */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="modal-subject">
              Subject Name *
            </label>
            <input
              id="modal-subject"
              type="text"
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              placeholder="e.g. Software Engineering"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Room */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="modal-room">
                Room / Venue
              </label>
              <input
                id="modal-room"
                type="text"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                placeholder="e.g. Lecture Hall 101"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            {/* Teacher */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="modal-teacher">
                Lecturer Name
              </label>
              <input
                id="modal-teacher"
                type="text"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                placeholder="e.g. Dr. Jenkins"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
              />
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="modal-day">
              Day of Week *
            </label>
            <select
              id="modal-day"
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
            >
              {WEEKDAYS.map((day) => (
                <option key={day} value={day} className="bg-[var(--card)] text-[var(--foreground)]">
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="modal-start">
                Start Time *
              </label>
              <input
                id="modal-start"
                type="time"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="modal-end">
                End Time *
              </label>
              <input
                id="modal-end"
                type="time"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Color Indicator */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-[var(--foreground)]">
              Color Tag
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-6 w-6 rounded-full border-2 transition-transform cursor-pointer"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'var(--foreground)' : 'transparent',
                    transform: color === c ? 'scale(1.15)' : 'none',
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
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
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
