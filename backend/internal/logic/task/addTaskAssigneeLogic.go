package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/notify"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddTaskAssigneeLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddTaskAssigneeLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddTaskAssigneeLogic {
	return &AddTaskAssigneeLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *AddTaskAssigneeLogic) AddTaskAssignee(taskID string, req *types.AddTaskAssigneeReq) (resp *types.CommonResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	// Người tạo task hoặc PM/Admin mới được thêm người.
	if !perm.CanEditTaskTeam(l.ctx, l.svcCtx.DB, taskID, actorID) {
		return nil, perm.ErrForbidden
	}

	_, err = l.svcCtx.DB.ExecContext(l.ctx,
		`INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2)
		 ON CONFLICT (task_id, user_id) DO NOTHING`, taskID, req.UserId)
	if err != nil {
		return nil, fmt.Errorf("failed to add assignee: %w", err)
	}
	// Thêm người mới (chưa xong) -> task không còn "tất cả xong" -> cập nhật lại trạng thái.
	if _, _, err = recomputeStatus(l.ctx, l.svcCtx.DB, taskID); err != nil {
		return nil, err
	}
	// Báo cho người vừa được giao (trừ khi tự thêm chính mình).
	if req.UserId != actorID {
		title := taskTitle(l.ctx, l.svcCtx.DB, taskID)
		notify.Dispatch(l.ctx, l.svcCtx.DB, []string{req.UserId}, notify.EventAssigned,
			"Bạn được giao công việc",
			"Bạn vừa được thêm vào công việc \""+title+"\".",
			taskID, "task")
	}
	return &types.CommonResp{Message: "assignee added"}, nil
}
