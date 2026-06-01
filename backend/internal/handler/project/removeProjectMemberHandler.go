package project

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/project"
	"github.com/mocatech/erp/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func RemoveProjectMemberHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var p struct {
			Id     string `path:"id"`
			UserId string `path:"userId"`
		}
		if err := httpx.ParsePath(r, &p); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}
		l := project.NewRemoveProjectMemberLogic(r.Context(), svcCtx)
		resp, err := l.RemoveProjectMember(p.Id, p.UserId)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
