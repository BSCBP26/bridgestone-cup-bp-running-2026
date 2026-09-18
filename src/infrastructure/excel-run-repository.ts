import path from 'node:path';
import ExcelJS from 'exceljs';
import { durationSeconds, type Run, type RunRepository } from '../domain/running';

function value(cell: ExcelJS.Cell): ExcelJS.CellValue {
  const raw = cell.value;
  if (raw && typeof raw === 'object' && 'result' in raw) return raw.result ?? null;
  return raw;
}
function text(cell: ExcelJS.Cell): string {
  const raw = value(cell);
  return raw == null ? '' : String(raw).trim();
}
export function excelDurationSeconds(raw: ExcelJS.CellValue): number {
  if (raw instanceof Date) return Math.round((raw.getTime() - Date.UTC(1899, 11, 30)) / 1000);
  if (typeof raw === 'number') return Number.isFinite(raw) && raw >= 0 ? Math.round(raw * 86400) : 0;
  return durationSeconds(String(raw ?? ''));
}
export class ExcelRunRepository implements RunRepository {
  constructor(private readonly filePath = path.join(process.cwd(), 'data', 'data lari-2026-9-18-9.xlsx')) {}
  getLastUpdated(): string {
    const match = path.basename(this.filePath).match(/-(\d{4})-(\d{1,2})-(\d{1,2})(?:-|\.xlsx$)/);
    if (!match) return 'Tanggal tidak tersedia';
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
      .toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  async getAll(): Promise<Run[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(this.filePath);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error('File Excel tidak memiliki worksheet.');
    const columns = new Map<string, number>();
    sheet.getRow(1).eachCell((cell, index) => columns.set(text(cell), index));
    for (const name of ['Name', 'Date', 'Distance', 'Unit', 'Duration']) {
      if (!columns.has(name)) throw new Error(`Kolom Excel wajib tidak ditemukan: ${name}`);
    }
    const runs: Run[] = [];
    sheet.eachRow((row, index) => {
      if (index === 1) return;
      const cell = (name: string) => row.getCell(columns.get(name)!);
      const name = text(cell('Name'));
      const rawDate = value(cell('Date'));
      const date = rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : String(rawDate ?? '').slice(0, 10);
      const distance = Number(text(cell('Distance')));
      if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(distance) || distance <= 0 || text(cell('Unit')) !== 'km') return;
      const seconds = excelDurationSeconds(value(cell('Duration')));
      runs.push({ id: String(index - 2), name, date, distance, seconds: Number.isFinite(seconds) && seconds > 0 ? seconds : 0 });
    });
    return runs;
  }
}
