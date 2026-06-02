-- Khoản ứng/chi của từng thành viên trong dự án:
--  - advance_amount: ứng cho mục đích CÁ NHÂN  -> TRỪ vào tiền thưởng khi quyết toán.
--  - expense_amount: ứng tiền MUA ĐỒ phục vụ dự án -> được CÔNG TY BÙ LẠI (cộng vào thực nhận).
-- Thực nhận = bonus_amount - advance_amount + expense_amount
ALTER TABLE project_members
    ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS expense_amount NUMERIC(14,2) NOT NULL DEFAULT 0;
