package phase

import (
	"context"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ReorderPhasesLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewReorderPhasesLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ReorderPhasesLogic {
	return &ReorderPhasesLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ReorderPhasesLogic) ReorderPhases(_ string) (resp *types.CommonResp, err error) {
	// Reorder logic is handled client-side via sort_order field updates on each phase
	return &types.CommonResp{Message: "ok"}, nil
}
