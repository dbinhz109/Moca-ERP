package notification

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/notification"
	"github.com/mocatech/erp/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// Lấy tuỳ chọn nhận thông báo của chính người dùng
func GetNotificationSettingsHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := notification.NewGetNotificationSettingsLogic(r.Context(), svcCtx)
		resp, err := l.GetNotificationSettings()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
