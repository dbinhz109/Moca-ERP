package task

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListCommentsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListCommentsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListCommentsLogic {
	return &ListCommentsLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ListCommentsLogic) ListComments(taskID string) (resp []types.TaskCommentResp, err error) {
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT c.id, c.task_id, c.author_id, u.username, u.full_name, u.email, u.system_role, COALESCE(u.avatar_url,''),
		       c.content, c.created_at::text
		FROM task_comments c
		JOIN users u ON u.id = c.author_id
		WHERE c.task_id = $1
		ORDER BY c.created_at`, taskID)
	if err != nil {
		return nil, fmt.Errorf("failed to list comments: %w", err)
	}
	defer rows.Close()

	resp = []types.TaskCommentResp{}
	for rows.Next() {
		var c types.TaskCommentResp
		if err = rows.Scan(&c.Id, &c.TaskId, &c.AuthorId,
			&c.Author.Username, &c.Author.FullName, &c.Author.Email, &c.Author.Role, &c.Author.Avatar,
			&c.Content, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan comment: %w", err)
		}
		c.Author.Id = c.AuthorId
		resp = append(resp, c)
	}
	return resp, rows.Err()
}
