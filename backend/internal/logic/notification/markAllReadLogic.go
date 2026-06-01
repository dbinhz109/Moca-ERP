package notification

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type MarkAllReadLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMarkAllReadLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MarkAllReadLogic {
	return &MarkAllReadLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *MarkAllReadLogic) MarkAllRead() (resp *types.CommonResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	_, err = l.svcCtx.DB.ExecContext(l.ctx,
		`UPDATE notifications SET is_read=true WHERE user_id=$1 AND is_read=false`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to mark all read: %w", err)
	}
	return &types.CommonResp{Message: "all marked as read"}, nil
}
