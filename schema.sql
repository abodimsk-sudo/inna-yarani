CREATE TABLE IF NOT EXISTS visits (
 id TEXT PRIMARY KEY,
 started_at TEXT NOT NULL DEFAULT (datetime('now')),
 completed_at TEXT,
 pledged_at TEXT
);
CREATE INDEX IF NOT EXISTS visits_started_at ON visits(started_at);
CREATE INDEX IF NOT EXISTS visits_completed_at ON visits(completed_at);