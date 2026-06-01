package notification

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateNotificationConfigLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateNotificationConfigLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateNotificationConfigLogic {
	return &UpdateNotificationConfigLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *UpdateNotificationConfigLogic) UpdateNotificationConfig(req *types.UpdateNotificationConfigReq) (resp *types.NotificationConfigResp, err error) {
	if err = perm.RequireAdmin(l.ctx); err != nil {
		return nil, err
	}
	// Token để trống = giữ token cũ (không bắt Admin nhập lại mỗi lần lưu).
	_, err = l.svcCtx.DB.ExecContext(l.ctx, `
		UPDATE notification_config SET
			telegram_enabled   = $1,
			telegram_bot_token = CASE WHEN $2 = '' THEN telegram_bot_token ELSE $2 END,
			zalo_enabled       = $3,
			zalo_oa_token      = CASE WHEN $4 = '' THEN zalo_oa_token ELSE $4 END,
			updated_at         = now()
		WHERE id = 1`,
		req.TelegramEnabled, req.TelegramBotToken, req.ZaloEnabled, req.ZaloOaToken)
	if err != nil {
		return nil, fmt.Errorf("cập nhật cấu hình thông báo thất bại: %w", err)
	}
	return NewGetNotificationConfigLogic(l.ctx, l.svcCtx).GetNotificationConfig()
}
