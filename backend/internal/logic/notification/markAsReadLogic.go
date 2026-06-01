package notification

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type MarkAsReadLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMarkAsReadLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MarkAsReadLogic {
	return &MarkAsReadLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *MarkAsReadLogic) MarkAsRead(id string) (resp *types.CommonResp, err error) {
	_, err = l.svcCtx.DB.ExecContext(l.ctx,
		`UPDATE notifications SET is_read=true WHERE id=$1`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to mark as read: %w", err)
	}
	return &types.CommonResp{Message: "marked as read"}, nil
}
