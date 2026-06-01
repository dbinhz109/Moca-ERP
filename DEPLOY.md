# Triển khai MOCA ERP miễn phí

Kiến trúc: **FE (Next.js) → Vercel** · **BE (go-zero) → Render/Koyeb qua Docker** · **DB → Neon (PostgreSQL)**.
Không cần Redis (đã khai báo trong config nhưng không dùng).

> Đây là **monorepo** (`backend/` + `frontend/` trong cùng 1 repo). Cả hai nền tảng
> deploy từ cùng repo, chỉ khác **Root Directory**.

---

## Code đã chuẩn bị sẵn (đã làm)

- `backend/erp.go`: nạp config bằng `conf.UseEnv()` (thay `${BIẾN}` từ env), CORS đọc từ
  `CorsOrigin`, thêm health check công khai `GET /ping`.
- `backend/internal/config/config.go`: `Cache` thành optional, thêm `CorsOrigin`.
- `backend/etc/erp-api-prod.yaml`: config production toàn biến môi trường.
- `backend/Dockerfile` + `.dockerignore`: build Go 1.25 multi-stage.
- `backend/scripts/migrate.sh`: chạy toàn bộ migration lên `$DATABASE_URL`.
- `backend/.env.example`, `frontend/.env.example`, `.gitignore`.

---

## Bước 0 — Đẩy code lên GitHub

```bash
cd /home/binh/Documents/ERP
git init && git add . && git commit -m "chore: chuẩn bị deploy"
git branch -M main
git remote add origin https://github.com/<bạn>/moca-erp.git
git push -u origin main
```
`.gitignore` đã chặn `.env`, `node_modules`, `.next`, binary. **Không** đẩy secret thật.

## Bước 1 — Database (Neon)

1. Tạo project PostgreSQL free tại neon.tech, copy **Connection String** (có `?sslmode=require`).
2. Chạy migration (tạo bảng + seed sẵn tài khoản `admin`):
   ```bash
   export DATABASE_URL="postgres://...neon.../db?sslmode=require"
   cd backend && ./scripts/migrate.sh
   ```

## Bước 2 — Back-end (Render, dùng Docker)

1. Render.com → **New → Web Service** → chọn repo.
2. **Root Directory:** `backend` · **Runtime:** `Docker` (tự nhận `backend/Dockerfile`).
3. **Environment Variables:**
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | chuỗi Neon (`?sslmode=require`) |
   | `JWT_SECRET` | chuỗi ngẫu nhiên mạnh — `openssl rand -base64 48` |
   | `FRONTEND_ORIGIN` | điền sau khi có domain Vercel (tạm `https://localhost`) |
   > `PORT` do Render tự cấp — **không cần** tự thêm.
4. Deploy → nhận URL `https://moca-erp.onrender.com`. Kiểm tra `…/ping` trả `{"status":"ok"}`.

> Koyeb tương đương và **không bị sleep** như Render free — cùng Dockerfile, cùng env.

## Bước 3 — Front-end (Vercel)

1. Vercel.com → **Add New → Project** → import repo.
2. **Root Directory:** `frontend` (Vercel tự nhận Next.js).
3. **Environment Variable:**
   - `NEXT_PUBLIC_API_BASE_URL = https://moca-erp.onrender.com/api/v1`  ← nhớ hậu tố `/api/v1`
4. Deploy → nhận `https://moca-erp.vercel.app`.

## Bước 4 — Nối CORS hai chiều (quan trọng)

1. Quay lại Render → sửa `FRONTEND_ORIGIN = https://moca-erp.vercel.app` → **Save** (BE tự redeploy).
   - Nhiều domain: phân tách bằng dấu phẩy (vd thêm preview của Vercel).
2. Xong: mở domain Vercel, đăng nhập `admin / password` (đổi mật khẩu ngay trong Cài đặt → Tài khoản).

---

## Giữ Render không "ngủ"

Render free ngủ sau 15 phút. Dùng **UptimeRobot** hoặc **cron-job.org** ping
`https://moca-erp.onrender.com/ping` mỗi ~10 phút.

## Lưu ý bảo mật

- **Không** dùng lại secret dev (`change-me-in-production` trong `etc/erp-api.yaml`) cho prod — prod lấy từ `JWT_SECRET`.
- DB cloud bắt buộc `sslmode=require`.
- Toàn bộ secret nằm ở Environment Variables của Render/Vercel, không commit.
