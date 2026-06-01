package user

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListUsersLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListUsersLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListUsersLogic {
	return &ListUsersLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ListUsersLogic) ListUsers() (resp []types.UserInfo, err error) {
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT id, username, full_name, email, COALESCE(phone,''), system_role, COALESCE(avatar_url,'')
		FROM users WHERE is_active = true
		ORDER BY full_name`)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	defer rows.Close()

	resp = []types.UserInfo{}
	for rows.Next() {
		var u types.UserInfo
		if err = rows.Scan(&u.Id, &u.Username, &u.FullName, &u.Email, &u.Phone, &u.Role, &u.Avatar); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		resp = append(resp, u)
	}
	return resp, rows.Err()
}
