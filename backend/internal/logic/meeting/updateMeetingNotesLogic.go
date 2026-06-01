package meeting

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateMeetingNotesLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateMeetingNotesLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateMeetingNotesLogic {
	return &UpdateMeetingNotesLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *UpdateMeetingNotesLogic) UpdateMeetingNotes(id string, req *types.UpdateMeetingNotesReq) (resp *types.CommonResp, err error) {
	_, err = l.svcCtx.DB.ExecContext(l.ctx,
		`UPDATE meetings SET notes=$1 WHERE id=$2`, req.Notes, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update notes: %w", err)
	}
	return &types.CommonResp{Message: "updated"}, nil
}
