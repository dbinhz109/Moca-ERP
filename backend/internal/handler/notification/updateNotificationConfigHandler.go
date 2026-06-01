package notification

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/notification"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// Cập nhật cấu hình kênh thông báo (Admin)
func UpdateNotificationConfigHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UpdateNotificationConfigReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}
		l := notification.NewUpdateNotificationConfigLogic(r.Context(), svcCtx)
		resp, err := l.UpdateNotificationConfig(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
