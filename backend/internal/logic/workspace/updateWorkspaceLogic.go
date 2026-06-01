package workspace

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateWorkspaceLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateWorkspaceLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateWorkspaceLogic {
	return &UpdateWorkspaceLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateWorkspaceLogic) UpdateWorkspace(id string, req *types.CreateWorkspaceReq) (resp *types.WorkspaceResp, err error) {
	if err = perm.RequireAdmin(l.ctx); err != nil {
		return nil, err
	}
	var ws types.WorkspaceResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE workspaces SET name=$1, description=$2, color=$3
		WHERE id=$4
		RETURNING id, name, description, color, owner_id, created_at`,
		req.Name, req.Description, req.Color, id,
	).Scan(&ws.Id, &ws.Name, &ws.Description, &ws.Color, &ws.OwnerId, &ws.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update workspace: %w", err)
	}
	ws.ProjectCount = 0
	return &ws, nil
}
