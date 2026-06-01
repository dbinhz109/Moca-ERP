// Package perm tập trung các kiểm tra phân quyền dùng chung cho tầng logic.
package perm

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
)

// ErrForbidden trả về khi người dùng không đủ quyền thao tác.
var ErrForbidden = fmt.Errorf("bạn không có quyền thực hiện thao tác này")

// IsAdmin: người dùng có system role là admin.
func IsAdmin(ctx context.Context) bool {
	return ctxutil.UserRoleFromCtx(ctx) == "admin"
}

// RequireAdmin trả lỗi nếu người dùng không phải admin.
func RequireAdmin(ctx context.Context) error {
	if IsAdmin(ctx) {
		return nil
	}
	return ErrForbidden
}

// CanManageProject: admin hoặc PM của chính dự án đó.
func CanManageProject(ctx context.Context, db *sql.DB, projectID, userID string) bool {
	if IsAdmin(ctx) {
		return true
	}
	var ok bool
	_ = db.QueryRowContext(ctx,
		`SELECT EXISTS(SELECT 1 FROM project_members
		              WHERE project_id=$1 AND user_id=$2 AND role='pm')`,
		projectID, userID).Scan(&ok)
	return ok
}

// RequireProjectManager trả lỗi nếu không phải admin hoặc PM của dự án.
func RequireProjectManager(ctx context.Context, db *sql.DB, projectID, userID string) error {
	if CanManageProject(ctx, db, projectID, userID) {
		return nil
	}
	return ErrForbidden
}

// CanManageProjectByTask: như CanManageProject nhưng tra project qua task.
func CanManageProjectByTask(ctx context.Context, db *sql.DB, taskID, userID string) bool {
	if IsAdmin(ctx) {
		return true
	}
	var ok bool
	_ = db.QueryRowContext(ctx,
		`SELECT EXISTS(SELECT 1 FROM tasks t
		              JOIN project_members pm ON pm.project_id = t.project_id
		              WHERE t.id=$1 AND pm.user_id=$2 AND pm.role='pm')`,
		taskID, userID).Scan(&ok)
	return ok
}

// RequireProjectManagerByTask trả lỗi nếu không phải admin/PM của dự án chứa task.
func RequireProjectManagerByTask(ctx context.Context, db *sql.DB, taskID, userID string) error {
	if CanManageProjectByTask(ctx, db, taskID, userID) {
		return nil
	}
	return ErrForbidden
}

// RequireProjectManagerByPhase trả lỗi nếu không phải admin/PM của dự án chứa phase.
func RequireProjectManagerByPhase(ctx context.Context, db *sql.DB, phaseID, userID string) error {
	if IsAdmin(ctx) {
		return nil
	}
	var ok bool
	_ = db.QueryRowContext(ctx,
		`SELECT EXISTS(SELECT 1 FROM phases ph
		              JOIN project_members pm ON pm.project_id = ph.project_id
		              WHERE ph.id=$1 AND pm.user_id=$2 AND pm.role='pm')`,
		phaseID, userID).Scan(&ok)
	if ok {
		return nil
	}
	return ErrForbidden
}

// IsTaskAssignee: người dùng nằm trong danh sách người thực hiện task.
func IsTaskAssignee(ctx context.Context, db *sql.DB, taskID, userID string) bool {
	var ok bool
	_ = db.QueryRowContext(ctx,
		`SELECT EXISTS(SELECT 1 FROM task_assignees WHERE task_id=$1 AND user_id=$2)`,
		taskID, userID).Scan(&ok)
	return ok
}

// IsTaskCreator: người dùng là người tạo task.
func IsTaskCreator(ctx context.Context, db *sql.DB, taskID, userID string) bool {
	var ok bool
	_ = db.QueryRowContext(ctx,
		`SELECT EXISTS(SELECT 1 FROM tasks WHERE id=$1 AND created_by=$2)`,
		taskID, userID).Scan(&ok)
	return ok
}

// CanEditTaskTeam: được thêm/bớt người thực hiện — người tạo task hoặc PM/Admin.
func CanEditTaskTeam(ctx context.Context, db *sql.DB, taskID, userID string) bool {
	return CanManageProjectByTask(ctx, db, taskID, userID) || IsTaskCreator(ctx, db, taskID, userID)
}
