// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package meeting

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/meeting"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// Tạo lịch họp
func CreateMeetingHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.CreateMeetingReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := meeting.NewCreateMeetingLogic(r.Context(), svcCtx)
		resp, err := l.CreateMeeting(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
