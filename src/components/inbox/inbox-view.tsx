'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, CalendarDays, Check, Flag, GripVertical, Inbox, Menu, Pencil, Plus, Search, Sprout, Star, Trash2, X } from 'lucide-react';
import { TaskComposer } from './task-composer';
import { dateKey } from '@/lib/dates';
import type { Task, TaskCreateInput } from '@/types/task';

type SortMode = 'recent' | 'date' | 'custom';

export function InboxView({ tasks, composing, setComposing, add, toggle, updateTitle, remove, reorder, openMenu, search }: {
  tasks: Task[]; composing: boolean; setComposing: (open: boolean) => void;
  add: (task: TaskCreateInput) => Promise<void>; toggle: (id: string) => void;
  updateTitle: (id: string, title: string) => Promise<void>; remove: (id: string) => Promise<void>; reorder: (ids: string[]) => Promise<void>;
  openMenu: () => void; search: () => void;
}) {
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [rowError, setRowError] = useState('');
  const pending = useMemo(() => {
    const unfinished = tasks.filter(task => !task.completed);
    if (sortMode === 'date') { const today = dateKey(new Date()); return unfinished.sort((a, b) => (a.scheduledDate ?? today).localeCompare(b.scheduledDate ?? today) || a.dateCreated.localeCompare(b.dateCreated)); }
    if (sortMode === 'custom') return unfinished.sort((a, b) => a.sortOrder - b.sortOrder);
    return unfinished.sort((a, b) => a.dateCreated.localeCompare(b.dateCreated));
  }, [sortMode, tasks]);

  async function dropOn(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const next = [...pending];
    const sourceIndex = next.findIndex(task => task.id === draggedId);
    const targetIndex = next.findIndex(task => task.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    setSortMode('custom'); setDraggedId(null); setRowError('');
    try { await reorder(next.map(task => task.id)); }
    catch (cause) { setRowError(cause instanceof Error ? cause.message : 'The task order could not be saved.'); }
  }

  async function saveTitle(id: string) {
    const name = editTitle.trim(); if (!name) return;
    setRowError('');
    try { await updateTitle(id, name); setEditingId(null); }
    catch (cause) { setRowError(cause instanceof Error ? cause.message : 'The task could not be updated.'); }
  }

  return <div className="inbox-page">
    <div className="inbox-page-tools"><button className="icon-button mobile-menu" onClick={openMenu} aria-label="Open menu"><Menu size={20}/></button><span>Personal workspace</span><button className="icon-button" onClick={search} aria-label="Search tasks"><Search size={18}/></button></div>
    <section className="inbox-workspace" aria-labelledby="inbox-heading">
      <div className="inbox-heading-row"><div><h1 id="inbox-heading">Inbox</h1><p>{pending.length} unfinished {pending.length === 1 ? 'task' : 'tasks'}</p></div><label className="inbox-sort"><ArrowUpDown size={14}/><span className="sr-only">Sort Inbox</span><select aria-label="Sort Inbox" value={sortMode} onChange={event => setSortMode(event.target.value as SortMode)}><option value="recent">Recently added</option><option value="date">Date to complete</option><option value="custom">Custom order</option></select></label></div>
      {rowError && <p className="workspace-error" role="alert">{rowError}</p>}
      {pending.length > 0 && <div className="inbox-task-list">{pending.map(task => <div className="inbox-task-row" key={task.id} draggable onDragStart={event => { setDraggedId(task.id); event.dataTransfer.effectAllowed = 'move'; }} onDragOver={event => event.preventDefault()} onDrop={() => void dropOn(task.id)} onDragEnd={() => setDraggedId(null)} data-dragging={draggedId === task.id || undefined}>
        <button className="task-drag-handle" aria-label={`Drag ${task.title}`} title="Drag to reorder"><GripVertical size={17}/></button><button className={`task-check ${task.priority}`} onClick={() => toggle(task.id)} aria-label={`Complete ${task.title}`}/>
        <div className="inbox-task-content">{editingId === task.id ? <form className="inbox-title-edit" onSubmit={event => { event.preventDefault(); void saveTitle(task.id); }}><input autoFocus aria-label={`Edit ${task.title}`} value={editTitle} onChange={event => setEditTitle(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setEditingId(null); }}/><button type="submit" aria-label="Save task title"><Check size={15}/></button><button type="button" onClick={() => setEditingId(null)} aria-label="Cancel editing"><X size={15}/></button></form> : <p>{task.title}</p>}{task.description && <p className="inbox-task-description">{task.description}</p>}<div className="inbox-task-details"><span><CalendarDays size={12}/>{task.due === 'inbox' ? 'Today' : task.due}</span>{task.time && <span>{task.time}</span>}{task.repeat && <span>Repeat: {task.repeat}</span>}{task.priority !== 'low' && <span><Flag size={12}/>{task.priority} priority</span>}{task.labels?.map(label => <span key={label}>#{label}</span>)}{task.location && <span>{task.location}</span>}{task.deadline && <span>Deadline: {task.deadline}</span>}{task.reminder && <span>Reminder: {task.reminder.replace('T', ' ')}</span>}{task.attachments?.map((name,index) => <span key={`${name}-${index}`}>{name}</span>)}</div></div>
        <div className="inbox-row-actions"><button onClick={() => { setEditingId(task.id); setEditTitle(task.title); }} aria-label={`Edit ${task.title}`}><Pencil size={15}/></button><button onClick={() => { if (window.confirm(`Delete “${task.title}”?`)) void remove(task.id); }} aria-label={`Delete ${task.title}`}><Trash2 size={15}/></button></div>
      </div>)}</div>}
      {composing ? <TaskComposer onCancel={() => setComposing(false)} onAdd={async task => { await add(task); setComposing(false); }} /> : pending.length === 0 ? <div className="inbox-empty">
        <div className="inbox-illustration" aria-hidden="true"><span className="illustration-halo"/><Sprout className="illustration-sprout left"/><Sprout className="illustration-sprout right"/><div className="illustration-tray"><Inbox strokeWidth={1.2}/></div><Star className="illustration-star one"/><Star className="illustration-star two"/><span className="illustration-ground"/></div>
        <h2>Capture now, find your focus later.</h2><p>A home for everything on your mind.<br/>Add a task, clear some headspace,<br/>and organize it when you’re ready.</p><button className="inbox-add-button" onClick={() => setComposing(true)}><Plus size={17}/>Add task</button>
      </div> : <button className="inbox-inline-add" onClick={() => setComposing(true)}><Plus size={18}/>Add task</button>}
    </section>
  </div>;
}
