package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetTaskLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetTaskLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetTaskLogic {
	return &GetTaskLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetTaskLogic) GetTask(id string) (resp *types.TaskResp, err error) {
	var t types.TaskResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT t.id, t.project_id, t.phase_id, COALESCE(t.parent_id::text,''), t.title,
		       COALESCE(t.description,''), t.status, t.priority,
		       COALESCE(t.assignee_id::text,''), COALESCE(u.full_name,''), COALESCE(u.avatar_url,''),
		       COALESCE(t.due_date::text,''), t.estimated_hours, t.actual_hours,
		       (t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status != 'done'),
		       t.column_position, t.created_by::text, t.created_at::text
		FROM tasks t
		LEFT JOIN users u ON u.id = t.assignee_id
		WHERE t.id = $1`, id,
	).Scan(&t.Id, &t.ProjectId, &t.PhaseId, &t.ParentId, &t.Title,
		&t.Description, &t.Status, &t.Priority, &t.AssigneeId, &t.AssigneeName,
		&t.AssigneeAvatar, &t.DueDate, &t.EstimatedHours, &t.ActualHours,
		&t.IsOverdue, &t.ColumnPosition, &t.CreatedBy, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("task not found: %w", err)
	}
	if err = fillAssignees(l.ctx, l.svcCtx.DB, &t); err != nil {
		return nil, err
	}
	return &t, nil
}
