package user

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetMeLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetMeLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetMeLogic {
	return &GetMeLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *GetMeLogic) GetMe() (resp *types.UserInfo, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	var u types.UserInfo
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT id, username, full_name, email, COALESCE(phone,''), system_role, COALESCE(avatar_url,'')
		FROM users WHERE id = $1`, userID).
		Scan(&u.Id, &u.Username, &u.FullName, &u.Email, &u.Phone, &u.Role, &u.Avatar)
	if err != nil {
		return nil, fmt.Errorf("không tìm thấy người dùng: %w", err)
	}
	return &u, nil
}
