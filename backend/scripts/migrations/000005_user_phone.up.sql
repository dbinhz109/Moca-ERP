-- Số điện thoại liên hệ của người dùng (cho phép tự cập nhật trong hồ sơ).
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NOT NULL DEFAULT '';
