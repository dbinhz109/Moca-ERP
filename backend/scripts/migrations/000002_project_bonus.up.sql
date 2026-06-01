-- Tiền thưởng dự án: tổng quỹ thưởng + tiền thưởng mỗi thành viên
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS bonus_pool numeric(14,2) NOT NULL DEFAULT 0;

ALTER TABLE project_members
    ADD COLUMN IF NOT EXISTS bonus_amount numeric(14,2) NOT NULL DEFAULT 0;
