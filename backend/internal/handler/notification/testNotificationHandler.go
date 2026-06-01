package notification

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/notification"
	"github.com/mocatech/erp/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// Gửi thông báo thử tới các kênh đã liên kết
func TestNotificationHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := notification.NewTestNotificationLogic(r.Context(), svcCtx)
		resp, err := l.TestNotification()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
