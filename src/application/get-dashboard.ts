import type { Run, RunRepository } from '../domain/running';
export async function getDashboard(repository: RunRepository) { return repository.getAll(); }
export function summarize(runs: Run[]) {
  const athletes = new Map<string, { name: string; distance: number; seconds: number; timedDistance: number; count: number }>();
  const daily = new Map<string, number>();
  for (const run of runs) {
    const athlete = athletes.get(run.name) ?? { name: run.name, distance: 0, seconds: 0, timedDistance: 0, count: 0 };
    athlete.distance += run.distance; athlete.seconds += run.seconds; athlete.count++;
    if (run.seconds > 0) athlete.timedDistance += run.distance;
    athletes.set(run.name, athlete);
    daily.set(run.date, (daily.get(run.date) ?? 0) + run.distance);
  }
  return { distance: runs.reduce((a,r) => a+r.distance,0), seconds: runs.reduce((a,r) => a+r.seconds,0), timedDistance: runs.filter(r=>r.seconds>0).reduce((a,r)=>a+r.distance,0), athletes: [...athletes.values()].sort((a,b)=>b.distance-a.distance || a.name.localeCompare(b.name)), daily: [...daily].sort(([a],[b])=>a.localeCompare(b)), missingDuration: runs.filter(r=>!r.seconds).length };
}
