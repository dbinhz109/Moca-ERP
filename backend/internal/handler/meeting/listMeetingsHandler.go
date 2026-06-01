// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package meeting

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/meeting"
	"github.com/mocatech/erp/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// Danh sách cuộc họp
func ListMeetingsHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := meeting.NewListMeetingsLogic(r.Context(), svcCtx)
		resp, err := l.ListMeetings()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
