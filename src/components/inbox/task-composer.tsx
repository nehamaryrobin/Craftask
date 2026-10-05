'use client';

import { useRef, useState } from 'react';
import { AlignLeft, ArrowUp, Bell, CalendarDays, Flag, Inbox, MapPin, Paperclip, Plus, ScanText, Tag, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePicker } from './date-picker';
import { dateKey, fromDateKey } from '@/lib/dates';
import type { Task, TaskCreateInput } from '@/types/task';

type Detail = 'description' | 'priority' | 'reminder' | 'labels' | 'deadline' | 'location';
const options = [
  { label: 'Description', key: 'description', icon: AlignLeft, hint: 'Text' },
  { label: 'Attachment', key: 'attachment', icon: Paperclip, hint: '' },
  { label: 'Priority', key: 'priority', icon: Flag, hint: '!!' },
  { label: 'Reminders', key: 'reminder', icon: Bell, hint: '!' },
  { label: 'Labels', key: 'labels', icon: Tag, hint: '@' },
  { label: 'Deadline', key: 'deadline', icon: CalendarDays, hint: '' },
  { label: 'Location', key: 'location', icon: MapPin, hint: '' },
] as const;

const matrixByPriority: Record<Task['priority'], TaskCreateInput['matrixQuadrant']> = {
  high: 'do-first', medium: 'schedule', low: 'let-go',
};

export function TaskComposer({ onAdd, onCancel }: { onAdd: (task: TaskCreateInput) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [repeat, setRepeat] = useState('');
  const [menu, setMenu] = useState(false);
  const [fields, setFields] = useState<Detail[]>([]);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('low');
  const [reminder, setReminder] = useState('');
  const [labels, setLabels] = useState('');
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const has = (field: Detail) => fields.includes(field);
  const show = (field: Detail) => { setFields(previous => previous.includes(field) ? previous : [...previous, field]); setMenu(false); };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true); setError('');
    try {
      await onAdd({ name: title.trim(), description: description || null, scheduledDate: date || dateKey(new Date()), scheduledTime: time || null, deadline: deadline || null, matrixQuadrant: matrixByPriority[priority], recurrenceRule: repeat ? repeat.toLowerCase() : null, location: location || null, projectId: null });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The task could not be saved.');
    } finally { setSaving(false); }
  }

  return <form className="inbox-composer" onSubmit={submit} aria-label="New inbox task">
    <div className={`composer-title-line ${date ? 'with-date' : ''}`}><input ref={titleInput} autoFocus className="composer-title" aria-label="Task name" placeholder="What’s on your mind?" value={title} onChange={event => setTitle(event.target.value)} maxLength={180} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); onCancel(); } }} />{date && <mark className="composer-date-highlight">{fromDateKey(date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</mark>}</div>
    {has('description') && <textarea autoFocus className="composer-description" aria-label="Description" placeholder="Add a little more detail…" value={description} onChange={event => setDescription(event.target.value)} />}
    <div className="composer-details">
      {has('priority') && <label>Priority<select aria-label="Priority" autoFocus value={priority} onChange={event => setPriority(event.target.value as Task['priority'])}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>}
      {has('reminder') && <label>Reminder<input autoFocus type="datetime-local" value={reminder} onChange={event => setReminder(event.target.value)} /><small>Saved with this task; notifications come later.</small></label>}
      {has('labels') && <label>Labels<input autoFocus placeholder="Personal, errands" value={labels} onChange={event => setLabels(event.target.value)} /></label>}
      {has('deadline') && <label>Deadline<input autoFocus type="date" value={deadline} onChange={event => setDeadline(event.target.value)} /></label>}
      {has('location') && <label>Location<input autoFocus placeholder="Add a place" value={location} onChange={event => setLocation(event.target.value)} /></label>}
    </div>
    {attachments.length > 0 && <div className="attachment-preview"><Paperclip size={13} />{attachments.join(', ')}<span>Names only · upload comes later</span><button type="button" onClick={() => setAttachments([])} aria-label="Remove attachments"><X size={13}/></button></div>}
    <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} aria-label="Attachments" onChange={event => setAttachments(Array.from(event.target.files || []).map(file => file.name))} />
    {error && <p className="form-error composer-error" role="alert">{error}</p>}<div className="composer-toolbar">
      <Popover open={menu} onOpenChange={setMenu}><PopoverTrigger asChild><button type="button" className="composer-plus" aria-label="Add task details"><Plus size={18}/></button></PopoverTrigger><PopoverContent align="start" className="quick-add-menu" onCloseAutoFocus={event => event.preventDefault()}>
        <div className="quick-add-menu-title"><ScanText size={17}/><span>Task details</span></div>
        <div className="quick-add-options">{options.map(({label,key,icon: Icon,hint}) => <button type="button" key={key} onClick={() => { if (key === 'attachment') { setMenu(false); fileInput.current?.click(); } else show(key); }}><Icon size={17}/><span>{label}</span>{hint && <span className="menu-hint" aria-hidden="true">{hint}</span>}</button>)}</div>
        <div className="quick-add-menu-footer">A little context makes room for clarity.</div>
      </PopoverContent></Popover>
      <span className="composer-chip"><Inbox size={13}/>Inbox</span>
      <DatePicker value={date} onChange={setDate} time={time} onTimeChange={setTime} repeat={repeat} onRepeatChange={setRepeat}/>
      {date && <button type="button" className="clear-date" aria-label="Clear task date" onClick={() => {setDate('');setTime('');setRepeat('');}}><X size={12}/></button>}
      <div className="composer-actions"><button className="composer-cancel" type="button" onClick={onCancel} aria-label="Cancel task" disabled={saving}><X size={20}/></button><button type="submit" className="composer-submit" disabled={!title.trim() || saving} aria-label="Save task"><ArrowUp size={20}/></button></div>
    </div>
  </form>;
}
