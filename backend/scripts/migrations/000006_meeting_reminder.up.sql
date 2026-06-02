-- Đánh dấu đã gửi nhắc họp (tránh gửi trùng).
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_meetings_reminder
    ON meetings (start_time)
    WHERE reminder_sent = FALSE AND status = 'scheduled';
