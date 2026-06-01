package project

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetProjectLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetProjectLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetProjectLogic {
	return &GetProjectLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetProjectLogic) GetProject(id string) (resp *types.ProjectResp, err error) {
	var p types.ProjectResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT p.id, p.code, p.name, p.type, p.status, p.rag_status, p.rag_override,
		       p.progress, p.start_date::text, p.end_date::text, p.pm_id,
		       COALESCE(u.full_name,'') AS pm_name,
		       COALESCE(p.workspace_id::text,'') AS workspace_id,
		       COUNT(DISTINCT pm.user_id) AS member_count,
		       COUNT(DISTINCT t.id) AS task_count,
		       COALESCE(p.bonus_pool,0) AS bonus_pool,
		       COALESCE((SELECT SUM(bonus_amount) FROM project_members WHERE project_id=p.id),0) AS bonus_allocated,
		       p.created_at::text
		FROM projects p
		LEFT JOIN users u ON u.id = p.pm_id
		LEFT JOIN project_members pm ON pm.project_id = p.id
		LEFT JOIN tasks t ON t.project_id = p.id
		WHERE p.id = $1
		GROUP BY p.id, u.full_name`, id,
	).Scan(&p.Id, &p.Code, &p.Name, &p.Type, &p.Status, &p.RagStatus, &p.RagOverride,
		&p.Progress, &p.StartDate, &p.EndDate, &p.PmId, &p.PmName, &p.WorkspaceId,
		&p.MemberCount, &p.TaskCount, &p.BonusPool, &p.BonusAllocated, &p.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("project not found: %w", err)
	}
	return &p, nil
}
