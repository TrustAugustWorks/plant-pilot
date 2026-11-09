import { describe, it, expect } from 'vitest';
import { validateExport, backupFileName } from '../../src/domain/exportFormat';

const known = new Set(['monstera']);
const valid = () => ({
  format: 'plant-pilot-export',
  formatVersion: 1,
  exportedAt: '2026-11-04T18:30:00.000Z',
  appVersion: '0.1.0',
  floorPlan: { mimeType: 'image/png', widthPx: 10, heightPx: 10, uploadedAt: '2026-11-04T17:00:00.000Z', imageBase64: 'AAAA' },
  plants: [{
    id: 'p1', typeId: 'monstera', name: 'Monstera', position: { x: 0.3, y: 0.6 }, spotLight: 'bright',
    potDiameterCm: 24, createdAt: '2026-11-04T17:05:00.000Z', archivedAt: null,
  }],
  wateringEvents: [{ id: 'e1', plantId: 'p1', wateredAt: '2026-11-04T17:05:00.000Z', source: 'manual' }],
});

describe('spec003 export format', () => {
  it('spec003_US1_1_file_name', () => expect(backupFileName('2026-11-04')).toBe('plants-backup-2026-11-04.json'));
  it('spec003_FR002_valid_file_passes', () => expect(validateExport(valid(), known).ok).toBe(true));
  it('spec003_US2_3_garbage_is_rejected', () => {
    expect(validateExport({ hello: 1 }, known).ok).toBe(false);
    expect(validateExport(null, known).ok).toBe(false);
  });
  it('spec003_US2_4_newer_version_refused', () => {
    const r = validateExport({ ...valid(), formatVersion: 2 }, known);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/newer version/);
  });
  it('spec003_contract_unknown_type_ids_listed', () => {
    const d = valid();
    d.plants[0].typeId = 'triffid';
    const r = validateExport(d, known);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toContain('triffid');
  });
  it('spec003_contract_orphan_event_and_bad_position_rejected', () => {
    const d = valid();
    d.wateringEvents[0].plantId = 'nope';
    d.plants[0].position.x = 1.5;
    const r = validateExport(d, known);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.length).toBe(2);
  });
  it('spec003_contract_floor_plan_may_be_null', () => {
    expect(validateExport({ ...valid(), floorPlan: null }, known).ok).toBe(true);
  });
});
