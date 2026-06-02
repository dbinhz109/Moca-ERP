// Package notify gửi thông báo trong ứng dụng và đẩy ra kênh ngoài (Telegram / Zalo).
//
// Luồng: Dispatch ghi bản ghi vào bảng notifications (đồng bộ, nhanh) rồi đẩy
// ra các kênh ngoài trong goroutine nền để không chặn request. Lỗi kênh ngoài
// chỉ ghi log, không làm hỏng nghiệp vụ chính.
package notify

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/zeromicro/go-zero/core/logx"
)

// Loại sự kiện — khớp với cờ bật/tắt trong user_notification_settings.
const (
	EventAssigned = "assigned" // được giao việc
	EventReview   = "review"   // có việc cần duyệt
	EventDecision = "decision" // việc được duyệt / bị từ chối
	EventComment  = "comment"  // có bình luận mới
	EventMeeting  = "meeting"  // được mời họp (luôn gửi, không gate theo toggle)
)

// settingsColumn ánh xạ loại sự kiện -> cột cờ bật/tắt của người dùng.
var settingsColumn = map[string]string{
	EventAssigned: "notify_assigned",
	EventReview:   "notify_review",
	EventDecision: "notify_decision",
	EventComment:  "notify_comment",
}

var httpClient = &http.Client{Timeout: 10 * time.Second}

// Dispatch tạo thông báo in-app cho từng người nhận rồi đẩy ra kênh ngoài.
// db: kết nối dùng chung; recipients: danh sách user id; event: một trong các hằng Event*.
func Dispatch(ctx context.Context, db *sql.DB, recipients []string, event, title, body, refID, refType string) {
	seen := map[string]bool{}
	for _, uid := range recipients {
		if uid == "" || seen[uid] {
			continue
		}
		seen[uid] = true

		// Bản ghi in-app (đồng bộ).
		var refArg interface{}
		if refID != "" {
			refArg = refID
		}
		if _, err := db.ExecContext(ctx, `
			INSERT INTO notifications (user_id, type, title, body, ref_id, ref_type)
			VALUES ($1, $2, $3, $4, $5, NULLIF($6,''))`,
			uid, event, title, body, refArg, refType); err != nil {
			logx.Errorf("notify: lưu thông báo in-app thất bại (user=%s): %v", uid, err)
		}

		// Đẩy ra kênh ngoài ở nền — tách context để không bị huỷ khi request kết thúc.
		go pushExternal(uid, event, title, body, db)
	}
}

// pushExternal gửi Telegram / Zalo dựa trên cấu hình hệ thống và tuỳ chọn của người dùng.
func pushExternal(userID, event, title, body string, db *sql.DB) {
	bg, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	defer func() {
		if r := recover(); r != nil {
			logx.Errorf("notify: pushExternal panic (user=%s): %v", userID, r)
		}
	}()

	// Sự kiện có cột bật/tắt riêng (assigned/review/...) thì tôn trọng cờ đó;
	// sự kiện không có cột (vd lịch họp) luôn được gửi nếu kênh đã bật & liên kết.
	col, hasCol := settingsColumn[event]

	// Cấu hình hệ thống.
	var tgEnabled, zaloEnabled bool
	var tgToken, zaloToken string
	if err := db.QueryRowContext(bg, `
		SELECT telegram_enabled, telegram_bot_token, zalo_enabled, zalo_oa_token
		FROM notification_config WHERE id = 1`).
		Scan(&tgEnabled, &tgToken, &zaloEnabled, &zaloToken); err != nil {
		logx.Errorf("notify: đọc cấu hình hệ thống thất bại: %v", err)
		return
	}
	if !tgEnabled && !zaloEnabled {
		return
	}

	// Tuỳ chọn của người dùng.
	var chatID, zaloUID string
	var tgOn, zaloOn bool
	wantEvent := true
	var scanErr error
	if hasCol {
		q := fmt.Sprintf(`
			SELECT telegram_chat_id, zalo_user_id, telegram_on, zalo_on, %s
			FROM user_notification_settings WHERE user_id = $1`, col)
		scanErr = db.QueryRowContext(bg, q, userID).
			Scan(&chatID, &zaloUID, &tgOn, &zaloOn, &wantEvent)
	} else {
		scanErr = db.QueryRowContext(bg, `
			SELECT telegram_chat_id, zalo_user_id, telegram_on, zalo_on
			FROM user_notification_settings WHERE user_id = $1`, userID).
			Scan(&chatID, &zaloUID, &tgOn, &zaloOn)
	}
	switch scanErr {
	case nil:
		// ok
	case sql.ErrNoRows:
		// Chưa cấu hình -> chưa liên kết kênh nào, bỏ qua.
		return
	default:
		logx.Errorf("notify: đọc tuỳ chọn người dùng thất bại (user=%s): %v", userID, scanErr)
		return
	}
	if !wantEvent {
		return
	}

	text := title
	if body != "" {
		text = title + "\n" + body
	}

	if tgEnabled && tgOn && chatID != "" && tgToken != "" {
		if err := sendTelegram(bg, tgToken, chatID, title, body); err != nil {
			logx.Errorf("notify: gửi Telegram thất bại (user=%s): %v", userID, err)
		}
	}
	if zaloEnabled && zaloOn && zaloUID != "" && zaloToken != "" {
		if err := sendZalo(bg, zaloToken, zaloUID, text); err != nil {
			logx.Errorf("notify: gửi Zalo thất bại (user=%s): %v", userID, err)
		}
	}
}

// sendTelegram gọi Bot API sendMessage (parse_mode HTML).
func sendTelegram(ctx context.Context, botToken, chatID, title, body string) error {
	text := "<b>" + htmlEscape(title) + "</b>"
	if body != "" {
		text += "\n" + htmlEscape(body)
	}
	payload := map[string]interface{}{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "HTML",
	}
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)
	return postJSON(ctx, url, nil, payload)
}

