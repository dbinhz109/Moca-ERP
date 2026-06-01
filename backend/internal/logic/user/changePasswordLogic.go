package user

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
	"golang.org/x/crypto/bcrypt"
)

type ChangePasswordLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewChangePasswordLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ChangePasswordLogic {
	return &ChangePasswordLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *ChangePasswordLogic) ChangePassword(req *types.ChangePasswordReq) (resp *types.CommonResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	// go-zero không tự chạy tag `validate` -> kiểm tra độ dài thủ công.
	if len(req.NewPassword) < 6 {
		return nil, fmt.Errorf("mật khẩu mới phải có ít nhất 6 ký tự")
	}

	var currentHash string
	err = l.svcCtx.DB.QueryRowContext(l.ctx,
		`SELECT password_hash FROM users WHERE id = $1`, userID).Scan(&currentHash)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("không tìm thấy người dùng")
	}
	if err != nil {
		return nil, fmt.Errorf("đọc thông tin người dùng thất bại: %w", err)
	}

	// Xác minh mật khẩu hiện tại trước khi cho đổi.
	if err = bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.CurrentPassword)); err != nil {
		return nil, fmt.Errorf("mật khẩu hiện tại không đúng")
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("mã hoá mật khẩu thất bại: %w", err)
	}

	if _, err = l.svcCtx.DB.ExecContext(l.ctx,
		`UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1`,
		userID, string(newHash)); err != nil {
		return nil, fmt.Errorf("đổi mật khẩu thất bại: %w", err)
	}
	return &types.CommonResp{Message: "đổi mật khẩu thành công"}, nil
}
