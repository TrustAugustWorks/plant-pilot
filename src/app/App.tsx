import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BACKUP_REMINDER_DAYS, CALENDAR_DEFAULT_TIME, CALENDAR_HORIZON_DAYS, UNDO_MS } from '../domain/config';
import { buildIcs, calendarFingerprint, planWaterings, type OutlookAccount } from '../domain/calendar';
import { diffDays, toDateKey } from '../domain/dates';
import { backupFileName } from '../domain/exportFormat';
import { seasonOf, seasonSummary } from '../domain/watering';
import type { Clock, ExportFileV1, Position, WateringEvent } from '../domain/types';
import type { Storage } from '../storage/Storage';
import { CalendarDialog } from '../ui/CalendarDialog';
import { FloorPlanMap } from '../ui/FloorPlanMap';
import { Icon } from '../ui/icons';
import { Confirm } from '../ui/Modal';
import { PlantDialog } from '../ui/PlantDialog';
import { PlantList } from '../ui/PlantList';
import { useGarden } from './useGarden';

type Dialog =
  | { kind: 'add'; position: Position }
  | { kind: 'edit'; id: string }
  | { kind: 'calendar' }
  | { kind: 'import'; data: ExportFileV1 }
  | { kind: 'replace-plan'; file: File }
  | null;

interface Toast { id: number; text: string; undo?: WateringEvent }

