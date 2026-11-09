import { useMemo, useState } from 'react';
import { POT_DEFAULT_CM, POT_MAX_CM, POT_MIN_CM, NAME_MAX_LENGTH } from '../domain/config';
import { addDays, shortDate } from '../domain/dates';
import { defaultPlantName, effectiveIntervalDays, formatAmount, lightLabel, mismatchWarning, seasonOf, waterAmountMl } from '../domain/watering';
import type { LightLevel, Plant, PlantType, Position } from '../domain/types';
import { LIBRARY_BY_ID, searchLibrary } from '../app/library';
import type { PlantDraft } from '../app/useGarden';
import { Confirm, Modal } from './Modal';
import { Icon } from './icons';

interface Props {
  mode: 'add' | 'edit';
  position: Position;
  plant?: Plant;
  lastWateredKey?: string;
  today: string;
  existingNames: string[];
  onSave(d: PlantDraft): Promise<void>;
  onRemove?(): Promise<void>;
  onClose(): void;
}

const LIGHTS: LightLevel[] = ['sun', 'bright', 'shade'];
const LIGHT_BUTTON: Record<LightLevel, string> = { sun: 'Sun', bright: 'Bright', shade: 'Shade' };

export function PlantDialog({ mode, position, plant, lastWateredKey, today, existingNames, onSave, onRemove, onClose }: Props) {
  const [type, setType] = useState<PlantType | null>(plant ? LIBRARY_BY_ID.get(plant.typeId) ?? null : null);
  const [query, setQuery] = useState('');
  const [name, setName] = useState(plant?.name ?? '');
  const [nameTouched, setNameTouched] = useState(Boolean(plant));
  const [light, setLight] = useState<LightLevel | null>(plant?.spotLight ?? null);
  const [pot, setPot] = useState(String(plant?.potDiameterCm ?? POT_DEFAULT_CM));
  const [last, setLast] = useState(lastWateredKey ?? today);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [saving, setSaving] = useState(false);

  const others = useMemo(() => existingNames.filter((n) => n !== plant?.name), [existingNames, plant]);
  const matches = useMemo(() => searchLibrary(query), [query]);

  const pick = (t: PlantType) => {
    setType(t);
    setQuery('');
    if (!nameTouched) setName(defaultPlantName(t.name, others));
    if (!plant) setLight(t.lightPreference);
    setError(null);
  };

  const spot = light ?? type?.lightPreference ?? 'bright';
  const potNum = Number(pot);
  const potValid = Number.isInteger(potNum) && potNum >= POT_MIN_CM && potNum <= POT_MAX_CM;

  const preview = type && potValid && last <= today ? (() => {
    const interval = effectiveIntervalDays(type, spot, seasonOf(last));
    const next = addDays(last, interval);
    return { interval, next, amount: formatAmount(waterAmountMl(type, potNum, spot, seasonOf(today))) };
  })() : null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return setError('Choose a plant type first.');
    if (!name.trim() || name.length > NAME_MAX_LENGTH) return setError(`Give the plant a name (1-${NAME_MAX_LENGTH} characters).`);
    if (!potValid) return setError(`Pot size must be a whole number from ${POT_MIN_CM} to ${POT_MAX_CM} cm.`);
    if (!last || last > today) return setError('Last watered cannot be in the future.');
    setSaving(true);
    try {
      await onSave({ typeId: type.id, name: name.trim(), spotLight: spot, potDiameterCm: potNum, lastWatered: last, position });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  if (confirmRemove && plant && onRemove) {
    return (
      <Confirm title="Remove plant?" danger confirmLabel="Remove plant"
        message={<p>Remove <strong>{plant.name}</strong> from the map and list? Its watering history is kept in backups.</p>}
        onCancel={() => setConfirmRemove(false)}
        onConfirm={async () => { await onRemove(); onClose(); }} />
    );
  }

  const warning = type ? mismatchWarning(type.lightPreference, spot) : null;

  return (
    <Modal title={mode === 'add' ? 'Add plant' : 'Edit plant'} onClose={onClose}>
      <form className="modal__body form" onSubmit={save} noValidate>
        <div className="field">
          <label htmlFor="type-search">Plant type</label>
          {type && (
            <div className="type-chosen">
              <Icon name={type.icon} size={18} />
              <span><strong>{type.name}</strong> <span className="muted">· {type.nameDa}</span></span>
              <button type="button" className="link" onClick={() => setType(null)}>Change</button>
            </div>
          )}
          {!type && (
            <div className="combo">
              <input id="type-search" type="search" placeholder="Search, e.g. monstera or palme" value={query} autoComplete="off"
                onChange={(e) => setQuery(e.target.value)} aria-controls="type-options" />
              <ul id="type-options" className="combo__list" role="listbox" aria-label="Plant types">
                {matches.map((t) => (
                  <li key={t.id} role="option" aria-selected={false}>
                    <button type="button" onClick={() => pick(t)}>
                      <Icon name={t.icon} size={16} /> <span>{t.name}</span> <span className="muted">{t.nameDa}</span>
                    </button>
                  </li>
                ))}
                {matches.length === 0 && <li className="muted combo__none">No match. Pick the closest type.</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="plant-name">Name</label>
          <input id="plant-name" value={name} maxLength={NAME_MAX_LENGTH} onChange={(e) => { setName(e.target.value); setNameTouched(true); }} />
        </div>

        <fieldset className="field">
          <legend>Light at this spot</legend>
          <div className="seg" role="radiogroup">
            {LIGHTS.map((l) => (
              <button key={l} type="button" role="radio" aria-checked={spot === l} className={`seg__btn ${spot === l ? 'seg__btn--on' : ''}`} onClick={() => setLight(l)}>
                {LIGHT_BUTTON[l]}
              </button>
            ))}
          </div>
          {type && <p className="hint">{type.name} likes {lightLabel(type.lightPreference)}.{warning && <span className="warn"> {warning}.</span>}</p>}
        </fieldset>

        <div className="field-row">
          <div className="field">
            <label htmlFor="pot">Pot diameter (cm)</label>
            <input id="pot" type="number" inputMode="numeric" min={POT_MIN_CM} max={POT_MAX_CM} value={pot} onChange={(e) => setPot(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="last">Last watered</label>
            <input id="last" type="date" max={today} value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
        </div>

        {preview && (
          <div className="preview" aria-live="polite">
            <Icon name="droplet" size={16} />
            <span>Every <strong>{preview.interval} days</strong> · next <strong>{shortDate(preview.next)}</strong> · about <strong>{preview.amount}</strong></span>
          </div>
        )}
        {error && <p className="error" role="alert">{error}</p>}

        <footer className="modal__foot">
          {mode === 'edit' && onRemove && <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirmRemove(true)}>Remove plant</button>}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={saving}>{mode === 'add' ? 'Add plant' : 'Save'}</button>
        </footer>
      </form>
    </Modal>
  );
}
