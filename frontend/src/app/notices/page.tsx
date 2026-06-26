'use client';

import React, { useEffect, useState } from 'react';
import { api, NoticeItem } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Plus, Trash2, Bell, Calendar, User, Eye, AlertTriangle } from 'lucide-react';

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (Only visible to Admin role)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('All');
  const [pinned, setPinned] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reader detail state
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setTitle('');
    setContent('');
    setTargetDepartment('All');
    setPinned(false);
    setErrorMsg('');
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title || !content) {
      setErrorMsg('Please enter both a title and details content.');
      return;
    }

    try {
      const res = await api.post('/notices', {
        title,
        content,
        targetDepartment,
        pinned,
      });
      setNotices([res.data, ...notices].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error publishing notice');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this notice announcement?')) {
      try {
        await api.delete(`/notices/${id}`);
        setNotices(notices.filter((n) => n._id !== id));
      } catch (err) {
        console.error('Error deleting notice:', err);
      }
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Notice Board</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Official announcements and campus bulletin boards</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} /> Publish Notice
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : (
        /* Notices Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-[var(--card)] rounded-[var(--radius)] border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-sm space-y-2">
              <Bell size={36} className="mx-auto opacity-50" />
              <p className="font-semibold text-base">Notice Board is empty</p>
              <p className="text-xs">Check back later for official college announcements.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <Card 
                key={notice._id}
                className={`hover-lift relative flex flex-col justify-between h-56 ${
                  notice.pinned ? 'border-amber-500/40 bg-amber-500/[0.01]' : 'border-[var(--border)]'
                }`}
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {notice.pinned && (
                          <Badge variant="danger" className="text-[8px] uppercase tracking-wider py-0">
                            Pinned
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[8px] uppercase tracking-wider py-0">
                          Dept: {notice.targetDepartment}
                        </Badge>
                      </div>
                      
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="p-1 rounded-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    
                    <CardTitle className="text-sm font-bold truncate mt-2 text-[var(--foreground)]" title={notice.title}>
                      {notice.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-5 pb-0">
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
                      {notice.content}
                    </p>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 border-t border-[var(--border)] mt-4 flex items-center justify-between">
                  <span className="text-[9px] text-[var(--muted-foreground)] flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  <button
                    onClick={() => setSelectedNotice(notice)}
                    className="flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    <Eye size={12} /> View Details
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 1. Notice Viewer Modal */}
      <Modal
        isOpen={selectedNotice !== null}
        onClose={() => setSelectedNotice(null)}
        title={selectedNotice?.title || ''}
      >
        {selectedNotice && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3 text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1">
                <User size={13} />
                Author: <strong className="text-[var(--foreground)]">{selectedNotice.authorName} (Admin)</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                Date: <strong>{new Date(selectedNotice.createdAt).toLocaleString()}</strong>
              </span>
            </div>
            
            <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--foreground)]">
              {selectedNotice.content}
            </p>

            <div className="flex gap-2 justify-between items-center pt-2 border-t border-[var(--border)]">
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

      {/* 2. Publish Notice Modal (Only Admins) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publish Campus Announcement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-[var(--radius)] text-xs text-rose-500">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="notice-title">
              Announcement Title *
            </label>
            <input
              id="notice-title"
              type="text"
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              placeholder="e.g. End Semester Exam Timetable"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Target Department */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="notice-dept">
              Target Audience / Department
            </label>
            <select
              id="notice-dept"
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
            >
              <option value="All" className="bg-[var(--card)]">All Students</option>
              <option value="Computer Science" className="bg-[var(--card)]">Computer Science Dept</option>
              <option value="Mechanical" className="bg-[var(--card)]">Mechanical Dept</option>
              <option value="Electrical" className="bg-[var(--card)]">Electrical Dept</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="notice-content">
              Details Content *
            </label>
            <textarea
              id="notice-content"
              rows={5}
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] resize-none"
              placeholder="Write the full description of your announcement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Pinned toggle */}
          <label className="flex items-center gap-2 p-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-black/5 dark:bg-white/5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="accent-rose-500 h-4 w-4"
            />
            <span className="font-semibold text-rose-600 dark:text-rose-400">Pin to top (Mark as critical announcement)</span>
          </label>

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-[var(--border)] text-sm font-semibold rounded-[var(--radius)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer"
            >
              Publish Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