function download(name: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function App({ storage, clock }: { storage: Storage; clock: Clock }) {
  const g = useGarden(storage, clock);
  const [editMode, setEditMode] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ time: CALENDAR_DEFAULT_TIME, account: 'work' as OutlookAccount, fingerprint: '', lastExportAt: '', dismissedAt: '' });
  const planInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    Promise.all([
      storage.getMeta('calendarReminderTime'), storage.getMeta('calendarAccount'), storage.getMeta('calendarFingerprint'),
      storage.getMeta('lastExportAt'), storage.getMeta('backupReminderDismissedAt'),
    ]).then(([time, account, fingerprint, lastExportAt, dismissedAt]) => setMeta({
      time: time ?? CALENDAR_DEFAULT_TIME, account: account === 'personal' ? 'personal' : 'work',
      fingerprint: fingerprint ?? '', lastExportAt: lastExportAt ?? '', dismissedAt: dismissedAt ?? '',
    })).catch(() => undefined);
  }, [storage]);

  const showToast = useCallback((text: string, undo?: WateringEvent) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, undo });
    toastTimer.current = setTimeout(() => setToast(null), UNDO_MS);
  }, []);

  const water = async (id: string) => {
    const s = g.states.find((x) => x.plant.id === id);
    if (!s) return;
    try {
      const r = await g.water(id);
      if (r === 'recent') showToast(`${s.plant.name} was just watered`);
      else showToast(`${s.plant.name} watered`, r);
    } catch { /* error banner shown by useGarden */ }
  };

  const undo = async () => {
    if (!toast?.undo) return;
    const ev = toast.undo;
    setToast(null);
    await g.undoWatering(ev).catch(() => undefined);
  };

  const onPlanFile = async (file: File | undefined, confirmed = false) => {
    if (!file) return;
    if (g.floorPlan && g.plants.length > 0 && !confirmed) { setDialog({ kind: 'replace-plan', file }); return; }
    setUploadError(await g.uploadFloorPlan(file).catch((e) => String(e?.message ?? e)));
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    const r = await g.parseBackup(file);
    if (!r.ok) { g.setError(`Import failed: ${r.errors.slice(0, 4).join(' ')}`); return; }
    if (g.floorPlan || g.plants.length) setDialog({ kind: 'import', data: r.data });
    else await g.importBackup(r.data).then(() => showToast('Backup imported')).catch(() => undefined);
  };

  const exportNow = async () => {
    const data = await g.exportBackup().catch(() => null);
    if (!data) return;
    download(backupFileName(g.today), JSON.stringify(data), 'application/json');
    setMeta((m) => ({ ...m, lastExportAt: clock.now().toISOString() }));
  };

  // Calendar (spec 004)
  const appUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const fingerprint = useMemo(() => calendarFingerprint(
    g.states.map((s) => ({ plantId: s.plant.id, nextDue: s.nextDue, interval: s.intervalDays, amountMl: s.amountMl })), meta.time,
  ), [g.states, meta.time]);
  const calendarOutdated = meta.fingerprint !== '' && meta.fingerprint !== fingerprint;

  const downloadCalendar = async () => {
    const ics = buildIcs(g.states.map((s) => ({
      plantId: s.plant.id, name: s.plant.name, careNote: s.type.careNote,
      waterings: planWaterings(s.type, s.plant, s.nextDue, g.today, CALENDAR_HORIZON_DAYS),
    })), { time: meta.time, appUrl, generatedAt: clock.now() });
    download('plant-watering.ics', ics, 'text/calendar;charset=utf-8');
    await storage.setMeta('calendarFingerprint', fingerprint).catch(() => undefined);
    setMeta((m) => ({ ...m, fingerprint }));
    showToast('Calendar file downloaded');
  };
  const setCalTime = (time: string) => { setMeta((m) => ({ ...m, time })); storage.setMeta('calendarReminderTime', time).catch(() => undefined); };
  const setCalAccount = (account: OutlookAccount) => { setMeta((m) => ({ ...m, account })); storage.setMeta('calendarAccount', account).catch(() => undefined); };

  // Backup reminder (spec 003 US3)
  const daysSince = (iso: string) => (iso ? diffDays(toDateKey(new Date(iso)), g.today) : Infinity);
  const showBackupReminder = g.plants.length > 0 && daysSince(meta.lastExportAt) > BACKUP_REMINDER_DAYS && daysSince(meta.dismissedAt) > BACKUP_REMINDER_DAYS;

  const season = seasonOf(g.today);
  const dueCount = g.states.filter((s) => s.status === 'due').length;
  const editing = dialog?.kind === 'edit' ? g.states.find((s) => s.plant.id === dialog.id) : undefined;

  if (g.loading) return <div className="loading" aria-busy="true">Loading…</div>;

  return (
    <div className="app">
      <header className="top">
        <div className="top__brand">
          <span className="top__logo"><Icon name="droplet" size={20} /></span>
          <div>
            <h1>Plant Watering</h1>
            <p className="top__season">{seasonSummary(season)}{g.states.length > 0 && <> · <strong>{dueCount === 0 ? 'nothing due' : `${dueCount} need${dueCount === 1 ? 's' : ''} water`}</strong></>}</p>
          </div>
        </div>
        <nav className="top__actions" aria-label="Actions">
          {g.floorPlan && (
            <button type="button" className={`btn toggle ${editMode ? 'toggle--on' : ''}`} aria-pressed={editMode} onClick={() => setEditMode((v) => !v)}>
              <Icon name="pencil" size={16} /> Edit map: {editMode ? 'on' : 'off'}
            </button>
          )}
          {g.floorPlan && (
            <button type="button" className="btn" onClick={() => setDialog({ kind: 'calendar' })}>
              <Icon name="calendar" size={16} /> Calendar{calendarOutdated && <span className="badge-dot" aria-label="(out of date)" />}
            </button>
          )}
          {g.floorPlan && <button type="button" className="btn btn--ghost" onClick={exportNow}><Icon name="download" size={16} /> Export</button>}
          <button type="button" className="btn btn--ghost" onClick={() => importInput.current?.click()}><Icon name="upload" size={16} /> Import</button>
          <input ref={importInput} type="file" accept="application/json,.json" hidden onChange={(e) => { onImportFile(e.target.files?.[0]); e.target.value = ''; }} />
          <input ref={planInput} type="file" accept="image/jpeg,image/png,image/webp" hidden data-testid="plan-input" onChange={(e) => { onPlanFile(e.target.files?.[0]); e.target.value = ''; }} />
        </nav>
      </header>

      {g.error && <p className="banner banner--error" role="alert">{g.error} <button type="button" className="link" onClick={() => g.setError(null)}>Dismiss</button></p>}
      {showBackupReminder && (
        <p className="banner">
          Your plants live only in this browser. Export a backup now and then.
          <button type="button" className="link" onClick={exportNow}>Export now</button>
          <button type="button" className="link" onClick={() => { const at = clock.now().toISOString(); setMeta((m) => ({ ...m, dismissedAt: at })); storage.setMeta('backupReminderDismissedAt', at).catch(() => undefined); }}>Not now</button>
        </p>
      )}

      {!g.floorPlan ? (
        <main className="empty">
          <div className="empty__card">
            <span className="empty__icon"><Icon name="image" size={36} /></span>
            <h2>Start with your floor plan</h2>
            <p>Upload an image of your apartment (JPEG, PNG or WebP, up to 10 MB). Then place your plants where they stand. Everything stays in this browser; nothing is uploaded anywhere.</p>
            <button type="button" className="btn btn--primary btn--large" onClick={() => planInput.current?.click()}><Icon name="upload" size={18} /> Upload floor plan</button>
            {uploadError && <p className="error" role="alert">{uploadError}</p>}
            <p className="muted">Have a backup? Use <strong>Import</strong> at the top.</p>
          </div>
        </main>
      ) : (
        <main className="layout">
          <section className="layout__map" aria-label="Map">
            {editMode && (
              <div className="edit-banner" role="status">
                <span>Editing map. Click an empty spot to add a plant, drag to move, click a plant to edit.</span>
                <span className="edit-banner__actions">
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => planInput.current?.click()}>Replace floor plan</button>
                  <button type="button" className="btn btn--small btn--primary" onClick={() => setEditMode(false)}><Icon name="check" size={15} /> Done</button>
                </span>
              </div>
            )}
            {uploadError && <p className="error" role="alert">{uploadError}</p>}
            {g.imageUrl && (
              <FloorPlanMap imageUrl={g.imageUrl} widthPx={g.floorPlan.widthPx} heightPx={g.floorPlan.heightPx} states={g.states} today={g.today}
                editMode={editMode} onAddAt={(position) => setDialog({ kind: 'add', position })} onEdit={(id) => setDialog({ kind: 'edit', id })}
                onMove={(id, pos) => g.movePlant(id, pos).catch(() => undefined)} onWater={water} />
            )}
            {!editMode && g.states.length === 0 && <p className="hint center">Turn on <strong>Edit map</strong> and click where your first plant stands.</p>}
          </section>
          <aside className="layout__list" aria-label="Countdown">
            <PlantList states={g.states} today={g.today} onWater={water} />
          </aside>
        </main>
      )}

      {dialog?.kind === 'add' && (
        <PlantDialog mode="add" position={dialog.position} today={g.today} existingNames={g.plants.map((p) => p.name)}
          onSave={(d) => g.addPlant(d)} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'edit' && editing && (
        <PlantDialog mode="edit" position={editing.plant.position} plant={editing.plant} lastWateredKey={editing.lastWateredKey} today={g.today}
          existingNames={g.plants.map((p) => p.name)} onSave={(d) => g.updatePlant(editing.plant, d)} onRemove={() => g.removePlant(editing.plant.id)}
          onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'calendar' && (
        <CalendarDialog states={g.states} today={g.today} time={meta.time} account={meta.account} outdated={calendarOutdated}
          downloadedBefore={meta.fingerprint !== ''} appUrl={appUrl} onTime={setCalTime} onAccount={setCalAccount}
          onDownload={downloadCalendar} onCopied={(m) => showToast(m)} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'import' && (
        <Confirm title="Replace all data?" danger confirmLabel="Replace with backup"
          message={<p>Importing replaces your current floor plan, plants and history with the backup ({dialog.data.plants.length} plants, exported {dialog.data.exportedAt.slice(0, 10)}). This cannot be undone. Export first if unsure.</p>}
          onCancel={() => setDialog(null)}
          onConfirm={async () => { const d = dialog.data; setDialog(null); await g.importBackup(d).then(() => showToast('Backup imported')).catch(() => undefined); }} />
      )}
      {dialog?.kind === 'replace-plan' && (
        <Confirm title="Replace floor plan?" confirmLabel="Replace"
          message={<p>Your plants are kept at the same relative positions on the new image, so some may need moving afterwards.</p>}
          onCancel={() => setDialog(null)}
          onConfirm={() => { const f = dialog.file; setDialog(null); onPlanFile(f, true); }} />
      )}

      <div className="toast-region" aria-live="polite">
        {toast && (
          <div key={toast.id} className="toast">
            <span>{toast.text}</span>
            {toast.undo && <button type="button" className="link link--light" onClick={undo}>Undo</button>}
          </div>
        )}
      </div>
    </div>
  );
}
