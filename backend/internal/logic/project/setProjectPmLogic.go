package project

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type SetProjectPmLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSetProjectPmLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SetProjectPmLogic {
	return &SetProjectPmLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

// SetProjectPm chỉ định PM mới cho dự án: hạ PM cũ xuống thành viên, nâng người
// được chọn lên 'pm', và cập nhật projects.pm_id. Chỉ Admin hoặc PM hiện tại được làm.
func (l *SetProjectPmLogic) SetProjectPm(projectID string, req *types.SetProjectPmReq) (resp *types.CommonResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if err = perm.RequireProjectManager(l.ctx, l.svcCtx.DB, projectID, actorID); err != nil {
		return nil, err
	}

	// Người được chọn phải tồn tại và đang hoạt động.
	var exists bool
	if err = l.svcCtx.DB.QueryRowContext(l.ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE id=$1::uuid AND is_active=true)`, req.UserId).
		Scan(&exists); err != nil {
		return nil, fmt.Errorf("không kiểm tra được người dùng: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("người dùng không tồn tại hoặc đã bị khoá")
	}

	tx, err := l.svcCtx.DB.BeginTx(l.ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("không mở được giao dịch: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Hạ PM hiện tại xuống thành viên.
	if _, err = tx.ExecContext(l.ctx,
		`UPDATE project_members SET role='member' WHERE project_id=$1 AND role='pm'`, projectID); err != nil {
		return nil, fmt.Errorf("không hạ PM cũ: %w", err)
	}
	// Đảm bảo người được chọn là thành viên dự án và đặt vai trò 'pm'.
	if _, err = tx.ExecContext(l.ctx,
		`INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2::uuid, 'pm')
		 ON CONFLICT (project_id, user_id) DO UPDATE SET role='pm'`, projectID, req.UserId); err != nil {
		return nil, fmt.Errorf("không đặt PM mới: %w", err)
	}
	// Cập nhật pm_id của dự án.
	res, err := tx.ExecContext(l.ctx,
		`UPDATE projects SET pm_id=$2::uuid WHERE id=$1`, projectID, req.UserId)
	if err != nil {
		return nil, fmt.Errorf("không cập nhật dự án: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return nil, sql.ErrNoRows
	}

	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("không lưu thay đổi: %w", err)
	}
	return &types.CommonResp{Message: "đã đổi PM dự án"}, nil
}
