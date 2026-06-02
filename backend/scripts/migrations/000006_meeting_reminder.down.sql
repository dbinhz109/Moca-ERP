DROP INDEX IF EXISTS idx_meetings_reminder;
ALTER TABLE meetings DROP COLUMN IF EXISTS reminder_sent;
