ALTER TABLE project_members
    DROP COLUMN IF EXISTS advance_amount,
    DROP COLUMN IF EXISTS expense_amount;
