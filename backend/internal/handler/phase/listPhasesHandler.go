package phase

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/phase"
	"github.com/mocatech/erp/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func ListPhasesHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var p struct{ Id string `path:"id"` }
		if err := httpx.ParsePath(r, &p); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}
		l := phase.NewListPhasesLogic(r.Context(), svcCtx)
		resp, err := l.ListPhases(p.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
