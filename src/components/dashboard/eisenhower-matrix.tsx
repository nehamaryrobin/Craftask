'use client';

import { GripVertical, RotateCcw } from 'lucide-react';
import type { DragEvent } from 'react';
import type { MatrixQuadrant, Task } from '@/types/task';

const quadrants: { id: MatrixQuadrant; number: string; title: string; subtitle: string }[] = [
  { id: 'do-first', number: '01', title: 'Do first', subtitle: 'Urgent & important' },
  { id: 'schedule', number: '02', title: 'Schedule', subtitle: 'Important, not urgent' },
  { id: 'delegate', number: '03', title: 'Delegate', subtitle: 'Urgent, less important' },
  { id: 'let-go', number: '04', title: 'Let go', subtitle: 'Neither urgent nor important' },
];

type Props = {
  tasks: Task[];
  assignQuadrant: (id: string, quadrant: MatrixQuadrant | null) => void;
};

export function EisenhowerMatrix({ tasks, assignQuadrant }: Props) {
  const todayTasks = tasks.filter(task => task.due === 'today');
  const move = (event: DragEvent<HTMLElement>, quadrant: MatrixQuadrant | null) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    if (id) assignQuadrant(id, quadrant);
  };
  const allowDrop = (event: DragEvent<HTMLElement>) => event.preventDefault();

  return <div className="matrix-page">
    <p className="matrix-intro">Sort today’s tasks by what needs your attention. Drag a task into a quadrant when you’re ready.</p>
    <div className="matrix-grid" aria-label="Eisenhower Matrix">
      {quadrants.map(quadrant => {
        const assigned = todayTasks.filter(task => task.matrixQuadrant === quadrant.id);
        return <section className={`card matrix-cell quadrant-${quadrant.id}`} key={quadrant.id} onDragOver={allowDrop} onDrop={event => move(event, quadrant.id)} aria-label={`${quadrant.title}: ${quadrant.subtitle}`}>
          <span className="section-kicker">{quadrant.number}</span>
          <h2>{quadrant.title}</h2>
          <p>{quadrant.subtitle}</p>
          <div className="matrix-dropzone" data-testid={`matrix-${quadrant.id}`}>
            {assigned.length ? assigned.map(task => <MatrixTask key={task.id} task={task} onReturn={() => assignQuadrant(task.id, null)} />) : <span className="matrix-empty">Drop tasks here</span>}
          </div>
        </section>;
      })}
    </div>
    <section className="card unassigned-tasks" onDragOver={allowDrop} onDrop={event => move(event, null)} aria-label="Unassigned tasks">
      <div className="card-heading"><div><h2>Today’s tasks <span className="count-badge">{todayTasks.filter(task => !task.matrixQuadrant).length}</span></h2><p>Drag a task into the matrix to prioritize it.</p></div></div>
      <div className="unassigned-dropzone" data-testid="matrix-unassigned">
        {todayTasks.filter(task => !task.matrixQuadrant).map(task => <MatrixTask key={task.id} task={task} />)}
        {!todayTasks.some(task => !task.matrixQuadrant) && <p className="matrix-all-sorted">Everything is sorted. You can drag a task back here at any time.</p>}
      </div>
    </section>
  </div>;
}

function MatrixTask({ task, onReturn }: { task: Task; onReturn?: () => void }) {
  return <article className={`matrix-task ${task.completed ? 'completed' : ''}`} draggable onDragStart={event => { event.dataTransfer.setData('text/plain', task.id); event.dataTransfer.effectAllowed = 'move'; }}>
    <GripVertical size={15} aria-hidden="true" /><span>{task.title}</span>
    {onReturn && <button type="button" onClick={onReturn} aria-label={`Return ${task.title} to Today's tasks`} title="Return to Today’s tasks"><RotateCcw size={14} /></button>}
  </article>;
}
