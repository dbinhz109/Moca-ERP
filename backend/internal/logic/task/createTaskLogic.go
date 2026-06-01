package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/notify"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreateTaskLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCreateTaskLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreateTaskLogic {
	return &CreateTaskLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreateTaskLogic) CreateTask(projectID string, req *types.CreateTaskReq) (resp *types.TaskResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}

	// Phân quyền gán việc: chỉ Admin hoặc PM dự án mới được gán cho người khác.
	// Thành viên thường chỉ được tự khai việc cho chính mình.
	assigneeID := req.AssigneeId
	privileged := ctxutil.UserRoleFromCtx(l.ctx) == "admin"
	if !privileged {
		var isPM bool
		_ = l.svcCtx.DB.QueryRowContext(l.ctx,
			`SELECT EXISTS(SELECT 1 FROM project_members
			              WHERE project_id=$1 AND user_id=$2 AND role='pm')`,
			projectID, userID).Scan(&isPM)
		privileged = isPM
	}
	if !privileged {
		if assigneeID != "" && assigneeID != userID {
			return nil, fmt.Errorf("chỉ PM/Admin mới được gán việc cho người khác")
		}
		assigneeID = userID // thành viên: việc tự khai luôn gán cho chính mình
	}

	var t types.TaskResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		INSERT INTO tasks (project_id, phase_id, title, description, assignee_id, priority, due_date, estimated_hours, created_by)
		VALUES ($1, $2, $3, $4, NULLIF($5,'')::uuid, $6, NULLIF($7,'')::date, $8, $9::uuid)
		RETURNING id, project_id, phase_id, COALESCE(parent_id::text,''), title,
		          COALESCE(description,''), status, priority,
		          COALESCE(assignee_id::text,''), COALESCE(due_date::text,''),
		          estimated_hours, actual_hours,
		          (due_date IS NOT NULL AND due_date < CURRENT_DATE AND status != 'done'),
		          column_position, created_at::text`,
		projectID, req.PhaseId, req.Title, req.Description, assigneeID,
		req.Priority, req.DueDate, req.EstimatedHours, userID,
	).Scan(&t.Id, &t.ProjectId, &t.PhaseId, &t.ParentId, &t.Title, &t.Description,
		&t.Status, &t.Priority, &t.AssigneeId, &t.DueDate,
		&t.EstimatedHours, &t.ActualHours, &t.IsOverdue, &t.ColumnPosition, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}
	t.CreatedBy = userID

	// Người được giao ban đầu trở thành assignee đầu tiên của task.
	if assigneeID != "" {
		_, _ = l.svcCtx.DB.ExecContext(l.ctx,
			`INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)
			 ON CONFLICT (task_id, user_id) DO NOTHING`, t.Id, assigneeID)
	}
	if err = fillAssignees(l.ctx, l.svcCtx.DB, &t); err != nil {
		return nil, err
	}
	// PM/Admin giao việc cho người khác -> báo cho người được giao.
	if assigneeID != "" && assigneeID != userID {
		notify.Dispatch(l.ctx, l.svcCtx.DB, []string{assigneeID}, notify.EventAssigned,
			"Bạn được giao công việc",
			"Bạn được giao công việc \""+t.Title+"\".",
			t.Id, "task")
	}
	return &t, nil
}
