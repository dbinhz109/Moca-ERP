package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type DeleteTaskLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDeleteTaskLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DeleteTaskLogic {
	return &DeleteTaskLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DeleteTaskLogic) DeleteTask(id string) (resp *types.CommonResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if !perm.CanManageProjectByTask(l.ctx, l.svcCtx.DB, id, actorID) &&
		!perm.IsTaskAssignee(l.ctx, l.svcCtx.DB, id, actorID) {
		return nil, perm.ErrForbidden
	}
	res, err := l.svcCtx.DB.ExecContext(l.ctx, `DELETE FROM tasks WHERE id = $1`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete task: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, fmt.Errorf("task not found")
	}
	return &types.CommonResp{Message: "deleted"}, nil
}
