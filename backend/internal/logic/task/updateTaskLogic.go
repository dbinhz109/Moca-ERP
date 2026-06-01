package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateTaskLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateTaskLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateTaskLogic {
	return &UpdateTaskLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateTaskLogic) UpdateTask(id string, req *types.CreateTaskReq) (resp *types.TaskResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if !perm.CanManageProjectByTask(l.ctx, l.svcCtx.DB, id, actorID) &&
		!perm.IsTaskAssignee(l.ctx, l.svcCtx.DB, id, actorID) {
		return nil, perm.ErrForbidden
	}
	var t types.TaskResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE tasks SET title=$1, description=$2, assignee_id=NULLIF($3,'')::uuid,
		                 priority=$4, due_date=NULLIF($5,'')::date, estimated_hours=$6
		WHERE id=$7
		RETURNING id, project_id, phase_id, COALESCE(parent_id::text,''), title,
		          COALESCE(description,''), status, priority,
		          COALESCE(assignee_id::text,''), COALESCE(due_date::text,''),
		          estimated_hours, actual_hours,
		          (due_date IS NOT NULL AND due_date < CURRENT_DATE AND status != 'done'),
		          column_position, created_at::text`,
		req.Title, req.Description, req.AssigneeId, req.Priority, req.DueDate, req.EstimatedHours, id,
	).Scan(&t.Id, &t.ProjectId, &t.PhaseId, &t.ParentId, &t.Title, &t.Description,
		&t.Status, &t.Priority, &t.AssigneeId, &t.DueDate,
		&t.EstimatedHours, &t.ActualHours, &t.IsOverdue, &t.ColumnPosition, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}
	return &t, nil
}
