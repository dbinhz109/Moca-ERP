package meeting

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetMeetingLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewGetMeetingLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetMeetingLogic {
	return &GetMeetingLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *GetMeetingLogic) GetMeeting(id string) (resp *types.MeetingResp, err error) {
	var m types.MeetingResp
	err = l.svcCtx.DB.QueryRowContext(l.ctx, `
		SELECT id, title, type, status, start_time::text, end_time::text,
		       COALESCE(location,''), COALESCE(meeting_url,''),
		       COALESCE(project_id::text,''), organizer_id, COALESCE(notes,''), created_at::text
		FROM meetings WHERE id=$1`, id,
	).Scan(&m.Id, &m.Title, &m.Type, &m.Status, &m.StartTime, &m.EndTime,
		&m.Location, &m.MeetingUrl, &m.ProjectId, &m.OrganizerId, &m.Notes, &m.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("meeting not found: %w", err)
	}
	return &m, nil
}
