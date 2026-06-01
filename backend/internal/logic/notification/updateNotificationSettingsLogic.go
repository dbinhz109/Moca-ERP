package notification

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateNotificationSettingsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateNotificationSettingsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateNotificationSettingsLogic {
	return &UpdateNotificationSettingsLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *UpdateNotificationSettingsLogic) UpdateNotificationSettings(req *types.UpdateNotificationSettingsReq) (resp *types.NotificationSettingsResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	_, err = l.svcCtx.DB.ExecContext(l.ctx, `
		INSERT INTO user_notification_settings
			(user_id, telegram_chat_id, zalo_user_id, telegram_on, zalo_on,
			 notify_assigned, notify_review, notify_decision, notify_comment, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
		ON CONFLICT (user_id) DO UPDATE SET
			telegram_chat_id = EXCLUDED.telegram_chat_id,
			zalo_user_id     = EXCLUDED.zalo_user_id,
			telegram_on      = EXCLUDED.telegram_on,
			zalo_on          = EXCLUDED.zalo_on,
			notify_assigned  = EXCLUDED.notify_assigned,
			notify_review    = EXCLUDED.notify_review,
			notify_decision  = EXCLUDED.notify_decision,
			notify_comment   = EXCLUDED.notify_comment,
			updated_at       = now()`,
		userID, req.TelegramChatId, req.ZaloUserId, req.TelegramOn, req.ZaloOn,
		req.NotifyAssigned, req.NotifyReview, req.NotifyDecision, req.NotifyComment)
	if err != nil {
		return nil, fmt.Errorf("lưu tuỳ chọn thông báo thất bại: %w", err)
	}
	return NewGetNotificationSettingsLogic(l.ctx, l.svcCtx).GetNotificationSettings()
}
