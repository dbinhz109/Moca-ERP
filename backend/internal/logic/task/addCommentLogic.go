package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/notify"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddCommentLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddCommentLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddCommentLogic {
	return &AddCommentLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddCommentLogic) AddComment(taskID string, req *types.TaskCommentReq) (resp *types.TaskCommentResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	var c types.TaskCommentResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		INSERT INTO task_comments (task_id, author_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, task_id, author_id, content, created_at::text`,
		taskID, userID, req.Content,
	).Scan(&c.Id, &c.TaskId, &c.AuthorId, &c.Content, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to add comment: %w", err)
	}

	c.Author = types.UserInfo{Id: userID}
	_ = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT username, full_name, email, system_role, COALESCE(avatar_url,'')
		FROM users WHERE id = $1`, userID,
	).Scan(&c.Author.Username, &c.Author.FullName, &c.Author.Email, &c.Author.Role, &c.Author.Avatar)

	// Báo cho những người thực hiện khác trong task (trừ người vừa bình luận).
	title := taskTitle(l.ctx, l.svcCtx.DB, taskID)
	notify.Dispatch(l.ctx, l.svcCtx.DB,
		notify.CommentRecipients(l.ctx, l.svcCtx.DB, taskID, userID),
		notify.EventComment,
		"Bình luận mới",
		c.Author.FullName+" đã bình luận trong \""+title+"\": "+c.Content,
		taskID, "task")

	return &c, nil
}
