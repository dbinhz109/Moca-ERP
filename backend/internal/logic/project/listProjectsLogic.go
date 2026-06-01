package project

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListProjectsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListProjectsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListProjectsLogic {
	return &ListProjectsLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ListProjectsLogic) ListProjects() (resp *types.ProjectListResp, err error) {
	// Mọi người đều xem được toàn bộ dự án (chỉ đọc).
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT p.id, p.code, p.name, p.type, p.status, p.rag_status, p.rag_override,
		       p.progress, p.start_date::text, p.end_date::text, p.pm_id,
		       COALESCE(u.full_name,'') AS pm_name,
		       COALESCE(p.workspace_id::text,'') AS workspace_id,
		       COUNT(DISTINCT pm2.user_id) AS member_count,
		       COUNT(DISTINCT t.id) AS task_count,
		       COALESCE(p.bonus_pool,0) AS bonus_pool,
		       COALESCE((SELECT SUM(bonus_amount) FROM project_members WHERE project_id=p.id),0) AS bonus_allocated,
		       p.created_at::text
		FROM projects p
		LEFT JOIN users u ON u.id = p.pm_id
		LEFT JOIN project_members pm2 ON pm2.project_id = p.id
		LEFT JOIN tasks t ON t.project_id = p.id
		WHERE p.is_deleted = false
		GROUP BY p.id, u.full_name
		ORDER BY p.created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to list projects: %w", err)
	}
	defer rows.Close()

	var projects []types.ProjectResp
	for rows.Next() {
		var p types.ProjectResp
		if err = rows.Scan(&p.Id, &p.Code, &p.Name, &p.Type, &p.Status, &p.RagStatus,
			&p.RagOverride, &p.Progress, &p.StartDate, &p.EndDate, &p.PmId, &p.PmName,
			&p.WorkspaceId, &p.MemberCount, &p.TaskCount, &p.BonusPool, &p.BonusAllocated,
			&p.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}
		projects = append(projects, p)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &types.ProjectListResp{Total: int64(len(projects)), Projects: projects}, nil
}
