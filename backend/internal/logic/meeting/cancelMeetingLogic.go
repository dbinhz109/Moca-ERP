package meeting

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CancelMeetingLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCancelMeetingLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CancelMeetingLogic {
	return &CancelMeetingLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *CancelMeetingLogic) CancelMeeting(id string) (resp *types.CommonResp, err error) {
	res, err := l.svcCtx.DB.ExecContext(l.ctx,
		`UPDATE meetings SET status='cancelled' WHERE id=$1 AND status='scheduled'`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel meeting: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, fmt.Errorf("meeting not found or already cancelled")
	}
	return &types.CommonResp{Message: "cancelled"}, nil
}
