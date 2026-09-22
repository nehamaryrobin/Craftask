'use client';
import type { MatrixQuadrant, Task, View } from '@/types/task';
import { TaskList } from './task-list';
import { HabitsCard, WeeklyProgress } from './overview-cards';
import { initialHabits } from '@/data/mock-data';
import { EisenhowerMatrix } from './eisenhower-matrix';
export function SecondaryView({view,tasks,toggle,add,habits,toggleHabit,navigate,assignMatrixQuadrant}:{view:View;tasks:Task[];toggle:(id:string)=>void;add:()=>void;habits:typeof initialHabits;toggleHabit:(id:string)=>void;navigate:(v:View)=>void;assignMatrixQuadrant:(id:string,quadrant:MatrixQuadrant|null)=>void}) {
 if(view==='Inbox'||view==='Upcoming') return <TaskList title={view} tasks={tasks.filter(t=>view==='Inbox'?t.due==='inbox':t.due!=='today'&&t.due!=='inbox')} toggle={toggle} add={add}/>;
 if(view==='Habits') return <HabitsCard habits={habits} toggle={toggleHabit} navigate={navigate}/>;
 if(view==='Reports') return <><WeeklyProgress navigate={navigate} completed={tasks.filter(t=>t.due==='today'&&t.completed).length}/><p className="preview-note">Sample weekly activity · Detailed reports will be part of a future iteration.</p></>;
 if(view==='Eisenhower Matrix') return <EisenhowerMatrix tasks={tasks} assignQuadrant={assignMatrixQuadrant}/>;
 if(view==='Settings')return <section className="card settings-card"><h2>Your personal workspace</h2><div className="settings-profile"><span className="avatar">N</span><div><strong>Neha Mary</strong><p>Craftask · Frontend preview</p></div></div><p>This first mockup uses sample data. Changes last for this session; account settings and cloud sync will come later.</p></section>;
 const days=Array.from({length:view==='Monthly Plan'?28:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return d;});
 return <section className="card planner-card"><div className="card-heading"><div><h2>{view==='Calendar'?'Make time for what matters':view}</h2><p>A preview of the days ahead.</p></div></div><div className={view==='Monthly Plan'?'month-grid':'planner-grid'}>{days.map((day,i)=><div className="planner-day" key={day.toISOString()}><span>{day.toLocaleDateString('en',{weekday:'short'})}</span><strong>{day.getDate()}</strong>{tasks.filter(t=>i===0?t.due==='today'&&!t.completed:i===1?t.due==='tomorrow':i===3?t.due==='in 3 days':false).map(t=><p key={t.id}>{t.title}</p>)}</div>)}</div><p className="preview-note">Planning preview · Event editing will be added in a future iteration.</p></section>;
}
