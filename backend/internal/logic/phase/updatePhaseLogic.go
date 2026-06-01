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

type UpdatePhaseLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdatePhaseLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdatePhaseLogic {
	return &UpdatePhaseLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdatePhaseLogic) UpdatePhase(id string, req *types.CreatePhaseReq) (resp *types.PhaseResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if err = perm.RequireProjectManagerByPhase(l.ctx, l.svcCtx.DB, id, actorID); err != nil {
		return nil, err
	}
	var p types.PhaseResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE phases SET name=$1, weight=$2, start_date=NULLIF($3,'')::date, end_date=NULLIF($4,'')::date
		WHERE id=$5
		RETURNING id, project_id, name, weight, progress,
		          COALESCE(start_date::text,''), COALESCE(end_date::text,''), sort_order`,
		req.Name, req.Weight, req.StartDate, req.EndDate, id,
	).Scan(&p.Id, &p.ProjectId, &p.Name, &p.Weight, &p.Progress,
		&p.StartDate, &p.EndDate, &p.SortOrder)
	if err != nil {
		return nil, fmt.Errorf("failed to update phase: %w", err)
	}
	return &p, nil
}
