// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package project

import (
	"net/http"

	"github.com/mocatech/erp/internal/logic/project"
	"github.com/mocatech/erp/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// Danh sách dự án
func ListProjectsHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := project.NewListProjectsLogic(r.Context(), svcCtx)
		resp, err := l.ListProjects()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
