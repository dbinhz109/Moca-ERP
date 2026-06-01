package project

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateRagLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateRagLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateRagLogic {
	return &UpdateRagLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateRagLogic) UpdateRag(id string, req *types.UpdateRagReq) (resp *types.ProjectResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if err = perm.RequireProjectManager(l.ctx, l.svcCtx.DB, id, userID); err != nil {
		return nil, err
	}
	var p types.ProjectResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE projects SET rag_status=$1, rag_override=true
		WHERE id=$2
		RETURNING id, code, name, type, status, rag_status, rag_override, progress,
		          start_date::text, end_date::text, pm_id, COALESCE(workspace_id::text,''), created_at::text`,
		req.RagStatus, id,
	).Scan(&p.Id, &p.Code, &p.Name, &p.Type, &p.Status, &p.RagStatus, &p.RagOverride,
		&p.Progress, &p.StartDate, &p.EndDate, &p.PmId, &p.WorkspaceId, &p.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update RAG: %w", err)
	}
	return &p, nil
}
