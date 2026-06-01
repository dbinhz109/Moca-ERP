package user

import (
	"context"
	"fmt"
	"strings"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateProfileLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateProfileLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateProfileLogic {
	return &UpdateProfileLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *UpdateProfileLogic) UpdateProfile(req *types.UpdateProfileReq) (resp *types.UserInfo, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(req.FullName) == "" {
		return nil, fmt.Errorf("họ tên không được để trống")
	}
	var u types.UserInfo
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE users SET full_name = $2, phone = $3, updated_at = now()
		WHERE id = $1
		RETURNING id, username, full_name, email, COALESCE(phone,''), system_role, COALESCE(avatar_url,'')`,
		userID, req.FullName, req.Phone).
		Scan(&u.Id, &u.Username, &u.FullName, &u.Email, &u.Phone, &u.Role, &u.Avatar)
	if err != nil {
		return nil, fmt.Errorf("cập nhật hồ sơ thất bại: %w", err)
	}
	return &u, nil
}
