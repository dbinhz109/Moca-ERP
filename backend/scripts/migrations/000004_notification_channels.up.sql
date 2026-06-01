-- Kênh thông báo ngoài (Telegram / Zalo) + cấu hình theo từng người dùng.

-- Cấu hình hệ thống (1 dòng duy nhất) — token do Admin thiết lập.
CREATE TABLE IF NOT EXISTS notification_config (
    id                 SMALLINT     PRIMARY KEY DEFAULT 1,
    telegram_enabled   BOOLEAN      NOT NULL DEFAULT FALSE,
    telegram_bot_token TEXT         NOT NULL DEFAULT '',
    zalo_enabled       BOOLEAN      NOT NULL DEFAULT FALSE,
    zalo_oa_token      TEXT         NOT NULL DEFAULT '',
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT notification_config_singleton CHECK (id = 1)
);
INSERT INTO notification_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Liên kết kênh + tuỳ chọn nhận thông báo của từng người dùng.
CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id          UUID         PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    telegram_chat_id TEXT         NOT NULL DEFAULT '',
    zalo_user_id     TEXT         NOT NULL DEFAULT '',
    telegram_on      BOOLEAN      NOT NULL DEFAULT TRUE,
    zalo_on          BOOLEAN      NOT NULL DEFAULT FALSE,
    notify_assigned  BOOLEAN      NOT NULL DEFAULT TRUE,
    notify_review    BOOLEAN      NOT NULL DEFAULT TRUE,
    notify_decision  BOOLEAN      NOT NULL DEFAULT TRUE,
    notify_comment   BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
