package notification

import (
	"context"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/notify"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type TestNotificationLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewTestNotificationLogic(ctx context.Context, svcCtx *svc.ServiceContext) *TestNotificationLogic {
	return &TestNotificationLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

// TestNotification gửi tin nhắn thử tới các kênh đã liên kết của người dùng.
func (l *TestNotificationLogic) TestNotification() (resp *types.CommonResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	msg, err := notify.SendTest(l.ctx, l.svcCtx.DB, userID)
	if err != nil {
		return nil, err
	}
	return &types.CommonResp{Message: msg}, nil
}
