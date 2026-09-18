import { getDashboard } from '@/application/get-dashboard';
import { ExcelRunRepository } from '@/infrastructure/excel-run-repository';
export const dynamic = 'force-static';
export async function GET() { return Response.json(await getDashboard(new ExcelRunRepository())); }
