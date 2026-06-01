package phase

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreatePhaseLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCreatePhaseLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreatePhaseLogic {
	return &CreatePhaseLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreatePhaseLogic) CreatePhase(projectID string, req *types.CreatePhaseReq) (resp *types.PhaseResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if err = perm.RequireProjectManager(l.ctx, l.svcCtx.DB, projectID, actorID); err != nil {
		return nil, err
	}
	var p types.PhaseResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		INSERT INTO phases (project_id, name, weight, start_date, end_date, sort_order)
		VALUES ($1, $2, $3, NULLIF($4,'')::date, NULLIF($5,'')::date, $6)
		RETURNING id, project_id, name, weight, progress,
		          COALESCE(start_date::text,''), COALESCE(end_date::text,''), sort_order`,
		projectID, req.Name, req.Weight, req.StartDate, req.EndDate, req.SortOrder,
	).Scan(&p.Id, &p.ProjectId, &p.Name, &p.Weight, &p.Progress,
		&p.StartDate, &p.EndDate, &p.SortOrder)
	if err != nil {
		return nil, fmt.Errorf("failed to create phase: %w", err)
	}
	return &p, nil
}
