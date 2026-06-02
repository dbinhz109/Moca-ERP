package meeting

import (
	"context"
	"fmt"

	"github.com/mocatech/erp/internal/ctxutil"
	"github.com/mocatech/erp/internal/notify"
	"github.com/mocatech/erp/internal/svc"
	"github.com/mocatech/erp/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreateMeetingLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewCreateMeetingLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreateMeetingLogic {
	return &CreateMeetingLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreateMeetingLogic) CreateMeeting(req *types.CreateMeetingReq) (resp *types.MeetingResp, err error) {
	userID, err := ctxutil.UserIDFromCtx(l.ctx)
	if err != nil {
		return nil, err
	}

	tx, err := l.svcCtx.DB.BeginTx(l.ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	var m types.MeetingResp
	err = tx.QueryRowContext(l.ctx, `
		INSERT INTO meetings (title, type, organizer_id, start_time, end_time, location, meeting_url, project_id)
		VALUES ($1,$2,$3,$4::timestamptz,
		        COALESCE(NULLIF($5,'')::timestamptz, $4::timestamptz + interval '1 hour'),
		        NULLIF($6,''),NULLIF($7,''),NULLIF($8,'')::uuid)
		RETURNING id, title, type, status, start_time::text, end_time::text,
		          COALESCE(location,''), COALESCE(meeting_url,''),
		          COALESCE(project_id::text,''), organizer_id, created_at::text`,
		req.Title, req.Type, userID, req.StartTime, req.EndTime,
		req.Location, req.MeetingUrl, req.ProjectId,
	).Scan(&m.Id, &m.Title, &m.Type, &m.Status, &m.StartTime, &m.EndTime,
		&m.Location, &m.MeetingUrl, &m.ProjectId, &m.OrganizerId, &m.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create meeting: %w", err)
	}

	for _, aID := range req.AttendeeIds {
		if _, err = tx.ExecContext(l.ctx,
			`INSERT INTO meeting_attendees (meeting_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
			m.Id, aID); err != nil {
			return nil, fmt.Errorf("failed to add attendee: %w", err)
		}
	}
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit: %w", err)
	}

	m.Attendees = []types.UserInfo{}
	rows, err := l.svcCtx.DB.QueryContext(l.ctx, `
		SELECT u.id, u.username, u.full_name, u.email, u.system_role, COALESCE(u.avatar_url,'')
		FROM meeting_attendees ma
		JOIN users u ON u.id = ma.user_id
		WHERE ma.meeting_id = $1`, m.Id)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var u types.UserInfo
			if scanErr := rows.Scan(&u.Id, &u.Username, &u.FullName, &u.Email, &u.Role, &u.Avatar); scanErr == nil {
				m.Attendees = append(m.Attendees, u)
			}
		}
	}

	// Gửi thông báo mời họp cho người tham dự (trừ người tổ chức), kèm link online.
	body := "Bắt đầu: " + m.StartTime
	if m.MeetingUrl != "" {
		body += "\nLink online: " + m.MeetingUrl
	}
	recipients := make([]string, 0, len(req.AttendeeIds))
	for _, aID := range req.AttendeeIds {
		if aID != "" && aID != userID {
			recipients = append(recipients, aID)
		}
	}
	if len(recipients) > 0 {
		notify.Dispatch(l.ctx, l.svcCtx.DB, recipients, notify.EventMeeting,
			"Lịch họp mới: "+m.Title, body, m.Id, "meeting")
	}

	return &m, nil
}
