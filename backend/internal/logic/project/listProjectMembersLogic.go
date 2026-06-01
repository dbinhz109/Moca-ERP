package project

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListProjectMembersLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListProjectMembersLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListProjectMembersLogic {
	return &ListProjectMembersLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ListProjectMembersLogic) ListProjectMembers(projectID string) (resp []types.ProjectMemberResp, err error) {
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT u.id, u.username, u.full_name, u.email, u.system_role, COALESCE(u.avatar_url,''),
		       pm.role, pm.bonus_amount
		FROM project_members pm
		JOIN users u ON u.id = pm.user_id
		WHERE pm.project_id = $1
		ORDER BY pm.bonus_amount DESC, u.full_name`, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to list members: %w", err)
	}
	defer rows.Close()

	resp = []types.ProjectMemberResp{}
	for rows.Next() {
		var m types.ProjectMemberResp
		if err = rows.Scan(&m.Id, &m.Username, &m.FullName, &m.Email, &m.Role, &m.Avatar,
			&m.ProjectRole, &m.BonusAmount); err != nil {
			return nil, fmt.Errorf("failed to scan member: %w", err)
		}
		resp = append(resp, m)
	}
	return resp, rows.Err()
}
