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

type RemoveProjectMemberLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewRemoveProjectMemberLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RemoveProjectMemberLogic {
	return &RemoveProjectMemberLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *RemoveProjectMemberLogic) RemoveProjectMember(projectID, userID string) (resp *types.CommonResp, err error) {
	actorID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	if err = perm.RequireProjectManager(l.ctx, l.svcCtx.DB, projectID, actorID); err != nil {
		return nil, err
	}
	_, err = l.svcCtx.DB.ExecContext(l.ctx,
		`DELETE FROM project_members WHERE project_id=$1 AND user_id=$2`, projectID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to remove member: %w", err)
	}
	return &types.CommonResp{Message: "member removed"}, nil
}