// sendZalo gọi Zalo OA API gửi tin tư vấn (message/cs).
func sendZalo(ctx context.Context, accessToken, zaloUserID, text string) error {
	payload := map[string]interface{}{
		"recipient": map[string]string{"user_id": zaloUserID},
		"message":   map[string]string{"text": text},
	}
	headers := map[string]string{"access_token": accessToken}
	return postJSON(ctx, "https://openapi.zalo.me/v3.0/oa/message/cs", headers, payload)
}

// postJSON gửi POST JSON và coi HTTP >=300 là lỗi.
func postJSON(ctx context.Context, url string, headers map[string]string, payload interface{}) error {
	buf, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		respBody := new(bytes.Buffer)
		_, _ = respBody.ReadFrom(resp.Body)
		return fmt.Errorf("http %d: %s", resp.StatusCode, respBody.String())
	}
	return nil
}

func htmlEscape(s string) string {
	r := make([]byte, 0, len(s))
	for i := 0; i < len(s); i++ {
		switch s[i] {
		case '<':
			r = append(r, "&lt;"...)
		case '>':
			r = append(r, "&gt;"...)
		case '&':
			r = append(r, "&amp;"...)
		default:
			r = append(r, s[i])
		}
	}
	return string(r)
}

// SendTest gửi tin nhắn thử tới các kênh đã liên kết của người dùng (bỏ qua
// cờ theo loại sự kiện). Trả về thông điệp mô tả kết quả từng kênh.
func SendTest(ctx context.Context, db *sql.DB, userID string) (string, error) {
	var tgEnabled, zaloEnabled bool
	var tgToken, zaloToken string
	if err := db.QueryRowContext(ctx, `
		SELECT telegram_enabled, telegram_bot_token, zalo_enabled, zalo_oa_token
		FROM notification_config WHERE id = 1`).
		Scan(&tgEnabled, &tgToken, &zaloEnabled, &zaloToken); err != nil {
		return "", fmt.Errorf("đọc cấu hình hệ thống thất bại: %w", err)
	}

	var chatID, zaloUID string
	var tgOn, zaloOn bool
	switch err := db.QueryRowContext(ctx, `
		SELECT telegram_chat_id, zalo_user_id, telegram_on, zalo_on
		FROM user_notification_settings WHERE user_id = $1`, userID).
		Scan(&chatID, &zaloUID, &tgOn, &zaloOn); err {
	case nil, sql.ErrNoRows:
	default:
		return "", fmt.Errorf("đọc tuỳ chọn thất bại: %w", err)
	}

	title := "MOCA ERP — Thông báo thử"
	body := "Nếu bạn nhận được tin này, kênh đã được liên kết thành công."
	var results []string
	attempted := false

	if tgEnabled && tgOn && chatID != "" && tgToken != "" {
		attempted = true
		if err := sendTelegram(ctx, tgToken, chatID, title, body); err != nil {
			results = append(results, "Telegram ✗ ("+err.Error()+")")
		} else {
			results = append(results, "Telegram ✓")
		}
	}
	if zaloEnabled && zaloOn && zaloUID != "" && zaloToken != "" {
		attempted = true
		if err := sendZalo(ctx, zaloToken, zaloUID, title+"\n"+body); err != nil {
			results = append(results, "Zalo ✗ ("+err.Error()+")")
		} else {
			results = append(results, "Zalo ✓")
		}
	}

	if !attempted {
		return "", fmt.Errorf("chưa có kênh nào được bật & liên kết (kiểm tra token hệ thống và chat ID của bạn)")
	}
	msg := "Kết quả gửi thử: "
	for i, r := range results {
		if i > 0 {
			msg += ", "
		}
		msg += r
	}
	return msg, nil
}

// ─── Helper tìm người nhận ───────────────────────────────────────────────

// ReviewRecipients: PM của dự án chứa task + tất cả admin (để duyệt).
func ReviewRecipients(ctx context.Context, db *sql.DB, taskID string) []string {
	rows, err := db.QueryContext(ctx, `
		SELECT pm.user_id::text FROM tasks t
		JOIN project_members pm ON pm.project_id = t.project_id AND pm.role = 'pm'
		WHERE t.id = $1
		UNION
		SELECT id::text FROM users WHERE system_role = 'admin'`, taskID)
	if err != nil {
		logx.Errorf("notify: ReviewRecipients thất bại: %v", err)
		return nil
	}
	defer rows.Close()
	return scanIDs(rows)
}

// CommentRecipients: các assignee của task, trừ người vừa bình luận.
func CommentRecipients(ctx context.Context, db *sql.DB, taskID, exclude string) []string {
	rows, err := db.QueryContext(ctx, `
		SELECT user_id::text FROM task_assignees
		WHERE task_id = $1 AND user_id <> $2::uuid`, taskID, exclude)
	if err != nil {
		logx.Errorf("notify: CommentRecipients thất bại: %v", err)
		return nil
	}
	defer rows.Close()
	return scanIDs(rows)
}

// TaskAssignees: tất cả assignee của task (dùng cho sự kiện duyệt/từ chối).
func TaskAssignees(ctx context.Context, db *sql.DB, taskID string) []string {
	rows, err := db.QueryContext(ctx, `
		SELECT user_id::text FROM task_assignees WHERE task_id = $1`, taskID)
	if err != nil {
		logx.Errorf("notify: TaskAssignees thất bại: %v", err)
		return nil
	}
	defer rows.Close()
	return scanIDs(rows)
}

func scanIDs(rows *sql.Rows) []string {
	out := []string{}
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err == nil {
			out = append(out, id)
		}
	}
	return out
}
