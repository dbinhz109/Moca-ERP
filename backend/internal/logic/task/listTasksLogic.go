package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListTasksLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListTasksLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListTasksLogic {
	return &ListTasksLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ListTasksLogic) ListTasks(projectID string) (resp []types.TaskResp, err error) {
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT t.id, t.project_id, t.phase_id, COALESCE(t.parent_id::text,''), t.title,
		       COALESCE(t.description,''), t.status, t.priority,
		       COALESCE(t.assignee_id::text,''), COALESCE(u.full_name,''), COALESCE(u.avatar_url,''),
		       COALESCE(t.due_date::text,''), t.estimated_hours, t.actual_hours,
		       (t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status != 'done'),
		       t.column_position, t.created_by::text, t.created_at::text
		FROM tasks t
		LEFT JOIN users u ON u.id = t.assignee_id
		WHERE t.project_id = $1
		ORDER BY t.column_position, t.created_at`, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to list tasks: %w", err)
	}
	defer rows.Close()

	resp = []types.TaskResp{}
	for rows.Next() {
		var t types.TaskResp
		t.Assignees = []types.TaskAssignee{}
		if err = rows.Scan(&t.Id, &t.ProjectId, &t.PhaseId, &t.ParentId, &t.Title,
			&t.Description, &t.Status, &t.Priority, &t.AssigneeId, &t.AssigneeName,
			&t.AssigneeAvatar, &t.DueDate, &t.EstimatedHours, &t.ActualHours,
			&t.IsOverdue, &t.ColumnPosition, &t.CreatedBy, &t.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}
		resp = append(resp, t)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	// Nạp assignee của toàn bộ task trong dự án bằng 1 truy vấn (tránh N+1).
	aRows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT ta.task_id, u.id, u.full_name, COALESCE(u.avatar_url,''), ta.is_done
		FROM task_assignees ta
		JOIN users u ON u.id = ta.user_id
		JOIN tasks t ON t.id = ta.task_id
		WHERE t.project_id = $1
		ORDER BY ta.added_at`, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to load assignees: %w", err)
	}
	defer aRows.Close()

	byTask := map[string][]types.TaskAssignee{}
	doneByTask := map[string]int{}
	for aRows.Next() {
		var taskID string
		var a types.TaskAssignee
		if err = aRows.Scan(&taskID, &a.Id, &a.FullName, &a.Avatar, &a.IsDone); err != nil {
			return nil, fmt.Errorf("failed to scan assignee: %w", err)
		}
		byTask[taskID] = append(byTask[taskID], a)
		if a.IsDone {
			doneByTask[taskID]++
		}
	}
	if err = aRows.Err(); err != nil {
		return nil, err
	}

	for i := range resp {
		if list, ok := byTask[resp[i].Id]; ok {
			resp[i].Assignees = list
			resp[i].AssigneeCount = len(list)
			resp[i].DoneCount = doneByTask[resp[i].Id]
		}
	}
	return resp, nil
}
