// Export file v1 validation (specs/003-backup-export/contracts/export-format.md). Pure.
import { FLOOR_PLAN_TYPES, NAME_MAX_LENGTH, POT_MAX_CM, POT_MIN_CM } from './config';
import type { ExportFileV1 } from './types';

export const FORMAT_NAME = 'plant-pilot-export';
export const FORMAT_VERSION = 1;

export type ValidationResult = { ok: true; data: ExportFileV1 } | { ok: false; errors: string[] };

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function validateExport(raw: unknown, knownTypeIds: Set<string>): ValidationResult {
  const errors: string[] = [];
  if (!isObj(raw) || raw.format !== FORMAT_NAME) return { ok: false, errors: ['This is not a Plant Watering backup file.'] };
  if (typeof raw.formatVersion !== 'number') return { ok: false, errors: ['The backup has no format version.'] };
  if (raw.formatVersion > FORMAT_VERSION) {
    return { ok: false, errors: [`This backup was made by a newer version of the app (format ${raw.formatVersion}). Update the app first.`] };
  }
  if (raw.formatVersion !== FORMAT_VERSION) return { ok: false, errors: [`Unknown format version ${raw.formatVersion}.`] };
  if (!Array.isArray(raw.plants) || !Array.isArray(raw.wateringEvents)) return { ok: false, errors: ['The backup is missing plants or watering events.'] };

  const fp = raw.floorPlan;
  if (fp !== null) {
    if (!isObj(fp)) errors.push('Floor plan is malformed.');
    else {
      if (!FLOOR_PLAN_TYPES.includes(fp.mimeType as never)) errors.push('Floor plan image type is not supported.');
      if (typeof fp.imageBase64 !== 'string' || fp.imageBase64.length === 0) errors.push('Floor plan image is missing.');
      if (typeof fp.widthPx !== 'number' || typeof fp.heightPx !== 'number') errors.push('Floor plan size is missing.');
      if (typeof fp.uploadedAt !== 'string' || !ISO_UTC.test(fp.uploadedAt)) errors.push('Floor plan date is invalid.');
    }
  }

  const ids = new Set<string>();
  const plantIds = new Set<string>();
  const unknownTypes = new Set<string>();
  for (const [i, p] of (raw.plants as unknown[]).entries()) {
    const where = `Plant ${i + 1}`;
    if (!isObj(p)) { errors.push(`${where} is malformed.`); continue; }
    if (typeof p.id !== 'string' || ids.has(p.id)) errors.push(`${where}: missing or duplicate id.`);
    else { ids.add(p.id); plantIds.add(p.id); }
    if (typeof p.typeId !== 'string') errors.push(`${where}: missing plant type.`);
    else if (!knownTypeIds.has(p.typeId)) unknownTypes.add(p.typeId);
    if (typeof p.name !== 'string' || p.name.length < 1 || p.name.length > NAME_MAX_LENGTH) errors.push(`${where}: invalid name.`);
    const pos = p.position;
    if (!isObj(pos) || typeof pos.x !== 'number' || typeof pos.y !== 'number' || pos.x < 0 || pos.x > 1 || pos.y < 0 || pos.y > 1) {
      errors.push(`${where}: position must be between 0 and 1.`);
    }
    if (!['sun', 'bright', 'shade'].includes(p.spotLight as string)) errors.push(`${where}: invalid spot light.`);
    if (!Number.isInteger(p.potDiameterCm) || (p.potDiameterCm as number) < POT_MIN_CM || (p.potDiameterCm as number) > POT_MAX_CM) {
      errors.push(`${where}: pot size must be a whole number from ${POT_MIN_CM} to ${POT_MAX_CM} cm.`);
    }
    if (typeof p.createdAt !== 'string' || !ISO_UTC.test(p.createdAt)) errors.push(`${where}: invalid created date.`);
    if (p.archivedAt !== null && (typeof p.archivedAt !== 'string' || !ISO_UTC.test(p.archivedAt))) errors.push(`${where}: invalid archived date.`);
  }
  if (unknownTypes.size) errors.push(`Unknown plant types: ${[...unknownTypes].join(', ')}.`);

  for (const [i, e] of (raw.wateringEvents as unknown[]).entries()) {
    const where = `Watering ${i + 1}`;
    if (!isObj(e)) { errors.push(`${where} is malformed.`); continue; }
    if (typeof e.id !== 'string' || ids.has(e.id)) errors.push(`${where}: missing or duplicate id.`);
    else ids.add(e.id);
    if (typeof e.plantId !== 'string' || !plantIds.has(e.plantId)) errors.push(`${where}: refers to an unknown plant.`);
    if (typeof e.wateredAt !== 'string' || !ISO_UTC.test(e.wateredAt)) errors.push(`${where}: invalid date.`);
    if (e.source !== 'manual' && e.source !== 'sensor') errors.push(`${where}: invalid source.`);
  }

  return errors.length ? { ok: false, errors } : { ok: true, data: raw as unknown as ExportFileV1 };
}

export function backupFileName(todayKey: string): string {
  return `plants-backup-${todayKey}.json`;
}
