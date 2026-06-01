// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package meeting

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/meeting"
	"github.com/mocatech/erp/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// Chi tiết cuộc họp
func GetMeetingHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var p struct{ Id string `path:"id"` }
		if err := httpx.ParsePath(r, &p); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}
		l := meeting.NewGetMeetingLogic(r.Context(), svcCtx)
		resp, err := l.GetMeeting(p.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
