'use client';

import React, { useEffect, useState } from 'react';
import { api, NoteItem } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Search, Tag, StickyNote, Calendar } from 'lucide-react';

const STICKY_COLORS = [
  { hex: '#fef08a', name: 'Yellow highlight', text: 'text-amber-850' }, // Yellow
  { hex: '#bbf7d0', name: 'Emerald green', text: 'text-emerald-850' }, // Green
  { hex: '#bfdbfe', name: 'Soft blue', text: 'text-blue-850' }, // Blue
  { hex: '#fbcfe8', name: 'Soft pink', text: 'text-pink-850' }, // Pink
  { hex: '#e9d5ff', name: 'Soft lavender', text: 'text-purple-850' }, // Purple
  { hex: '#fed7aa', name: 'Soft orange', text: 'text-orange-850' }, // Orange
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState(STICKY_COLORS[0].hex);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notes');
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setTagInput('');
    setTags([]);
    setColor(STICKY_COLORS[0].hex);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: NoteItem) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTagInput('');
    setTags(note.tags || []);
    setColor(note.color);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/,/g, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title) {
      setErrorMsg('Please enter a title for your note.');
      return;
    }

    const payload = {
      title,
      content,
      tags,
      color,
    };

    try {
      if (editingNote) {
        const res = await api.put(`/notes/${editingNote._id}`, payload);
        setNotes(notes.map((n) => (n._id === editingNote._id ? res.data : n)));
      } else {
        const res = await api.post('/notes', payload);
        setNotes([res.data, ...notes]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error saving personal note');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this personal sticky note?')) {
      try {
        await api.delete(`/notes/${id}`);
        setNotes(notes.filter((n) => n._id !== id));
      } catch (err) {
        console.error('Error deleting note:', err);
      }
    }
  };

  // Filtered list
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some((t) => t.toLowerCase().includes(query));
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Sticky Notes</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Jot down quick reminders, study tags, and personal guidelines</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm rounded-[var(--radius)] shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} /> Create Note
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center bg-[var(--card)] p-3 rounded-[var(--radius)] border border-[var(--border)] max-w-md">
        <Search className="h-4 w-4 text-[var(--muted-foreground)] mr-3 shrink-0" />
        <input
          type="text"
          placeholder="Search by title, contents, or tags..."
          className="w-full text-xs bg-transparent focus:outline-none text-[var(--foreground)]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : (
        /* Sticky Notes Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-[var(--card)] rounded-[var(--radius)] border border-dashed border-[var(--border)] text-sm text-[var(--muted-foreground)] space-y-2">
              <StickyNote size={36} className="mx-auto opacity-50" />
              <p className="font-semibold text-base">No sticky notes found</p>
              <p className="text-xs">Create your first sticky note to log quick ideas.</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              // Find matching text color style for light backgrounds in dark/light modes
              const themeColor = STICKY_COLORS.find(c => c.hex === note.color) || STICKY_COLORS[0];
              return (
                <div 
                  key={note._id}
                  className="rounded-[var(--radius)] p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-black/10 dark:border-white/10 hover-lift flex flex-col justify-between min-h-[180px] text-slate-800"
                  style={{ backgroundColor: note.color }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm leading-tight text-slate-900 break-words flex-1">
                        {note.title}
                      </h3>
                      
                      <div className="flex gap-1 shrink-0 bg-white/40 rounded-full p-0.5 border border-white/50">
                        <button
                          onClick={() => handleOpenEditModal(note)}
                          className="p-1 rounded-full text-slate-700 hover:text-slate-950 transition-colors cursor-pointer hover:bg-white/30"
                          title="Edit note"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => handleDelete(note._id)}
                          className="p-1 rounded-full text-rose-700 hover:text-rose-900 transition-colors cursor-pointer hover:bg-white/30"
                          title="Delete note"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed mt-2 whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                  </div>

                  {/* Footer details */}
                  <div className="mt-4 pt-3 border-t border-black/10">
                    {/* Tags list */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map((t, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.25 rounded bg-white/60 text-slate-800 text-[9px] font-semibold border border-white/80"
                          >
                            <Tag size={8} /> {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] text-slate-600 block">
                      Updated: {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Sticky Note' : 'Create Sticky Note'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-[var(--radius)] text-xs text-rose-500">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="note-title">
              Note Title *
            </label>
            <input
              id="note-title"
              type="text"
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
              placeholder="e.g. Algorithms complexity"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="note-content">
              Note Details Content
            </label>
            <textarea
              id="note-content"
              rows={4}
              className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] resize-none"
              placeholder="Jot down details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Tag management */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--foreground)]" htmlFor="tag-input">
              Note Tags (Press Enter or comma to insert)
            </label>
            <div className="flex flex-col gap-2">
              <input
                id="tag-input"
                type="text"
                className="w-full text-sm px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                placeholder="e.g. Study, Homework"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-full text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 text-[var(--foreground)] transition-colors cursor-pointer"
                      title="Click to remove tag"
                    >
                      {t} <span className="text-[10px] opacity-70">×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Color Selection Palette */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-[var(--foreground)]">
              Sticky Note Background
            </label>
            <div className="flex gap-2">
              {STICKY_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className="h-8 w-8 rounded-[var(--radius)] border-2 transition-transform cursor-pointer"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: color === c.hex ? 'var(--foreground)' : 'transparent',
                    transform: color === c.hex ? 'scale(1.15)' : 'none',
                  }}
                  title={c.name}
                />
              ))}
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
              Save Note
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
