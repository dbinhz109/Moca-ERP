-- MOCA ERP – PostgreSQL Schema
-- Migration: 000001_init_schema.up.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    username      VARCHAR(100) NOT NULL UNIQUE,
    full_name     VARCHAR(200) NOT NULL,
    password_hash TEXT         NOT NULL,
    avatar_url    TEXT,
    system_role   VARCHAR(20)  NOT NULL DEFAULT 'member' CHECK (system_role IN ('admin','pm','member')),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── WORKSPACES ───────────────────────────────────────────────
CREATE TABLE workspaces (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    color       VARCHAR(7),
    icon        VARCHAR(50),
    owner_id    UUID         NOT NULL REFERENCES users(id),
    is_archived BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
    workspace_id UUID       NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id      UUID       NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    role         VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- ─── PROJECTS ─────────────────────────────────────────────────
CREATE TABLE projects (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID         REFERENCES workspaces(id) ON DELETE SET NULL,
    code         VARCHAR(20)  NOT NULL UNIQUE,
    name         VARCHAR(300) NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    description  TEXT,
    pm_id        UUID         NOT NULL REFERENCES users(id),
    status       VARCHAR(20)  NOT NULL DEFAULT 'planning'
                     CHECK (status IN ('planning','active','paused','completed','cancelled')),
    rag_status   VARCHAR(10)  NOT NULL DEFAULT 'green'
                     CHECK (rag_status IN ('green','amber','red')),
    rag_override BOOLEAN      NOT NULL DEFAULT FALSE,
    rag_note     TEXT,
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    progress     NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_project_dates CHECK (end_date > start_date)
);

CREATE TABLE project_members (
    project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('pm','team_lead','member')),
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- ─── PHASES ───────────────────────────────────────────────────
CREATE TABLE phases (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name       VARCHAR(200) NOT NULL,
    description TEXT,
    weight     NUMERIC(5,2) NOT NULL DEFAULT 0
                   CHECK (weight >= 0 AND weight <= 100),
    progress   NUMERIC(5,2) NOT NULL DEFAULT 0,
    start_date DATE,
    end_date   DATE,
    sort_order INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── TASKS ────────────────────────────────────────────────────
CREATE TABLE tasks (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID         NOT NULL REFERENCES projects(id)  ON DELETE CASCADE,
    phase_id        UUID         NOT NULL REFERENCES phases(id)    ON DELETE CASCADE,
    parent_id       UUID         REFERENCES tasks(id)              ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    assignee_id     UUID         REFERENCES users(id)              ON DELETE SET NULL,
    created_by      UUID         NOT NULL REFERENCES users(id),
    priority        VARCHAR(10)  NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low','medium','high','urgent')),
    status          VARCHAR(20)  NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','in_progress','pending_review','done','rejected')),
    estimated_hours NUMERIC(6,2),
    actual_hours    NUMERIC(6,2) NOT NULL DEFAULT 0,
    due_date        DATE,
    column_position INTEGER      NOT NULL DEFAULT 0,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE task_comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id    UUID NOT NULL REFERENCES tasks(id)  ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_attachments (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id     UUID         NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    uploader_id UUID         NOT NULL REFERENCES users(id),
    file_name   VARCHAR(255) NOT NULL,
    file_url    TEXT         NOT NULL,
    file_size   BIGINT,
    mime_type   VARCHAR(100),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE work_logs (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id     UUID         NOT NULL REFERENCES tasks(id)  ON DELETE CASCADE,
    user_id     UUID         NOT NULL REFERENCES users(id),
    hours       NUMERIC(5,2) NOT NULL,
    logged_date DATE         NOT NULL DEFAULT CURRENT_DATE,
    note        TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── MEETINGS ─────────────────────────────────────────────────
CREATE TABLE meetings (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(300) NOT NULL,
    type            VARCHAR(20)  NOT NULL
                        CHECK (type IN ('review','standup','board','other')),
    organizer_id    UUID         NOT NULL REFERENCES users(id),
    project_id      UUID         REFERENCES projects(id) ON DELETE SET NULL,
    location        VARCHAR(300),
    meeting_url     TEXT,
    start_time      TIMESTAMPTZ  NOT NULL,
    end_time        TIMESTAMPTZ  NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled','ongoing','done','cancelled')),
    notes           TEXT,
    is_recurring    BOOLEAN      NOT NULL DEFAULT FALSE,
    recurrence_rule VARCHAR(100),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_meeting_times CHECK (end_time > start_time)
);

CREATE TABLE meeting_attendees (
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    rsvp       VARCHAR(10) DEFAULT 'pending' CHECK (rsvp IN ('pending','accepted','declined')),
    PRIMARY KEY (meeting_id, user_id)
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE notifications (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50)  NOT NULL,
    title      VARCHAR(300) NOT NULL,
    body       TEXT,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    ref_id     UUID,
    ref_type   VARCHAR(50),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_projects_pm_id         ON projects(pm_id)          WHERE is_deleted = FALSE;
CREATE INDEX idx_projects_workspace_id  ON projects(workspace_id)   WHERE is_deleted = FALSE;
CREATE INDEX idx_projects_status        ON projects(status)          WHERE is_deleted = FALSE;
CREATE INDEX idx_phases_project_id      ON phases(project_id);
CREATE INDEX idx_tasks_project_id       ON tasks(project_id)        WHERE is_deleted = FALSE;
CREATE INDEX idx_tasks_phase_id         ON tasks(phase_id)          WHERE is_deleted = FALSE;
CREATE INDEX idx_tasks_assignee_id      ON tasks(assignee_id)       WHERE is_deleted = FALSE;
CREATE INDEX idx_tasks_status           ON tasks(status)            WHERE is_deleted = FALSE;
CREATE INDEX idx_tasks_due_date         ON tasks(due_date)          WHERE is_deleted = FALSE;
CREATE INDEX idx_meetings_start_time    ON meetings(start_time);
CREATE INDEX idx_meetings_organizer_id  ON meetings(organizer_id);
CREATE INDEX idx_notifications_user_id  ON notifications(user_id)   WHERE is_read = FALSE;

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_workspaces_updated_at   BEFORE UPDATE ON workspaces   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_projects_updated_at     BEFORE UPDATE ON projects      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_phases_updated_at       BEFORE UPDATE ON phases        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_updated_at        BEFORE UPDATE ON tasks         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_meetings_updated_at     BEFORE UPDATE ON meetings      FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── SEED: ADMIN USER ─────────────────────────────────────────
INSERT INTO users (email, username, full_name, password_hash, system_role)
VALUES (
    'admin@mocatech.vn',
    'admin',
    'MOCA Admin',
    -- bcrypt hash của "password" — ĐỔI NGAY sau lần đăng nhập đầu (Cài đặt → Tài khoản)
    '$2a$10$C5PHDn/HbmYUE11uxw4EDuHTmw.IfAwSkeDuYLAYP3DuSBdTyK4R.',
    'admin'
);
