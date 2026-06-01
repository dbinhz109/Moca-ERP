package meeting

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateMeetingLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUpdateMeetingLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateMeetingLogic {
	return &UpdateMeetingLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *UpdateMeetingLogic) UpdateMeeting(id string, req *types.CreateMeetingReq) (resp *types.MeetingResp, err error) {
	var m types.MeetingResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		UPDATE meetings SET title=$1, start_time=$2::timestamptz, end_time=$3::timestamptz,
		       location=NULLIF($4,''), meeting_url=NULLIF($5,'')
		WHERE id=$6
		RETURNING id, title, type, status, start_time::text, end_time::text,
		          COALESCE(location,''), COALESCE(meeting_url,''),
		          COALESCE(project_id::text,''), organizer_id, COALESCE(notes,''), created_at::text`,
		req.Title, req.StartTime, req.EndTime, req.Location, req.MeetingUrl, id,
	).Scan(&m.Id, &m.Title, &m.Type, &m.Status, &m.StartTime, &m.EndTime,
		&m.Location, &m.MeetingUrl, &m.ProjectId, &m.OrganizerId, &m.Notes, &m.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update meeting: %w", err)
	}
	return &m, nil
}
