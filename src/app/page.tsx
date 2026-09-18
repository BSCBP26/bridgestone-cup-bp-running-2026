import { getDashboard } from '@/application/get-dashboard';
import { ExcelRunRepository } from '@/infrastructure/excel-run-repository';
import { Dashboard } from '@/presentation/dashboard';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const repository = new ExcelRunRepository();
  return <Dashboard runs={await getDashboard(repository)} lastUpdated={repository.getLastUpdated()}/>;
}
