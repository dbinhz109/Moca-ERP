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

type DeletePhaseLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDeletePhaseLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DeletePhaseLogic {
	return &DeletePhaseLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DeletePhaseLogic) DeletePhase(id string) (resp *types.CommonResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if err = perm.RequireProjectManagerByPhase(l.ctx, l.svcCtx.DB, id, actorID); err != nil {
		return nil, err
	}
	res, err := l.svcCtx.DB.ExecContext(l.ctx, `DELETE FROM phases WHERE id = $1`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete phase: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, fmt.Errorf("phase not found")
	}
	return &types.CommonResp{Message: "deleted"}, nil
}
