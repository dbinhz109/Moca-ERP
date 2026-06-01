package workspace

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type DeleteWorkspaceLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDeleteWorkspaceLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DeleteWorkspaceLogic {
	return &DeleteWorkspaceLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DeleteWorkspaceLogic) DeleteWorkspace(id string) (resp *types.CommonResp, err error) {
	if err = perm.RequireAdmin(l.ctx); err != nil {
		return nil, err
	}
	res, err := l.svcCtx.DB.ExecContext(l.ctx, `DELETE FROM workspaces WHERE id = $1`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete workspace: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, fmt.Errorf("workspace not found")
	}
	return &types.CommonResp{Message: "deleted"}, nil
}
