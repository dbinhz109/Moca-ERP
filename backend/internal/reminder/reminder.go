// Package reminder chạy nền để gửi thông báo nhắc họp trước giờ bắt đầu.
package reminder

import (
	"context"
	"database/sql"
	"time"

	"github.com/mocatech/erp/internal/notify"

	"github.com/zeromicro/go-zero/core/logx"
)

// Start khởi chạy vòng lặp nền quét lịch họp sắp diễn ra (mỗi phút một lần).
// Gọi trong main, trước server.Start().
func Start(db *sql.DB) {
	go func() {
		ticker := time.NewTicker(time.Minute)
		defer ticker.Stop()
		runOnce(db) // chạy ngay khi khởi động
		for range ticker.C {
			runOnce(db)
		}
	}()
}

func runOnce(db *sql.DB) {
	defer func() {
		if r := recover(); r != nil {
			logx.Errorf("reminder: panic: %v", r)
		}
	}()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Lịch họp 'scheduled', chưa nhắc, sẽ bắt đầu trong vòng leadTime kể từ bây giờ.
	rows, err := db.QueryContext(ctx, `
		SELECT id, title, start_time::text, COALESCE(meeting_url,'')
		FROM meetings
		WHERE status = 'scheduled'
		  AND reminder_sent = FALSE
		  AND start_time > now()
		  AND start_time <= now() + $1::interval`,
		leadTimeInterval())
	if err != nil {
		logx.Errorf("reminder: query lịch họp thất bại: %v", err)
		return
	}
	type mtg struct{ id, title, start, url string }
	var due []mtg
	for rows.Next() {
		var m mtg
		if err := rows.Scan(&m.id, &m.title, &m.start, &m.url); err == nil {
			due = append(due, m)
		}
	}
	rows.Close()

	for _, m := range due {
		recipients := meetingRecipients(ctx, db, m.id)
		if len(recipients) > 0 {
			body := "Cuộc họp sắp bắt đầu (" + m.start + ")"
			if m.url != "" {
				body += "\nLink online: " + m.url
			}
			notify.Dispatch(ctx, db, recipients, notify.EventMeeting,
				"Sắp tới giờ họp: "+m.title, body, m.id, "meeting")
		}
		if _, err := db.ExecContext(ctx,
			`UPDATE meetings SET reminder_sent = TRUE WHERE id = $1`, m.id); err != nil {
			logx.Errorf("reminder: đánh dấu đã nhắc thất bại (meeting=%s): %v", m.id, err)
		}
	}
}

// meetingRecipients: người tổ chức + tất cả người tham dự.
func meetingRecipients(ctx context.Context, db *sql.DB, meetingID string) []string {
	rows, err := db.QueryContext(ctx, `
		SELECT organizer_id::text FROM meetings WHERE id = $1
		UNION
		SELECT user_id::text FROM meeting_attendees WHERE meeting_id = $1`, meetingID)
	if err != nil {
		logx.Errorf("reminder: lấy người nhận thất bại: %v", err)
		return nil
	}
	defer rows.Close()
	out := []string{}
	for rows.Next() {
		var id string
		if rows.Scan(&id) == nil {
			out = append(out, id)
		}
	}
	return out
}

func leadTimeInterval() string {
	// "5 minutes"
	return "5 minutes"
}
