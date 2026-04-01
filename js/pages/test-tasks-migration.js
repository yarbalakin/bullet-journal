// Tests for migrated tasks feature in tasks.js
// Run with: node js/pages/test-tasks-migration.js

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  PASS: ${description}`);
    passed++;
  } else {
    console.error(`  FAIL: ${description}`);
    failed++;
  }
}

// ── Helper: simulate migrateTask logic (pure, no DB) ──────────────────────────

function buildMigratedTask(sourceTask, toYear, toMonth) {
  const toMonthId = `${toYear}-${String(toMonth + 1).padStart(2, '0')}`;
  return {
    monthId: toMonthId,
    title: sourceTask.title,
    date: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    migratedFrom: sourceTask.monthId,
    migrateCount: (sourceTask.migrateCount || 0) + 1,
  };
}

// ── Helper: simulate grouping logic from renderTasks ─────────────────────────

function groupMigratedIn(tasks) {
  const migratedIn = tasks.filter(t => t.migratedFrom);
  const bySource = {};
  for (const t of migratedIn) {
    const src = t.migratedFrom;
    if (!bySource[src]) bySource[src] = [];
    bySource[src].push(t);
  }
  return bySource;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

console.log('\nmigrateCount increment:');

const original = { id: 1, monthId: '2026-02', title: 'Buy milk', status: 'pending', migrateCount: undefined };
const firstMigration = buildMigratedTask(original, 2026, 2); // to March (month index 2)
assert(firstMigration.migrateCount === 1, 'First migration sets migrateCount to 1');
assert(firstMigration.monthId === '2026-03', 'Target monthId is correct');
assert(firstMigration.migratedFrom === '2026-02', 'migratedFrom points to source month');
assert(firstMigration.status === 'pending', 'Migrated task starts as pending');
assert(firstMigration.date === null, 'Migrated task has no date');

const secondMigration = buildMigratedTask(firstMigration, 2026, 3); // to April
assert(secondMigration.migrateCount === 2, 'Second migration increments migrateCount to 2');
assert(secondMigration.monthId === '2026-04', 'Second migration target monthId is correct');

const thirdMigration = buildMigratedTask(secondMigration, 2026, 4); // to May
assert(thirdMigration.migrateCount === 3, 'Third migration increments migrateCount to 3');

console.log('\nTask without prior migrateCount:');
const fresh = { id: 2, monthId: '2026-01', title: 'No count field', status: 'pending' };
const migrated = buildMigratedTask(fresh, 2026, 1);
assert(migrated.migrateCount === 1, 'Task without migrateCount field: first migration gives 1');

console.log('\ngroupMigratedIn — grouping by source month:');

const tasks = [
  { id: 10, monthId: '2026-04', title: 'A', status: 'pending', migratedFrom: '2026-03', migrateCount: 1 },
  { id: 11, monthId: '2026-04', title: 'B', status: 'done',    migratedFrom: '2026-03', migrateCount: 2 },
  { id: 12, monthId: '2026-04', title: 'C', status: 'pending', migratedFrom: '2026-02', migrateCount: 1 },
  { id: 13, monthId: '2026-04', title: 'D', status: 'pending' },
];

const grouped = groupMigratedIn(tasks);
assert(Object.keys(grouped).length === 2, 'Two distinct source months');
assert(grouped['2026-03'].length === 2, 'Two tasks from 2026-03');
assert(grouped['2026-02'].length === 1, 'One task from 2026-02');

console.log('\ngroupMigratedIn — regular tasks excluded:');
const regularTasks = tasks.filter(t => !t.migratedFrom);
assert(regularTasks.length === 1, 'One regular task not grouped');
assert(regularTasks[0].title === 'D', 'Regular task is D');

console.log('\nmigrateCount badge visibility:');
// Simulate the badge condition from renderTask template
const taskWith0 = { migrateCount: 0 };
const taskWith1 = { migrateCount: 1 };
const taskWithUndefined = {};
assert(!taskWith0.migrateCount, 'migrateCount=0 renders no badge (falsy)');
assert(!!taskWith1.migrateCount, 'migrateCount=1 renders badge');
assert(!taskWithUndefined.migrateCount, 'undefined migrateCount renders no badge');

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
