// Code scaffolded by goctl. Safe to edit.

package workspace

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListWorkspacesLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListWorkspacesLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListWorkspacesLogic {
	return &ListWorkspacesLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ListWorkspacesLogic) ListWorkspaces() (resp []types.WorkspaceResp, err error) {
	// Mọi người đều xem được toàn bộ workspace (chỉ đọc).
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT w.id, w.name, w.description, w.color, w.owner_id, w.created_at,
		       COUNT(DISTINCT p.id) AS project_count
		FROM workspaces w
		LEFT JOIN projects p ON p.workspace_id = w.id
		GROUP BY w.id
		ORDER BY w.created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("failed to list workspaces: %w", err)
	}
	defer rows.Close()

	resp = []types.WorkspaceResp{}
	for rows.Next() {
		var ws types.WorkspaceResp
		if err = rows.Scan(&ws.Id, &ws.Name, &ws.Description, &ws.Color,
			&ws.OwnerId, &ws.CreatedAt, &ws.ProjectCount); err != nil {
			return nil, fmt.Errorf("failed to scan workspace: %w", err)
		}
		resp = append(resp, ws)
	}
	return resp, rows.Err()
}
