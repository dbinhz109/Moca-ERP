package workspace

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreateWorkspaceLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCreateWorkspaceLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreateWorkspaceLogic {
	return &CreateWorkspaceLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreateWorkspaceLogic) CreateWorkspace(req *types.CreateWorkspaceReq) (resp *types.WorkspaceResp, err error) {
	if err = perm.RequireAdmin(l.ctx); err != nil {
		return nil, err
	}
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}

	tx, err := l.svcCtx.DB.BeginTx(l.ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	var ws types.WorkspaceResp
	err = tx.QueryRowContext(l.ctx, `
		INSERT INTO workspaces (name, description, color, owner_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, description, color, owner_id, created_at`,
		req.Name, req.Description, req.Color, userID,
	).Scan(&ws.Id, &ws.Name, &ws.Description, &ws.Color, &ws.OwnerId, &ws.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create workspace: %w", err)
	}

	_, err = tx.ExecContext(l.ctx, `
		INSERT INTO workspace_members (workspace_id, user_id, role)
		VALUES ($1, $2, 'owner')`, ws.Id, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to add owner member: %w", err)
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit: %w", err)
	}
	return &ws, nil
}
