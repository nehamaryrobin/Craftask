'use client';

import { CalendarDays, Flag, Inbox, Menu, Plus, Search, Sprout, Star } from 'lucide-react';
import { TaskComposer } from './task-composer';
import type { Task } from '@/types/task';

export function InboxView({ tasks, composing, setComposing, add, toggle, openMenu, search }: {
  tasks: Task[]; composing: boolean; setComposing: (open: boolean) => void;
  add: (task: Task) => void; toggle: (id: string) => void; openMenu: () => void; search: () => void;
}) {
  const pending = tasks.filter(task => !task.completed && (task.project === 'Inbox' || task.due === 'inbox'));
  return <div className="inbox-page">
    <div className="inbox-page-tools"><button className="icon-button mobile-menu" onClick={openMenu} aria-label="Open menu"><Menu size={20}/></button><span>Personal workspace</span><button className="icon-button" onClick={search} aria-label="Search tasks"><Search size={18}/></button></div>
    <section className="inbox-workspace" aria-labelledby="inbox-heading">
      <h1 id="inbox-heading">Inbox</h1>
      {pending.length > 0 && <div className="inbox-task-list">{pending.map(task => <div className="inbox-task-row" key={task.id}>
        <button className={`task-check ${task.priority}`} onClick={() => toggle(task.id)} aria-label={`Complete ${task.title}`}/>
        <div><p>{task.title}</p>{task.description && <p className="inbox-task-description">{task.description}</p>}<div className="inbox-task-details">{task.due !== 'inbox' && <span><CalendarDays size={12}/>{task.due}</span>}{task.time && <span>{task.time}</span>}{task.repeat && <span>Repeat: {task.repeat}</span>}{task.priority !== 'low' && <span><Flag size={12}/>{task.priority} priority</span>}{task.labels?.map(label => <span key={label}>#{label}</span>)}{task.location && <span>{task.location}</span>}{task.deadline && <span>Deadline: {task.deadline}</span>}{task.reminder && <span>Reminder: {task.reminder.replace('T', ' ')}</span>}{task.attachments?.map((name,index) => <span key={`${name}-${index}`}>{name}</span>)}</div></div>
      </div>)}</div>}
      {composing ? <TaskComposer onCancel={() => setComposing(false)} onAdd={task => { add(task); setComposing(false); }} /> : pending.length === 0 ? <div className="inbox-empty">
        <div className="inbox-illustration" aria-hidden="true"><span className="illustration-halo"/><Sprout className="illustration-sprout left"/><Sprout className="illustration-sprout right"/><div className="illustration-tray"><Inbox strokeWidth={1.2}/></div><Star className="illustration-star one"/><Star className="illustration-star two"/><span className="illustration-ground"/></div>
        <h2>Capture now, find your focus later.</h2><p>A home for everything on your mind.<br/>Add a task, clear some headspace,<br/>and organize it when you’re ready.</p><button className="inbox-add-button" onClick={() => setComposing(true)}><Plus size={17}/>Add task</button>
      </div> : <button className="inbox-inline-add" onClick={() => setComposing(true)}><Plus size={18}/>Add task</button>}
    </section>
  </div>;
}
