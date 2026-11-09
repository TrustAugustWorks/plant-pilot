import { plantInfoLines, type PlantState } from '../domain/watering';
import { Icon } from './icons';

export function PlantInfo({ state, today, compact = false }: { state: PlantState; today: string; compact?: boolean }) {
  const i = plantInfoLines(state, today);
  return (
    <div className="plant-info">
      {!compact && <div className="plant-info__title">{i.title}</div>}
      <div className="plant-info__type">{i.typeLine}</div>
      <dl className="plant-info__grid">
        <dt>Light</dt><dd>{i.likes.replace('Likes: ', 'Likes ')}<br />{i.spot}</dd>
        {i.warning && <><dt className="sr-only">Warning</dt><dd className="plant-info__warn"><Icon name="alert" size={14} /> {i.warning}</dd></>}
        <dt>Interval</dt><dd>{i.interval}</dd>
        <dt>Amount</dt><dd><strong>{i.amount}</strong></dd>
        <dt>Last</dt><dd>{i.last.replace('Last watered ', '')}</dd>
        <dt>Next</dt><dd>{i.next.replace('Next: ', '')}</dd>
      </dl>
      {i.careNote && <p className="plant-info__note">{i.careNote}</p>}
    </div>
  );
}
