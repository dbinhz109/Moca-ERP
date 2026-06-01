package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/notify"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ApproveTaskLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewApproveTaskLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ApproveTaskLogic {
	return &ApproveTaskLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ApproveTaskLogic) ApproveTask(id string, req *types.ApproveTaskReq) (resp *types.TaskResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	// Chỉ Admin hoặc PM của dự án mới được duyệt / từ chối.
	if err = perm.RequireProjectManagerByTask(l.ctx, l.svcCtx.DB, id, actorID); err != nil {
		return nil, fmt.Errorf("chỉ PM hoặc Admin mới được duyệt công việc")
	}
	// Duyệt -> hoàn thành; Từ chối -> trả về "đang làm" để làm lại (không có cột riêng cho từ chối).
	newStatus := "done"
	if req.Action == "reject" {
		newStatus = "in_progress"
	}
	var t types.TaskResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE tasks SET status=$1 WHERE id=$2 AND status='pending_review'
		RETURNING id, project_id, phase_id, COALESCE(parent_id::text,''), title,
		          COALESCE(description,''), status, priority,
		          COALESCE(assignee_id::text,''), COALESCE(due_date::text,''),
		          estimated_hours, actual_hours,
		          (due_date IS NOT NULL AND due_date < CURRENT_DATE AND status != 'done'),
		          column_position, created_at::text`,
		newStatus, id,
	).Scan(&t.Id, &t.ProjectId, &t.PhaseId, &t.ParentId, &t.Title, &t.Description,
		&t.Status, &t.Priority, &t.AssigneeId, &t.DueDate,
		&t.EstimatedHours, &t.ActualHours, &t.IsOverdue, &t.ColumnPosition, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("task not in pending_review or not found: %w", err)
	}

	// Từ chối: xóa đánh dấu hoàn thành của mọi người để họ làm lại rồi gửi duyệt lần nữa.
	if req.Action == "reject" {
		_, _ = l.svcCtx.DB.ExecContext(l.ctx,
			`UPDATE task_assignees SET is_done = false, done_at = NULL WHERE task_id = $1`, id)
	}

	if err = fillAssignees(l.ctx, l.svcCtx.DB, &t); err != nil {
		return nil, err
	}

	// Báo kết quả duyệt cho tất cả người thực hiện.
	title, body := "Công việc đã được duyệt", "Công việc \""+t.Title+"\" đã được duyệt hoàn thành."
	if req.Action == "reject" {
		title, body = "Công việc bị từ chối", "Công việc \""+t.Title+"\" bị từ chối, đã chuyển lại 'Đang làm' để chỉnh sửa."
	}
	notify.Dispatch(l.ctx, l.svcCtx.DB,
		notify.TaskAssignees(l.ctx, l.svcCtx.DB, id),
		notify.EventDecision, title, body, id, "task")

	return &t, nil
}
