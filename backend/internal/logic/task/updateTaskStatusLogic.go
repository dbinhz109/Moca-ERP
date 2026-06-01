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

type UpdateTaskStatusLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateTaskStatusLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateTaskStatusLogic {
	return &UpdateTaskStatusLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateTaskStatusLogic) UpdateTaskStatus(id string, req *types.UpdateTaskStatusReq) (resp *types.TaskResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	isManager := perm.CanManageProjectByTask(l.ctx, l.svcCtx.DB, id, actorID)

	// Chuyển sang done/rejected = hành động duyệt → chỉ PM/Admin.
	if req.Status == "done" || req.Status == "rejected" {
		if !isManager {
			return nil, fmt.Errorf("chỉ PM hoặc Admin mới được duyệt/đóng công việc; thành viên hãy gửi yêu cầu duyệt")
		}
	} else if !isManager {
		// Thành viên chỉ được đổi trạng thái công việc của chính mình (yêu cầu duyệt...).
		if !perm.IsTaskAssignee(l.ctx, l.svcCtx.DB, id, actorID) {
			return nil, perm.ErrForbidden
		}
	}

	var t types.TaskResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE tasks SET status=$1 WHERE id=$2
		RETURNING id, project_id, phase_id, COALESCE(parent_id::text,''), title,
		          COALESCE(description,''), status, priority,
		          COALESCE(assignee_id::text,''), COALESCE(due_date::text,''),
		          estimated_hours, actual_hours,
		          (due_date IS NOT NULL AND due_date < CURRENT_DATE AND status != 'done'),
		          column_position, created_at::text`,
		req.Status, id,
	).Scan(&t.Id, &t.ProjectId, &t.PhaseId, &t.ParentId, &t.Title, &t.Description,
		&t.Status, &t.Priority, &t.AssigneeId, &t.DueDate,
		&t.EstimatedHours, &t.ActualHours, &t.IsOverdue, &t.ColumnPosition, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update task status: %w", err)
	}

	// Kéo sang "Chờ duyệt" -> báo PM/Admin; kéo sang "Hoàn thành" -> báo người thực hiện.
	switch req.Status {
	case "pending_review":
		notify.Dispatch(l.ctx, l.svcCtx.DB,
			notify.ReviewRecipients(l.ctx, l.svcCtx.DB, id),
			notify.EventReview, "Công việc chờ duyệt",
			"Công việc \""+t.Title+"\" đang chờ bạn duyệt.", id, "task")
	case "done":
		notify.Dispatch(l.ctx, l.svcCtx.DB,
			notify.TaskAssignees(l.ctx, l.svcCtx.DB, id),
			notify.EventDecision, "Công việc đã được duyệt",
			"Công việc \""+t.Title+"\" đã được duyệt hoàn thành.", id, "task")
	}
	return &t, nil
}
