import { useState } from 'react';
import { countdownText, formatAmount, type PlantState } from '../domain/watering';
import type { Status } from '../domain/types';
import { Icon } from './icons';
import { PlantInfo } from './PlantInfo';

const GROUPS: Array<{ status: Status; title: string }> = [
  { status: 'due', title: 'Needs water' },
  { status: 'soon', title: 'Soon' },
  { status: 'ok', title: 'OK' },
];

export function PlantList({ states, today, onWater }: { states: PlantState[]; today: string; onWater(id: string): void }) {
  const [open, setOpen] = useState<string | null>(null);
  if (states.length === 0) return <div className="list list--empty"><p>No plants yet.</p><p className="muted">Turn on <strong>Edit map</strong> and click where a plant stands.</p></div>;

  return (
    <div className="list">
      {GROUPS.map((g) => {
        const rows = states.filter((s) => s.status === g.status);
        if (!rows.length) return null;
        return (
          <section key={g.status} className={`group group--${g.status}`} aria-label={g.title}>
            <h2 className="group__title">{g.title} <span className="group__count">{rows.length}</span></h2>
            <ul>
              {rows.map((s) => {
                const expanded = open === s.plant.id;
                return (
                  <li key={s.plant.id} className={`row ${expanded ? 'row--open' : ''}`}>
                    <div className="row__main">
                      <button type="button" className="row__toggle" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : s.plant.id)}>
                        <span className={`dot dot--${s.status}`} aria-hidden="true"><Icon name={s.type.icon} size={16} /></span>
                        <span className="row__text">
                          <span className="row__name">{s.plant.name}</span>
                          <span className="row__sub">{s.type.name}</span>
                        </span>
                        <span className="row__when">
                          <span className={`row__countdown row__countdown--${s.status}`}>{countdownText(s.daysLeft)}</span>
                          <span className="row__amount">{formatAmount(s.amountMl)}</span>
                        </span>
                      </button>
                      <button type="button" className="btn btn--water" onClick={() => onWater(s.plant.id)} aria-label={`Water ${s.plant.name}, ${formatAmount(s.amountMl)}`}>
                        <Icon name="droplet" size={16} /> <span className="btn--water__label">Water</span>
                      </button>
                    </div>
                    {expanded && <div className="row__info"><PlantInfo state={s} today={today} compact /></div>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
