const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  const localRequire = id => id.startsWith('.') ? load(require('node:path').resolve(require('node:path').dirname(file),id+'.ts')) : require(id);
  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire); return module.exports;
}
const { parseRuns, paceLabel, durationSeconds } = load('src/domain/running.ts');
const { summarize } = load('src/application/get-dashboard.ts');
test('weighted pace excludes missing durations but preserves their distance', () => {
  const stats = summarize([{id:'1',name:'A',date:'2026-09-18',distance:5,seconds:1800},{id:'2',name:'A',date:'2026-09-18',distance:1,seconds:0},{id:'3',name:'B',date:'2026-09-18',distance:10,seconds:3000}]);
  assert.equal(stats.distance,16); assert.equal(stats.timedDistance,15); assert.equal(stats.missingDuration,1); assert.equal(paceLabel(stats.seconds,stats.timedDistance),'5:20'); assert.equal(stats.athletes[0].name,'B');
});
test('source imports all 216 runs and preserves local dates', () => {
  const runs = parseRuns(fs.readFileSync('tests/fixtures/runs.csv','utf8')); assert.equal(runs.length,216); assert.equal(runs[0].date,'2026-09-13'); assert.equal(runs[0].seconds,0); assert.equal(runs[1].seconds,1275); assert.equal(paceLabel(runs[1].seconds,runs[1].distance),'36:01');
});
test('Excel repository preserves every source record and dashboard totals', async () => {
  const { ExcelRunRepository, excelDurationSeconds } = load('src/infrastructure/excel-run-repository.ts');
  const runs = await new ExcelRunRepository().getAll();
  const previous = parseRuns(fs.readFileSync('tests/fixtures/runs.csv','utf8'));
  assert.deepEqual(runs, previous);
  assert.equal(runs.length, 216);
  const stats = summarize(runs);
  assert.equal(stats.athletes.length, 36);
  assert.equal(Math.round(stats.distance * 100), 125725);
  assert.equal(paceLabel(stats.seconds, stats.timedDistance), '8:26');
  assert.equal(excelDurationSeconds(0.5), 43200);
  assert.equal(excelDurationSeconds('00:21:15'), 1275);
  assert.equal(excelDurationSeconds(null), 0);
});
test('invalid durations and records are excluded from timing',()=>{
  assert.equal(durationSeconds('00:99:00'),0); assert.equal(durationSeconds('bad'),0); assert.equal(paceLabel(0,5),'—'); assert.deepEqual(parseRuns('Name;Date;Distance;Pace;Unit;Duration\nA;bad;-1;;km;00:01:00'),[]);
});
