package meeting

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type ListMeetingsLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewListMeetingsLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ListMeetingsLogic {
	return &ListMeetingsLogic{Logger: logx.WithContext(ctx), ctx: ctx, svcCtx: svcCtx}
}

func (l *ListMeetingsLogic) ListMeetings() (resp *types.MeetingListResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT m.id, m.title, m.type, m.status, m.start_time::text, m.end_time::text,
		       COALESCE(m.location,''), COALESCE(m.meeting_url,''),
		       COALESCE(m.project_id::text,''), m.organizer_id, COALESCE(m.notes,''), m.created_at::text
		FROM meetings m
		JOIN meeting_attendees ma ON ma.meeting_id = m.id AND ma.user_id = $1
		ORDER BY m.start_time DESC`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list meetings: %w", err)
	}
	defer rows.Close()

	meetings := []types.MeetingResp{}
	for rows.Next() {
		var m types.MeetingResp
		m.Attendees = []types.UserInfo{}
		if err = rows.Scan(&m.Id, &m.Title, &m.Type, &m.Status, &m.StartTime, &m.EndTime,
			&m.Location, &m.MeetingUrl, &m.ProjectId, &m.OrganizerId, &m.Notes, &m.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan meeting: %w", err)
		}
		meetings = append(meetings, m)
	}
	return &types.MeetingListResp{Total: int64(len(meetings)), Meetings: meetings}, rows.Err()
}
