package project

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateProjectLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateProjectLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateProjectLogic {
	return &UpdateProjectLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateProjectLogic) UpdateProject(id string, req *types.CreateProjectReq) (resp *types.ProjectResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if err = perm.RequireProjectManager(l.ctx, l.svcCtx.DB, id, userID); err != nil {
		return nil, err
	}
	var p types.ProjectResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE projects SET name=$1, description=$2, start_date=$3::date, end_date=$4::date, type=$5, bonus_pool=$6
		WHERE id=$7
		RETURNING id, code, name, type, status, rag_status, rag_override, progress,
		          start_date::text, end_date::text, pm_id, COALESCE(workspace_id::text,''),
		          bonus_pool,
		          COALESCE((SELECT SUM(bonus_amount) FROM project_members WHERE project_id=projects.id),0),
		          created_at::text`,
		req.Name, req.Description, req.StartDate, req.EndDate, req.Type, req.BonusPool, id,
	).Scan(&p.Id, &p.Code, &p.Name, &p.Type, &p.Status, &p.RagStatus, &p.RagOverride,
		&p.Progress, &p.StartDate, &p.EndDate, &p.PmId, &p.WorkspaceId,
		&p.BonusPool, &p.BonusAllocated, &p.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update project: %w", err)
	}
	return &p, nil
}
