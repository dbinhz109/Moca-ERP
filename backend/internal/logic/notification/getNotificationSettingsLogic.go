package notification

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetNotificationSettingsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetNotificationSettingsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetNotificationSettingsLogic {
	return &GetNotificationSettingsLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *GetNotificationSettingsLogic) GetNotificationSettings() (resp *types.NotificationSettingsResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	var r types.NotificationSettingsResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT telegram_chat_id, zalo_user_id, telegram_on, zalo_on,
		       notify_assigned, notify_review, notify_decision, notify_comment
		FROM user_notification_settings WHERE user_id = $1`, userID).
		Scan(&r.TelegramChatId, &r.ZaloUserId, &r.TelegramOn, &r.ZaloOn,
			&r.NotifyAssigned, &r.NotifyReview, &r.NotifyDecision, &r.NotifyComment)
	if err == sql.ErrNoRows {
		// Chưa cấu hình -> trả mặc định (bật in-app, chưa liên kết kênh ngoài).
		return &types.NotificationSettingsResp{
			TelegramOn: true, ZaloOn: false,
			NotifyAssigned: true, NotifyReview: true,
			NotifyDecision: true, NotifyComment: true,
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("đọc tuỳ chọn thông báo thất bại: %w", err)
	}
	return &r, nil
}
