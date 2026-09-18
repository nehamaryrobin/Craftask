'use client';

import { useRef, useState } from 'react';
import { ArrowRightToLine, CalendarDays, ChevronLeft, ChevronRight, Circle, CircleSlash, Clock3, Repeat2, Sofa, Sun } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addDays, dateKey, dateLabel, fromDateKey, parseDateText, quickDates } from '@/lib/dates';
import { cn } from '@/lib/utils';

type Props = { value: string; onChange: (date: string) => void; time: string; onTimeChange: (time: string) => void; repeat: string; onRepeatChange: (repeat: string) => void };

export function DatePicker({ value, onChange, time, onTimeChange, repeat, onRepeatChange }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date());
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [showTime, setShowTime] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const today = new Date();
  const quick = quickDates(today);
  const shortDate = (date: Date) => date.toLocaleDateString('en', {day:'numeric',month:'short'});
  const select = (date: Date) => { const next = dateKey(date); onChange(next); setQuery(shortDate(date)); setError(''); };
  const moveMonth = (delta: number) => { setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1)); scroll.current?.scrollTo(0, 0); };
  const presets = [
    { name:'Today', date:quick.today, icon:CalendarDays, color:'green' },
    { name:'Tomorrow', date:quick.tomorrow, icon:Sun, color:'amber' },
    { name:'This weekend', date:quick.weekend, icon:Sofa, color:'blue' },
    { name:'Next week', date:quick.nextWeek, icon:ArrowRightToLine, color:'purple' },
  ];

  function applyQuery() {
    const parsed = parseDateText(query);
    if (!parsed) { setError('Try “tomorrow”, “22 Sep”, or YYYY-MM-DD.'); return; }
    const date = fromDateKey(parsed);
    select(date);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    scroll.current?.scrollTo(0, 0);
  }

  return <Popover open={open} onOpenChange={next => {
    setOpen(next);
    if (next) { setMonth(value ? fromDateKey(value) : new Date()); setQuery(value ? shortDate(fromDateKey(value)) : ''); setError(''); }
  }}><PopoverTrigger asChild><button type="button" className={cn('composer-date', value && 'has-date')} aria-label={value ? `Task date: ${shortDate(fromDateKey(value))}` : 'Task date'}><CalendarDays size={13}/><span>{value ? dateLabel(value) : 'Date'}</span>{time && <span>{time}</span>}{repeat && <Repeat2 size={12}/>}</button></PopoverTrigger>
    <PopoverContent align="start" sideOffset={5} collisionPadding={12} className="date-picker" aria-label="Choose task date">
      <div className="date-search"><input aria-label="Type a date" placeholder="Type a date" value={query} onChange={event => { setQuery(event.target.value); setError(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); applyQuery(); } }}/>{query && <button type="button" aria-label="Apply typed date" onClick={applyQuery}><ArrowRightToLine size={15}/></button>}</div>
      {error && <p className="date-error" role="alert">{error}</p>}
      <div className="date-presets">{presets.map(({name,date,icon:Icon,color}) => <button type="button" key={name} onClick={() => { select(date); setMonth(new Date(date.getFullYear(),date.getMonth(),1)); scroll.current?.scrollTo(0,0); }}><Icon size={17} className={color}/><span>{name}</span><small>{name === 'Next week' ? date.toLocaleDateString('en',{weekday:'short',day:'numeric',month:'short'}) : date.toLocaleDateString('en',{weekday:'short'})}</small></button>)}
      {value && <button type="button" onClick={() => { onChange(''); onTimeChange(''); onRepeatChange(''); setQuery(''); setError(''); }}><CircleSlash size={17}/><span>No date</span></button>}</div>
      <div className="date-month-header"><strong>{month.toLocaleDateString('en',{month:'short',year:'numeric'})}</strong><button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}><ChevronLeft size={15}/></button><button type="button" aria-label="Go to current month" onClick={() => {setMonth(new Date()); scroll.current?.scrollTo(0,0);}}><Circle size={9}/></button><button type="button" aria-label="Next month" onClick={() => moveMonth(1)}><ChevronRight size={15}/></button></div>
      <div className="date-weekdays" aria-hidden="true">{['M','T','W','T','F','S','S'].map((day,index) => <span key={index}>{day}</span>)}</div>
      <div className="date-months" ref={scroll}>{[0,1].map(offset => {
        const start = new Date(month.getFullYear(),month.getMonth()+offset,1);
        const leading = (start.getDay()+6)%7;
        const days = new Date(start.getFullYear(),start.getMonth()+1,0).getDate();
        return <div key={dateKey(start)}>{offset>0 && <h3>{start.toLocaleDateString('en',{month:'short',year:start.getFullYear()!==month.getFullYear()?'numeric':undefined})}</h3>}<div className="date-grid" role="group" aria-label={start.toLocaleDateString('en',{month:'long',year:'numeric'})}>{Array.from({length:leading},(_,index)=><span key={`blank-${index}`}/>)}{Array.from({length:days},(_,index) => {
          const day = addDays(start,index);
          const key = dateKey(day);
          return <button type="button" key={key} aria-label={day.toLocaleDateString('en',{day:'numeric',month:'long',year:'numeric'})} aria-pressed={key===value} aria-current={key===dateKey(today)?'date':undefined} className={cn(key<dateKey(today)&&'past',key===dateKey(today)&&'today',key===value&&'selected')} onClick={()=>select(day)} onKeyDown={event=>{
            const offset = {ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key];
            if(offset===undefined)return;
            event.preventDefault();
            const target = addDays(day,offset);
            const label=target.toLocaleDateString('en',{day:'numeric',month:'long',year:'numeric'});
            const button=scroll.current?.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
            button?.focus();
          }}>{index+1}</button>;
        })}</div></div>;
      })}</div>
      <div className="date-footer"><button type="button" aria-expanded={showTime} onClick={()=>{if(!value)select(today);setShowTime(!showTime);}}><Clock3 size={13}/>{time || 'Time'}</button>{showTime && <label className="date-extra-field">Task time<input type="time" aria-label="Task time" value={time} onChange={event=>onTimeChange(event.target.value)}/></label>}<button type="button" aria-expanded={showRepeat} onClick={()=>{if(!value)select(today);setShowRepeat(!showRepeat);}}><Repeat2 size={13}/>{repeat || 'Repeat'}</button>{showRepeat && <label className="date-extra-field">Frequency<select aria-label="Repeat frequency" value={repeat} onChange={event=>onRepeatChange(event.target.value)}><option value="">Does not repeat</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select><small>Recurrence preview; automatic repeats come later.</small></label>}</div>
    </PopoverContent>
  </Popover>;
}
