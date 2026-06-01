package task

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/task"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func MarkMyProgressHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var p struct {
			Id string `path:"id"`
		}
		if err := httpx.ParsePath(r, &p); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}
		var req types.MyProgressReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}
		l := task.NewMarkMyProgressLogic(r.Context(), svcCtx)
		resp, err := l.MarkMyProgress(p.Id, &req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
