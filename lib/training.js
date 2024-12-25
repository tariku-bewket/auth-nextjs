import db from '@/lib/db';

export function getTrainings() {
  const stmt = db.prepare('SELECT * FROM trainings');
  return stmt.all();
}
