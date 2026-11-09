import { useRef, useState } from 'react';
import type { Position } from '../domain/types';
import type { PlantState } from '../domain/watering';
import { Icon } from './icons';
import { PlantInfo } from './PlantInfo';

interface Props {
  imageUrl: string;
  widthPx: number;
  heightPx: number;
  states: PlantState[];
  today: string;
  editMode: boolean;
  onAddAt(pos: Position): void;
  onEdit(id: string): void;
  onMove(id: string, pos: Position): void;
  onWater(id: string): void;
}

interface Drag { id: string; startX: number; startY: number; pos: Position; moved: boolean }

const STATUS_LABEL = { due: 'needs water', soon: 'soon', ok: 'ok' } as const;

export function FloorPlanMap({ imageUrl, widthPx, heightPx, states, today, editMode, onAddAt, onEdit, onMove, onWater }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [lastMoved, setLastMoved] = useState<string | null>(null);

  const relPos = (clientX: number, clientY: number): Position => {
    const r = frame.current!.getBoundingClientRect();
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  };
  const inside = (p: Position) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1;

  const onFrameClick = (e: React.MouseEvent) => {
    if (!editMode || (e.target as HTMLElement).closest('.marker')) return;
    const p = relPos(e.clientX, e.clientY);
    if (inside(p)) onAddAt({ x: round(p.x), y: round(p.y) });
  };

  const onPointerDown = (e: React.PointerEvent, s: PlantState) => {
    if (!editMode) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ id: s.plant.id, startX: e.clientX, startY: e.clientY, pos: s.plant.position, moved: false });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 5;
    setDrag({ ...drag, moved, pos: moved ? relPos(e.clientX, e.clientY) : drag.pos });
  };
  const onPointerUp = () => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    if (!d.moved) { onEdit(d.id); return; }
    if (inside(d.pos)) {
      setLastMoved(d.id);
      onMove(d.id, { x: round(d.pos.x), y: round(d.pos.y) });
    }
    // Outside the image: the drop is cancelled, the plant stays where it was (FR-008).
  };

  const onMarkerClick = (e: React.MouseEvent, s: PlantState) => {
    e.stopPropagation();
    if (editMode) {
      if (e.detail === 0) onEdit(s.plant.id); // keyboard activation; pointer clicks are handled in pointerup
      return;
    }
    onWater(s.plant.id);
  };

  const wide = (frame.current?.clientWidth ?? 800) >= 520;

  return (
    <div className={`map ${editMode ? 'map--edit' : ''}`}>
      <div ref={frame} className="map__frame" style={{ aspectRatio: `${widthPx} / ${heightPx}` }} onClick={onFrameClick}>
        <img className="map__image" src={imageUrl} alt="Floor plan" draggable={false} />
        {states.map((s) => {
          const pos = drag?.id === s.plant.id ? drag.pos : s.plant.position;
          const showInfo = hover === s.plant.id && !drag;
          return (
            <div key={s.plant.id} className="marker-wrap"
              style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, zIndex: drag?.id === s.plant.id ? 30 : lastMoved === s.plant.id ? 20 : 10 }}>
              <button
                type="button"
                className={`marker marker--${s.status} ${drag?.id === s.plant.id ? 'marker--dragging' : ''}`}
                aria-label={`${s.plant.name}, ${STATUS_LABEL[s.status]}, ${editMode ? 'edit' : 'tap to water'}`}
                onClick={(e) => onMarkerClick(e, s)}
                onPointerDown={(e) => onPointerDown(e, s)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
                onMouseEnter={() => setHover(s.plant.id)}
                onMouseLeave={() => setHover((h) => (h === s.plant.id ? null : h))}
                onFocus={() => setHover(s.plant.id)}
                onBlur={() => setHover((h) => (h === s.plant.id ? null : h))}
              >
                <Icon name={s.type.icon} size={22} />
                {s.status === 'due' && <span className="marker__bang" aria-hidden="true">!</span>}
              </button>
              {wide && <span className="marker__name" aria-hidden="true">{s.plant.name}</span>}
              {showInfo && (
                <div className={`tooltip ${pos.x > 0.6 ? 'tooltip--left' : pos.x < 0.35 ? 'tooltip--right' : ''} ${pos.y > 0.55 ? 'tooltip--up' : ''}`} role="tooltip">
                  <PlantInfo state={s} today={today} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const round = (v: number) => Math.round(v * 10000) / 10000;
