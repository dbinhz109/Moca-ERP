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

type MarkMyProgressLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewMarkMyProgressLogic(ctx context.Context, svcCtx *svc.ServiceContext) *MarkMyProgressLogic {
	return &MarkMyProgressLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

// MarkMyProgress: assignee tự đánh dấu phần của mình đã/chưa xong.
// Khi tất cả assignee đã xong, task tự chuyển sang 'pending_review' (chờ duyệt).
func (l *MarkMyProgressLogic) MarkMyProgress(taskID string, req *types.MyProgressReq) (resp *types.TaskResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if !perm.IsTaskAssignee(l.ctx, l.svcCtx.DB, taskID, actorID) {
		return nil, fmt.Errorf("bạn không nằm trong danh sách thực hiện công việc này")
	}

	res, err := l.svcCtx.DB.ExecContext(l.ctx, `
		UPDATE task_assignees
		SET is_done = $3, done_at = CASE WHEN $3 THEN now() ELSE NULL END
		WHERE task_id = $1 AND user_id = $2`, taskID, actorID, req.Done)
	if err != nil {
		return nil, fmt.Errorf("failed to update progress: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, fmt.Errorf("bạn không nằm trong danh sách thực hiện công việc này")
	}

	newStatus, changed, err := recomputeStatus(l.ctx, l.svcCtx.DB, taskID)
	if err != nil {
		return nil, err
	}
	// Tất cả assignee đã xong -> task tự chuyển "chờ duyệt": báo cho PM/Admin.
	if changed && newStatus == "pending_review" {
		title := taskTitle(l.ctx, l.svcCtx.DB, taskID)
		notify.Dispatch(l.ctx, l.svcCtx.DB,
			notify.ReviewRecipients(l.ctx, l.svcCtx.DB, taskID),
			notify.EventReview,
			"Công việc chờ duyệt",
			"Công việc \""+title+"\" đã hoàn tất và đang chờ bạn duyệt.",
			taskID, "task")
	}

	return NewGetTaskLogic(l.ctx, l.svcCtx).GetTask(taskID)
}
