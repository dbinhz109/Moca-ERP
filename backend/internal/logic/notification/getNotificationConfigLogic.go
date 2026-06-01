package notification

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetNotificationConfigLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetNotificationConfigLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetNotificationConfigLogic {
	return &GetNotificationConfigLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *GetNotificationConfigLogic) GetNotificationConfig() (resp *types.NotificationConfigResp, err error) {
	if err = perm.RequireAdmin(l.ctx); err != nil {
		return nil, err
	}
	var r types.NotificationConfigResp
	var tgToken, zaloToken string
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT telegram_enabled, telegram_bot_token, zalo_enabled, zalo_oa_token
		FROM notification_config WHERE id = 1`).
		Scan(&r.TelegramEnabled, &tgToken, &r.ZaloEnabled, &zaloToken)
	if err != nil {
		return nil, fmt.Errorf("đọc cấu hình thông báo thất bại: %w", err)
	}
	r.TelegramTokenSet = tgToken != ""
	r.ZaloTokenSet = zaloToken != ""
	return &r, nil
}
