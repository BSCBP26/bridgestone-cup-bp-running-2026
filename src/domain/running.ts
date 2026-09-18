export type Run = { id: string; name: string; date: string; distance: number; seconds: number };
export interface RunRepository { getAll(): Promise<Run[]> }
export function durationSeconds(value: string): number {
  const parts = value.split(':').map(Number);
  if (parts.length !== 3 || parts.some(p => !Number.isFinite(p) || p < 0) || parts[1] >= 60 || parts[2] >= 60) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}
export function parseRuns(csv: string): Run[] {
  return csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1).flatMap((line, index) => {
    const [name, date, rawDistance, , unit, duration] = line.split(';');
    const distance = Number(rawDistance);
    if (!name?.trim() || !/^\d{4}-\d{2}-\d{2}T/.test(date ?? '') || !Number.isFinite(distance) || distance <= 0 || unit !== 'km') return [];
    return [{ id: String(index), name: name.trim(), date: date.slice(0, 10), distance, seconds: durationSeconds(duration ?? '') }];
  });
}
export function paceLabel(seconds: number, distance: number): string {
  if (!seconds || !distance) return '—';
  const pace = Math.round(seconds / distance);
  return `${Math.floor(pace / 60)}:${String(pace % 60).padStart(2, '0')}`;
}
