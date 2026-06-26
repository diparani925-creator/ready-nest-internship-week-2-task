'use client';

import React, { useEffect, useState, useRef } from 'react';
import { api, TaskItem, Attachment } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Paperclip,
  Search,
  Download,
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    // Default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
    setPriority('medium');
    setAttachments([]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
    setPriority(task.priority);
    setAttachments(task.attachments || []);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleComplete = async (task: TaskItem) => {
    try {
      const res = await api.patch(`/tasks/${task._id}/toggle`);
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title || !dueDate) {
      setErrorMsg('Please enter a title and select a due date.');
      return;
    }

    const payload = {
      title,
      description,
      dueDate,
      priority,
      attachments,
    };

    try {
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data : t)));
      } else {
        const res = await api.post('/tasks', payload);
        setTasks([...tasks, res.data]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error saving assignment task');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks(tasks.filter((t) => t._id !== id));
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Convert uploaded files to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            content: base64String,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const downloadAttachment = (att: Attachment) => {
    const link = document.createElement('a');
    link.href = att.content;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Progress metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered and searched list
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter((task) => {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Assignments & Tasks</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Track academic workloads and checklist completions</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} /> New Assignment
        </button>
      </div>

      {/* Progress tracker widget */}
      <Card className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400">Completion Tracker</span>
            <h3 className="text-lg font-bold">Academic Tasks Progress</h3>
            <p className="text-xs text-[var(--muted-foreground)]">You have completed {completedCount} out of {totalCount} total tasks logged.</p>
          </div>
          <div className="flex items-center gap-3 md:w-1/3 shrink-0">
            <div className="flex-1 h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-bold shrink-0">{progressPercent}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between bg-[var(--card)] p-3 rounded-[var(--radius)] border border-[var(--border)]">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search assignments..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-[var(--radius)] shrink-0 self-start sm:self-auto">
          {['all', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius)] capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : (
        /* Task Cards */
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 bg-[var(--card)] rounded-[var(--radius)] border border-dashed border-[var(--border)] text-sm text-[var(--muted-foreground)] space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-[var(--muted-foreground)] opacity-50" />
              <p className="font-semibold text-base">No assignments found</p>
              <p className="text-xs">Try adjust filters or add a new task to get started.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = !task.completed && new Date(task.dueDate) < new Date();
              return (
                <div 
                  key={task._id}
                  className={`flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 bg-[var(--card)] rounded-[var(--radius)] border transition-all ${
                    task.completed 
                      ? 'opacity-70 border-[var(--border)]' 
                      : isOverdue 
                        ? 'border-rose-500/50 bg-rose-500/[0.02]' 
                        : 'border-[var(--border)] hover:border-[var(--primary)]'
                  }`}
                >
                  
                  {/* Task details header */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-1 h-5 w-5 rounded-full flex items-center justify-center text-[var(--primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all shrink-0 cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-[var(--muted-foreground)]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold text-sm truncate text-[var(--foreground)] ${task.completed ? 'line-through text-[var(--muted-foreground)]' : ''}`}>
                          {task.title}
                        </h3>
                        <Badge 
                          variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'outline'}
                          className="text-[8px] uppercase tracking-wider py-0 px-1.5"
                        >
                          {task.priority}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="danger" className="text-[8px] font-bold py-0 px-1.5 flex items-center gap-0.5">
                            <AlertTriangle size={8} /> OVERDUE
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs text-[var(--muted-foreground)] mt-1 whitespace-pre-line ${task.completed ? 'line-through' : ''}`}>
                        {task.description}
                      </p>

                      {/* Attachments Section */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-[var(--border)]">
                          {task.attachments.map((att, idx) => (
                            <button
                              key={idx}
                              onClick={() => downloadAttachment(att)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-md text-[10px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                              title="Click to download attachment"
                            >
                              <Paperclip size={10} />
                              <span className="truncate max-w-[120px]">{att.name}</span>
                              <Download size={8} className="ml-1 opacity-70" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task actions footer (mobile details stacking) */}
                  <div className="flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border)] shrink-0">
                    <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      <Calendar size={13} />
                      Due: <strong className={isOverdue ? 'text-rose-500 font-bold' : 'text-[var(--foreground)]'}>
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="p-2 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Edit assignment details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors cursor-pointer"
                        title="Delete assignment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Assignment Task' : 'Create Assignment Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-[var(--radius)] text-xs text-rose-500">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="task-title">
              Assignment Title *
            </label>
            <input
              id="task-title"
              type="text"
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              placeholder="e.g. Graph Algorithms Implementation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              rows={3}
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] resize-none"
              placeholder="e.g. Write implementation of BFS and DFS traversals in Python or C++ and upload reports."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="task-due">
                Due Date *
              </label>
              <input
                id="task-due"
                type="date"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="task-priority">
                Task Priority
              </label>
              <select
                id="task-priority"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="low" className="bg-[var(--card)]">Low</option>
                <option value="medium" className="bg-[var(--card)]">Medium</option>
                <option value="high" className="bg-[var(--card)]">High</option>
              </select>
            </div>
          </div>

          {/* Attachments Upload Handler */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-[var(--foreground)]">
              File Attachments
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-black/5 dark:bg-white/5 border border-dashed border-[var(--border)] hover:border-[var(--primary)] rounded-[var(--radius)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Paperclip size={14} /> Attach Reference Files
              </button>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {attachments.map((att, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-md border border-[var(--border)] text-xs"
                    >
                      <span className="truncate max-w-[80%] flex items-center gap-1 text-[var(--foreground)]">
                        <Paperclip size={12} className="text-[var(--primary)] shrink-0" />
                        {att.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-rose-600 hover:text-rose-700 text-[10px] font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              Save Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
