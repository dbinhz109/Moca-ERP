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

type RemoveTaskAssigneeLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewRemoveTaskAssigneeLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RemoveTaskAssigneeLogic {
	return &RemoveTaskAssigneeLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *RemoveTaskAssigneeLogic) RemoveTaskAssignee(taskID, memberID string) (resp *types.CommonResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if !perm.CanEditTaskTeam(l.ctx, l.svcCtx.DB, taskID, actorID) {
		return nil, perm.ErrForbidden
	}

	_, err = l.svcCtx.DB.ExecContext(l.ctx,
		`DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2`, taskID, memberID)
	if err != nil {
		return nil, fmt.Errorf("failed to remove assignee: %w", err)
	}
	// Bớt người có thể khiến "tất cả còn lại đã xong" -> cập nhật lại trạng thái.
	if _, _, err = recomputeStatus(l.ctx, l.svcCtx.DB, taskID); err != nil {
		return nil, err
	}
	return &types.CommonResp{Message: "assignee removed"}, nil
}
