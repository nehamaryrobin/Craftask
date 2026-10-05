'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addDays, dateKey } from '@/lib/dates';
import type { Project, Task, TaskCreateInput } from '@/types/task';

const matrixByPriority: Record<Task['priority'], TaskCreateInput['matrixQuadrant']> = {
  high: 'do-first', medium: 'schedule', low: 'let-go',
};

export function TaskDialog({ open, onOpenChange, projects, add }: { open: boolean; onOpenChange: (open: boolean) => void; projects: Project[]; add: (task: TaskCreateInput) => Promise<void> }) {
  const [title, setTitle] = useState(''); const [projectId, setProjectId] = useState(''); const [priority, setPriority] = useState<Task['priority']>('medium'); const [when, setWhen] = useState('today'); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const scheduledDate = when === 'tomorrow' ? dateKey(addDays(new Date(), 1)) : when === 'later' ? dateKey(addDays(new Date(), 3)) : dateKey(new Date());
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!title.trim()) return; setSaving(true); setError(''); try { await add({ name: title.trim(), projectId: projectId || null, scheduledDate, matrixQuadrant: matrixByPriority[priority] }); setTitle(''); setProjectId(''); setPriority('medium'); setWhen('today'); onOpenChange(false); } catch (cause) { setError(cause instanceof Error ? cause.message : 'The task could not be saved.'); } finally { setSaving(false); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="craft-dialog"><DialogHeader><DialogTitle>Make space for your next idea.</DialogTitle><DialogDescription>Capture it now. Take it one step at a time.</DialogDescription></DialogHeader><form onSubmit={submit}><label className="field-label" htmlFor="task-title">Task name</label><Input id="task-title" placeholder="What would you like to get done?" value={title} onChange={event => setTitle(event.target.value)} required maxLength={180} autoFocus/><div className="form-grid"><label className="field-label">Project<select value={projectId} onChange={event => setProjectId(event.target.value)}><option value="">No project · Inbox</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="field-label">Priority<select value={priority} onChange={event => setPriority(event.target.value as Task['priority'])}><option value="high">Urgent & important</option><option value="medium">Important</option><option value="low">Low priority</option></select></label></div><label className="field-label">When<select value={when} onChange={event => setWhen(event.target.value)}><option value="today">Today</option><option value="tomorrow">Tomorrow</option><option value="later">Later this week</option></select></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={!title.trim() || saving}><Plus size={16}/>{saving ? 'Saving…' : 'Add task'}</Button></div></form></DialogContent></Dialog>;
}
