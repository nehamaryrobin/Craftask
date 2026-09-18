'use client';
import { Check, Plus, Clock3, SlidersHorizontal, ChevronDown, Inbox } from 'lucide-react';
import type { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { useState } from 'react';
export function TaskList({ tasks, toggle, add, title = 'Today’s tasks' }: { tasks: Task[]; toggle: (id: string) => void; add: () => void; title?: string }) {
 const [filter, setFilter] = useState('All tasks');
 const [showCompleted, setShowCompleted] = useState(true);
 const [prioritySort, setPrioritySort] = useState(false);
 const pending = tasks.filter(t => !t.completed && (filter !== 'High priority' || t.priority === 'high'));
 if (prioritySort) pending.sort((a,b) => ['high','medium','low'].indexOf(a.priority) - ['high','medium','low'].indexOf(b.priority));
 const completed = tasks.filter(t => t.completed);
 return <section className="card task-card"><div className="card-heading"><div><h2>{title} <span className="count-badge">{tasks.filter(t => !t.completed).length}</span></h2><p>A little intention goes a long way.</p></div><button className={cn('icon-button', prioritySort && 'selected')} title="Sort by priority" aria-label="Sort by priority" aria-pressed={prioritySort} onClick={() => setPrioritySort(!prioritySort)}><SlidersHorizontal size={17} /></button></div>
 <div className="task-tabs" role="tablist" aria-label="Task filter">{['All tasks','High priority'].map(tab => <button key={tab} role="tab" aria-selected={filter===tab} className={cn(filter===tab && 'selected')} onClick={() => setFilter(tab)}>{tab}</button>)}<span className="task-date">Let’s make it count</span></div>
 <div className="task-rows">{pending.map(task => <div className="task-row" key={task.id}><button className={cn('task-check',task.priority)} aria-label={`Complete ${task.title}`} onClick={() => toggle(task.id)} /><div className="task-content"><span className="task-title">{task.title}</span><div className="task-meta"><span className={cn('project-dot',task.project==='Wellbeing' ? 'green' : task.project==='Craftask' ? 'indigo' : 'orange')} />{task.project}{task.time && <span className="task-time"><Clock3 size={11} />{task.time}</span>}</div></div><span className={cn('priority-label',task.priority)}>{task.priority === 'high' ? 'High priority' : task.priority === 'medium' ? 'Medium' : 'Low'}</span></div>)}{pending.length===0 && <div className="empty-tasks"><Inbox size={30}/><h3>A little breathing room.</h3><p>{filter==='High priority' ? 'No high-priority tasks here.' : 'You’re all caught up. Capture your next idea.'}</p></div>}</div>
 <button className="inline-add" onClick={add}><Plus size={17} />Add a task<span>Make room for your next idea</span></button>
 {completed.length>0 && <div className="completed-area"><button className="completed-toggle" aria-expanded={showCompleted} onClick={() => setShowCompleted(!showCompleted)}><ChevronDown size={14} style={{transform: showCompleted ? undefined : 'rotate(-90deg)'}} />Completed <span>{completed.length}</span></button>{showCompleted && completed.map(task => <div className="task-row completed" key={task.id}><button className="task-check done" aria-label={`Reopen ${task.title}`} onClick={() => toggle(task.id)}><Check size={12}/></button><span className="task-title">{task.title}</span></div>)}</div>}
 <div className="task-footer"><span className="little-check"><Check size={11}/></span>{completed.length} things done. Every step counts.</div></section>;
}
