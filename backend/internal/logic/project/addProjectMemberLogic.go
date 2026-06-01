package project

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/perm"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type AddProjectMemberLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewAddProjectMemberLogic(ctx context.Context, svcCtx *svc.ServiceContext) *AddProjectMemberLogic {
	return &AddProjectMemberLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *AddProjectMemberLogic) AddProjectMember(projectID, userID string, bonusAmount float64) (resp *types.CommonResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if err = perm.RequireProjectManager(l.ctx, l.svcCtx.DB, projectID, actorID); err != nil {
		return nil, err
	}
	if bonusAmount < 0 {
		return nil, fmt.Errorf("tiền thưởng không được âm")
	}

	// Chặn nếu tổng tiền thưởng các thành viên (không tính người này) + mức mới vượt quỹ dự án.
	var pool, othersSum float64
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT COALESCE(p.bonus_pool,0),
		       COALESCE((SELECT SUM(bonus_amount) FROM project_members
		                 WHERE project_id=$1 AND user_id<>$2),0)
		FROM projects p WHERE p.id=$1`, projectID, userID,
	).Scan(&pool, &othersSum)
	if err != nil {
		return nil, fmt.Errorf("project not found: %w", err)
	}
	if othersSum+bonusAmount > pool {
		return nil, fmt.Errorf("vượt quỹ thưởng dự án: đã phân bổ %.0f + %.0f > quỹ %.0f",
			othersSum, bonusAmount, pool)
	}

	_, err = l.svcCtx.DB.ExecContext(l.ctx, `
		INSERT INTO project_members (project_id, user_id, role, bonus_amount)
		VALUES ($1, $2, 'member', $3)
		ON CONFLICT (project_id, user_id) DO UPDATE SET bonus_amount = EXCLUDED.bonus_amount`,
		projectID, userID, bonusAmount)
	if err != nil {
		return nil, fmt.Errorf("failed to add member: %w", err)
	}
	return &types.CommonResp{Message: "member added"}, nil
}
