-- Task giao cho nhiều người: mỗi người có trạng thái hoàn thành riêng.
CREATE TABLE IF NOT EXISTS task_assignees (
    task_id  uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_done  boolean NOT NULL DEFAULT false,
    done_at  timestamptz,
    added_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_assignees_user ON task_assignees(user_id);

-- Backfill: đưa assignee đơn hiện có vào bảng nhiều người.
INSERT INTO task_assignees (task_id, user_id, is_done)
SELECT id, assignee_id, (status = 'done')
FROM tasks
WHERE assignee_id IS NOT NULL
ON CONFLICT (task_id, user_id) DO NOTHING;
