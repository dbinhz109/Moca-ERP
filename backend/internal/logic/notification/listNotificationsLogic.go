package notification

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListNotificationsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListNotificationsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListNotificationsLogic {
	return &ListNotificationsLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *ListNotificationsLogic) ListNotifications() (resp []types.NotificationResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT id, type, title, body, is_read,
		       COALESCE(ref_id::text,''), COALESCE(ref_type,''), created_at::text
		FROM notifications WHERE user_id=$1
		ORDER BY created_at DESC LIMIT 50`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list notifications: %w", err)
	}
	defer rows.Close()
	resp = []types.NotificationResp{}
	for rows.Next() {
		var n types.NotificationResp
		if err = rows.Scan(&n.Id, &n.Type, &n.Title, &n.Body, &n.IsRead,
			&n.RefId, &n.RefType, &n.CreatedAt); err != nil {
			return nil, err
		}
		resp = append(resp, n)
	}
	return resp, rows.Err()
}
