package project

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/project"
	"github.com/mocatech/erp/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func AddProjectMemberHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Id          string  `path:"id"`
			UserId      string  `json:"user_id"`
			BonusAmount float64 `json:"bonus_amount,optional"`
		}
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}
		l := project.NewAddProjectMemberLogic(r.Context(), svcCtx)
		resp, err := l.AddProjectMember(req.Id, req.UserId, req.BonusAmount)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
