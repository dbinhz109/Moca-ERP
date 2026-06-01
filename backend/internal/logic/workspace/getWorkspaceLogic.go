package workspace

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetWorkspaceLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetWorkspaceLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetWorkspaceLogic {
	return &GetWorkspaceLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetWorkspaceLogic) GetWorkspace(id string) (resp *types.WorkspaceResp, err error) {
	var ws types.WorkspaceResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT w.id, w.name, w.description, w.color, w.owner_id, w.created_at,
		       COUNT(DISTINCT p.id) AS project_count
		FROM workspaces w
		LEFT JOIN projects p ON p.workspace_id = w.id
		WHERE w.id = $1
		GROUP BY w.id`, id,
	).Scan(&ws.Id, &ws.Name, &ws.Description, &ws.Color, &ws.OwnerId, &ws.CreatedAt, &ws.ProjectCount)
	if err != nil {
		return nil, fmt.Errorf("workspace not found: %w", err)
	}
	return &ws, nil
}
