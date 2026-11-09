import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';
import { IndexedDbStorage } from '../../src/storage/indexedDbStorage';
import type { Clock, Plant } from '../../src/domain/types';

beforeAll(() => {
  // jsdom has no object URLs.
  URL.createObjectURL ??= () => 'blob:test';
  URL.revokeObjectURL ??= () => undefined;
});

let n = 0;
const TODAY = new Date(2026, 10, 4, 10, 0, 0); // Wed 4 Nov 2026, local time
const clock = (d = TODAY): Clock => ({ now: () => new Date(d) });

const plant = (over: Partial<Plant>): Plant => ({
  id: 'p1', typeId: 'monstera', name: 'Monstera', position: { x: 0.3, y: 0.5 }, spotLight: 'sun',
  potDiameterCm: 24, createdAt: '2026-10-01T10:00:00.000Z', archivedAt: null, ...over,
});

async function seeded() {
  const s = new IndexedDbStorage(`app-${++n}`);
  await s.saveFloorPlan({ image: new Blob([new Uint8Array([1])], { type: 'image/png' }), mimeType: 'image/png', widthPx: 800, heightPx: 500, uploadedAt: '2026-10-01T10:00:00.000Z' });
  await s.savePlant(plant({}));
  await s.addWateringEvent({ id: 'e0', plantId: 'p1', wateredAt: new Date(2026, 9, 29, 9).toISOString(), source: 'manual' });
  await s.savePlant(plant({ id: 'p2', typeId: 'kentia-palm', name: 'Palm', spotLight: 'bright', potDiameterCm: 30 }));
  await s.addWateringEvent({ id: 'e1', plantId: 'p2', wateredAt: new Date(2026, 10, 3, 9).toISOString(), source: 'manual' });
  return s;
}

describe('spec001 first run', () => {
  it('spec001_US1_1_empty_state_shows_upload_and_import_only', async () => {
    render(<App storage={new IndexedDbStorage(`app-${++n}`)} clock={clock()} />);
    expect(await screen.findByRole('button', { name: /upload floor plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit map/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /calendar/i })).not.toBeInTheDocument();
  });
});

describe('spec002 watering', () => {
  it('spec002_FR015_header_shows_season', async () => {
    render(<App storage={await seeded()} clock={clock()} />);
    expect(await screen.findByText(/Autumn: a little less often, a little less water/)).toBeInTheDocument();
  });

  it('spec002_FR006_list_grouped_due_first', async () => {
    render(<App storage={await seeded()} clock={clock()} />);
    const due = await screen.findByRole('region', { name: 'Needs water' });
    expect(within(due).getByRole('button', { name: /^Monstera.*today/ })).toBeInTheDocument();
    expect(within(due).queryByText('Palm')).not.toBeInTheDocument();
    expect(within(due).getByText('850 ml')).toBeInTheDocument();
    const ok = screen.getByRole('region', { name: 'OK' });
    expect(within(ok).getByText('Palm')).toBeInTheDocument();
  });

  it('spec002_FR001_FR002_FR003_tap_water_undo_and_double_tap', async () => {
    const user = userEvent.setup();
    const s = await seeded();
    render(<App storage={s} clock={clock()} />);
    const marker = await screen.findByRole('button', { name: /Monstera, needs water, tap to water/ });
    await user.click(marker);
    expect(await screen.findByText('Monstera watered')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /Monstera, ok/ })).toBeInTheDocument());
    expect((await s.listWateringEvents('p1')).length).toBe(2);

    await user.click(screen.getByRole('button', { name: /Monstera, ok/ }));
    expect(await screen.findByText('Monstera was just watered')).toBeInTheDocument();
    expect((await s.listWateringEvents('p1')).length).toBe(2);

    // Undo the first watering via a fresh water + undo.
    await user.click(screen.getByRole('button', { name: /Water Palm/ }));
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    await waitFor(async () => expect((await s.listWateringEvents('p2')).length).toBe(1));
  });

  it('spec002_US1_4_edit_mode_does_not_water', async () => {
    const user = userEvent.setup();
    const s = await seeded();
    render(<App storage={s} clock={clock()} />);
    await user.click(await screen.findByRole('button', { name: /edit map: off/i }));
    expect(screen.getByText(/Editing map/)).toBeInTheDocument();
    screen.getByRole('button', { name: /Monstera, needs water, edit/ }).focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Edit plant' })).toBeInTheDocument();
    expect((await s.listWateringEvents('p1')).length).toBe(1);
  });
});

describe('spec004 calendar', () => {
  it('spec004_US2_1_dialog_lists_copy_links_per_plant', async () => {
    const user = userEvent.setup();
    render(<App storage={await seeded()} clock={clock()} />);
    await user.click(await screen.findByRole('button', { name: /calendar/i }));
    const dlg = await screen.findByRole('dialog', { name: 'Watering reminders' });
    expect(within(dlg).getAllByRole('button', { name: /copy outlook link/i })).toHaveLength(2);
    const open = within(dlg).getByRole('link', { name: /Open Outlook event for Monstera/ }) as HTMLAnchorElement;
    expect(open.href).toContain('outlook.office.com');
    expect(within(dlg).getByRole('button', { name: /download calendar file/i })).toBeEnabled();
  });
});
