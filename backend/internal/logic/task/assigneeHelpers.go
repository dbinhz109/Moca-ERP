package task

import (
	"context"
	"database/sql"

	"github.com/mocatech/erp/internal/types"
)

// loadAssignees trả về danh sách người thực hiện của task kèm trạng thái hoàn thành.
func loadAssignees(ctx context.Context, db *sql.DB, taskID string) (list []types.TaskAssignee, done int, err error) {
	rows, err := db.QueryContext(ctx, `
		SELECT u.id, u.full_name, COALESCE(u.avatar_url,''), ta.is_done
		FROM task_assignees ta
		JOIN users u ON u.id = ta.user_id
		WHERE ta.task_id = $1
		ORDER BY ta.added_at`, taskID)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list = []types.TaskAssignee{}
	for rows.Next() {
		var a types.TaskAssignee
		if err = rows.Scan(&a.Id, &a.FullName, &a.Avatar, &a.IsDone); err != nil {
			return nil, 0, err
		}
		if a.IsDone {
			done++
		}
		list = append(list, a)
	}
	return list, done, rows.Err()
}

// taskTitle lấy tiêu đề task để dựng nội dung thông báo.
func taskTitle(ctx context.Context, db *sql.DB, taskID string) string {
	var t string
	_ = db.QueryRowContext(ctx, `SELECT title FROM tasks WHERE id = $1`, taskID).Scan(&t)
	return t
}

// fillAssignees gắn danh sách assignee + số liệu vào TaskResp.
func fillAssignees(ctx context.Context, db *sql.DB, t *types.TaskResp) error {
	list, done, err := loadAssignees(ctx, db, t.Id)
	if err != nil {
		return err
	}
	t.Assignees = list
	t.DoneCount = done
	t.AssigneeCount = len(list)
	return nil
}

// recomputeStatus tự điều chỉnh trạng thái task theo tiến độ của các assignee:
// tất cả xong -> pending_review; có người chưa xong -> in_progress.
// Không động đến task đã done/rejected (do PM quyết định).
// recomputeStatus trả về (trạng thái sau khi tính lại, có đổi thật hay không).
// changed=true chỉ khi trạng thái thực sự thay đổi — dùng để biết khi nào nên
// gửi thông báo "chờ duyệt".
func recomputeStatus(ctx context.Context, db *sql.DB, taskID string) (newStatus string, changed bool, err error) {
	var total, done int
	var cur string
	if err = db.QueryRowContext(ctx, `
		SELECT t.status,
		       (SELECT COUNT(*) FROM task_assignees WHERE task_id = t.id),
		       (SELECT COUNT(*) FROM task_assignees WHERE task_id = t.id AND is_done)
		FROM tasks t WHERE t.id = $1`, taskID).Scan(&cur, &total, &done); err != nil {
		return "", false, err
	}
	if total == 0 {
		return cur, false, nil // task chưa giao ai, giữ nguyên trạng thái.
	}
	target := "in_progress"
	if done == total {
		target = "pending_review"
	}
	// Chỉ tự điều chỉnh khi đang ở trạng thái cho phép và khác mục tiêu.
	if cur == target || (cur != "new" && cur != "in_progress" && cur != "pending_review") {
		return cur, false, nil
	}
	if _, err = db.ExecContext(ctx, `UPDATE tasks SET status = $1 WHERE id = $2`, target, taskID); err != nil {
		return "", false, err
	}
	return target, true, nil
}
