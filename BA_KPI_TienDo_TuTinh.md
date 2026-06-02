# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ (BA)
## Tính năng: Tiến độ & Chỉ số sức khỏe dự án tự tính (Auto Progress & KPI)

---

| Thông tin | Nội dung |
|-----------|---------|
| **Hệ thống** | MOCA ERP – Quản lý dự án |
| **Tính năng** | Tiến độ tự tính + KPI sức khỏe + Auto RAG |
| **Phiên bản** | 1.0 (Draft) |
| **Ngày tạo** | 02/06/2026 |
| **Liên quan** | [BA_ERP_ProjectManagement.md](./BA_ERP_ProjectManagement.md) §4.3, §6.3 |

---

## MỤC LỤC
1. [Bối cảnh & vấn đề](#1-bối-cảnh--vấn-đề)
2. [Mục tiêu](#2-mục-tiêu)
3. [Research – tham khảo phương pháp ngành](#3-research--tham-khảo-phương-pháp-ngành)
4. [Hiện trạng hệ thống (gap analysis)](#4-hiện-trạng-hệ-thống-gap-analysis)
5. [Giải pháp đề xuất – mô hình tính](#5-giải-pháp-đề-xuất--mô-hình-tính)
6. [Công thức chi tiết & ví dụ](#6-công-thức-chi-tiết--ví-dụ)
7. [Bộ chỉ số KPI](#7-bộ-chỉ-số-kpi)
8. [Auto RAG – luật suy ra trạng thái](#8-auto-rag--luật-suy-ra-trạng-thái)
9. [Yêu cầu nghiệp vụ & chức năng](#9-yêu-cầu-nghiệp-vụ--chức-năng)
10. [Thay đổi Data Model](#10-thay-đổi-data-model)
11. [Hiển thị / UI](#11-hiển-thị--ui)
12. [Use cases](#12-use-cases)
13. [Tiêu chí chấp nhận](#13-tiêu-chí-chấp-nhận)
14. [Rủi ro & quyết định cần chốt](#14-rủi-ro--quyết-định-cần-chốt)
15. [Lộ trình triển khai](#15-lộ-trình-triển-khai)

---

## 1. Bối cảnh & vấn đề

PM hiện phải **tự nhập % tiến độ** và **tự đặt màu RAG** (đỏ/vàng/xanh). Hệ quả:
- Số liệu chủ quan, không nhất quán giữa các dự án.
- Dashboard "Tiến độ" luôn hiển thị 0% vì không ai cập nhật.
- Lãnh đạo không có chỉ số khách quan để biết dự án **đang đúng tiến độ hay trễ**.

Yêu cầu: hệ thống **tự tính tiến độ** từ dữ liệu công việc thực tế và **tự đánh giá sức khỏe dự án theo kiểu KPI** (đúng hạn / cảnh báo / trễ), giảm thao tác thủ công.

---

## 2. Mục tiêu

| Mã | Mục tiêu | Đo lường |
|----|----------|----------|
| G1 | % tiến độ tự tính 3 cấp Task → Giai đoạn → Dự án | Không cần nhập tay; khớp dữ liệu task |
| G2 | So sánh tiến độ thực tế vs kế hoạch theo thời gian | Có chỉ số SV%, SPI |
| G3 | Tự suy ra RAG khi PM không override | ≥ 90% dự án có RAG đúng luật |
| G4 | Bộ KPI sức khỏe hiển thị ở dự án + dashboard | Tối thiểu 5 chỉ số |
| G5 | Tính realtime/gần realtime khi task thay đổi | Cập nhật ≤ 1 thao tác |

**Ngoài phạm vi (v1):** dự báo ngày hoàn thành bằng ML, biểu đồ burndown chi tiết, chi phí bằng tiền tệ (chỉ dùng giờ công).

---

## 3. Research – tham khảo phương pháp ngành

### 3.1 Cách các công cụ PM phổ biến tính tiến độ

| Công cụ | Cách tính % hoàn thành | Chỉ số sức khỏe |
|---------|------------------------|-----------------|
| **Jira** | Sprint burndown theo story point; % issue Done / tổng | Velocity, sprint health, "off track" |
| **Asana** | Milestone + % task hoàn thành; "Project status" thủ công + auto gợi ý | On track / At risk / Off track (status update) |
| **monday.com** | Cột "Progress" = trung bình trọng số các status column | Battery/progress bar theo nhóm |
| **MS Project** | % Complete nhập tay **hoặc** theo công (work) + EVM | SPI/CPI, Variance |
| **PMI – EVM** (chuẩn) | EV = % hoàn thành × ngân sách | **SPI = EV/PV**, **CPI = EV/AC** |

### 3.2 Earned Value Management (EVM) – nền tảng lý thuyết

Áp dụng EVM rút gọn (thay "tiền" bằng "khối lượng/giờ công"):

- **PV (Planned Value)** – khối lượng *lẽ ra* đã xong tính tới hôm nay (theo lịch).
- **EV (Earned Value)** – khối lượng *thực tế* đã xong (= % tiến độ tự tính).
- **AC (Actual Cost)** – công sức *thực tế* bỏ ra (giờ công `actual_hours`).
- **SPI = EV / PV** → ≥1: đúng/vượt tiến độ; <1: chậm.
- **CPI = EV / AC** (quy đổi giờ) → ≥1: hiệu quả; <1: tốn công hơn dự kiến.
- **SV% = EV − PV** → độ lệch tiến độ (điểm %).

> Kết luận research: dùng **roll-up trọng số** (task→phase→project) cho EV, và **PV theo thời gian tuyến tính** giữa `start_date`–`end_date`. RAG suy ra từ **SV%** + tỷ lệ quá hạn — đây là cách cân bằng giữa đơn giản (khả thi với data hiện có) và đúng chuẩn PMI.

---

## 4. Hiện trạng hệ thống (gap analysis)

| Thành phần | Hiện có | Khoảng trống |
|------------|---------|--------------|
| `projects.progress` (NUMERIC) | Có cột, **mặc định 0, không ai cập nhật** | Chưa tự tính |
| `phases.weight` (0–100), `phases.progress` | Có cột | progress chưa tính; weight chưa dùng để roll-up |
| `tasks.status` | new/in_progress/pending_review/done/rejected | Chưa quy đổi ra % |
| `tasks.estimated_hours / actual_hours` | Có | Chưa dùng để trọng số/CPI |
| `tasks.due_date` | Có | Chưa dùng đo quá hạn |
| `projects.rag_status` + `rag_override` | RAG thủ công | Chưa có auto-RAG khi không override |
| `work_logs.hours` | Có | Chưa tổng hợp |
| Ngày dự án `start_date/end_date` | Có | Chưa dùng tính PV/kế hoạch |

→ **Đủ dữ liệu** để triển khai mà *không cần* nhập thêm gì từ người dùng.

---

## 5. Giải pháp đề xuất – mô hình tính

### 5.1 Quy đổi trạng thái task → trọng số hoàn thành (cấu hình được)

| Status | % hoàn thành (mặc định) | Ghi chú |
|--------|------------------------|---------|
| `new` | 0% | chưa làm |
| `in_progress` | 50% | đang làm |
| `pending_review` | 90% | chờ duyệt (gần xong) |
| `done` | 100% | hoàn thành |
| `rejected` | 0% | bị từ chối, làm lại |

> Bảng này nên là **hằng cấu hình** (sau này cho admin chỉnh). Multi-assignee: có thể tinh chỉnh bằng `done_count/assignee_count` cho task đang làm.

### 5.2 Tiến độ Giai đoạn (Phase EV%)

Trọng số theo **giờ ước tính** (chính xác hơn theo "khối lượng"); nếu thiếu estimate thì đếm đều:

```
Nếu Σ estimated_hours(task trong phase) > 0:
    phase_progress = Σ( weight_status(task) × estimated_hours(task) ) / Σ estimated_hours(task)
Ngược lại (không có estimate):
    phase_progress = AVG( weight_status(task) )   // đếm đều theo số task
```
(Bỏ qua task `is_deleted = true`.)

### 5.3 Tiến độ Dự án (Project EV%)

Roll-up theo **trọng số giai đoạn** `phases.weight`:

```
Nếu Σ phases.weight > 0:
    project_progress = Σ( phase_progress × phase.weight ) / Σ phase.weight
Ngược lại:
    project_progress = roll-up trực tiếp từ task toàn dự án (như 5.2 trên toàn bộ task)
```

> Cho phép 2 chế độ: **theo trọng số giai đoạn** (khi PM đã đặt weight) hoặc **theo khối lượng task** (mặc định khi weight chưa set). Tránh phụ thuộc PM phải nhập weight.

### 5.4 Tiến độ kế hoạch (Planned % / PV)

```
planned_progress = clamp( (hôm_nay − start_date) / (end_date − start_date), 0, 1 ) × 100
```

---

## 6. Công thức chi tiết & ví dụ

**Ví dụ dự án "Website Redesign"** — `start=01/05`, `end=30/06`, hôm nay `02/06` (đã trôi ~53% thời gian).

Giai đoạn A (weight 40), giả sử Σestimate=100h:
- done 40h, in_progress 40h, new 20h → EV_A = (1.0×40 + 0.5×40 + 0×20)/100 = **60%**

Giai đoạn B (weight 60), Σestimate=200h:
- done 50h, pending_review 50h, new 100h → EV_B = (1.0×50 + 0.9×50 + 0×100)/200 = **47.5%**

**Project EV** = (60×40 + 47.5×60)/(40+60) = (2400+2850)/100 = **52.5%**

**Planned (PV)** ≈ **53%** (theo thời gian).

- **SV% = 52.5 − 53 = −0.5 điểm** → gần như đúng tiến độ.
- **SPI = 52.5 / 53 = 0.99** → đúng tiến độ.
- Giả sử AC (actual_hours) = 170h, EV quy giờ = 52.5%×300h = 157.5h → **CPI = 157.5/170 = 0.93** → hơi tốn công.

→ **RAG = 🟢 Xanh** (SV% trong ngưỡng cho phép, không quá hạn nặng).

---

## 7. Bộ chỉ số KPI

| KPI | Công thức | Ý nghĩa |
|-----|-----------|---------|
| **Tiến độ thực tế (EV%)** | §5.3 | % hoàn thành khách quan |
| **Tiến độ kế hoạch (PV%)** | §5.4 | Lẽ ra đạt bao nhiêu |
| **SV% (lệch tiến độ)** | EV − PV | + vượt / − chậm |
| **SPI** | EV / PV | Chỉ số hiệu suất lịch |
| **CPI** | EV(giờ) / Σactual_hours | Hiệu quả công sức |
| **% task quá hạn** | overdue_open / open_tasks | Áp lực trễ hạn |
| **Số ngày còn lại** | end_date − hôm_nay | Đệm thời gian |
| **Velocity** (tùy chọn) | task done / tuần | Nhịp độ |

`overdue_open` = task chưa `done` và `due_date < hôm_nay`.

---

## 8. Auto RAG – luật suy ra trạng thái

Chỉ áp dụng khi `rag_override = false` (PM vẫn có quyền ép màu thủ công, giữ nguyên cơ chế hiện tại).

| Điều kiện (ưu tiên từ trên xuống) | RAG |
|-----------------------------------|-----|
| Dự án `completed` hoặc EV ≥ 100% | 🟢 Xanh |
| Đã quá `end_date` mà EV < 100% | 🔴 Đỏ |
| SV% < −25 **hoặc** %task quá hạn > 30% | 🔴 Đỏ |
| −25 ≤ SV% < −10 **hoặc** %task quá hạn 10–30% | 🟡 Vàng |
| SV% ≥ −10 và %task quá hạn ≤ 10% | 🟢 Xanh |

> Ngưỡng (−10 / −25 / 30%) đặt làm **hằng cấu hình**. Khi PM bấm "ép RAG", set `rag_override=true` + lưu `rag_note`; hệ thống ngừng tự tính cho tới khi bỏ override.

---

## 9. Yêu cầu nghiệp vụ & chức năng

### Yêu cầu nghiệp vụ
- **BR-K1**: Tiến độ dự án/giai đoạn phải tự tính từ task, không nhập tay.
- **BR-K2**: Hệ thống tính tiến độ kế hoạch theo thời gian và so với thực tế.
- **BR-K3**: RAG tự suy ra theo luật, trừ khi PM ép thủ công.
- **BR-K4**: Mọi chỉ số tính lại khi task thay đổi (tạo/sửa/đổi status/xóa) hoặc theo lịch hằng ngày (cho PV trôi theo ngày).

### Yêu cầu chức năng
- **FR-K1**: API trả về EV%, PV%, SV%, SPI, CPI, %overdue, days_left cho mỗi dự án.
- **FR-K2**: `getProject`, `listProjects`, `getPhases` trả `progress` đã tính.
- **FR-K3**: Auto-recompute progress + auto-RAG khi: tạo/sửa/xóa task, đổi task status, đổi phase weight, đổi ngày dự án.
- **FR-K4**: Job nền hằng ngày (00:05) cập nhật lại PV/SV/RAG cho mọi dự án `active` (vì PV trôi theo thời gian dù task không đổi).
- **FR-K5**: Badge KPI ở card dự án + bảng chi tiết KPI ở trang dự án + widget ở Dashboard.

---

## 10. Thay đổi Data Model

**Phương án khuyến nghị – Hybrid (tính trong SQL + cache cột):**

- Giữ `projects.progress` làm **cache** EV%, cập nhật khi recompute (đã có sẵn cột).
- Thêm cột cache cho KPI để dashboard nhanh (tránh tính lại mỗi lần list):

```sql
ALTER TABLE projects
  ADD COLUMN planned_progress NUMERIC(5,2) NOT NULL DEFAULT 0, -- PV%
  ADD COLUMN spi              NUMERIC(6,3),                     -- EV/PV
  ADD COLUMN overdue_ratio    NUMERIC(5,2) NOT NULL DEFAULT 0,  -- % task quá hạn
  ADD COLUMN health_computed  VARCHAR(10),                      -- RAG tự tính (không ghi đè rag_status nếu override)
  ADD COLUMN metrics_updated_at TIMESTAMPTZ;
```
- `phases.progress` cập nhật khi recompute.
- **Không** thêm bảng mới; tận dụng `tasks`, `phases`, `work_logs` sẵn có.

> Thay thế: tính 100% on-the-fly trong query (không thêm cột) — luôn chính xác nhưng list nhiều dự án sẽ nặng hơn. Hybrid là cân bằng tốt nhất.

---

## 11. Hiển thị / UI

1. **Card dự án**: thanh progress = EV%; chấm màu = RAG (tự/thủ công); nhãn nhỏ "SPI 0.99".
2. **Trang dự án – dải KPI** (mở rộng khối Stat hiện có): EV% · PV% · SV% · SPI · CPI · %quá hạn · ngày còn lại. Tô màu theo ngưỡng.
3. **Tooltip/giải thích**: hover hiện công thức rút gọn để PM hiểu vì sao màu đỏ.
4. **Dashboard**: widget "Sức khỏe danh mục" — đếm dự án 🟢/🟡/🔴; danh sách "Dự án cần chú ý" (SPI thấp nhất).
5. **Nút "Ép RAG"** vẫn giữ; khi đang override hiện nhãn "RAG thủ công" + cho phép "Trả về tự tính".

---

## 12. Use cases

- **UC-K1 – Xem tiến độ tự tính**: PM/Member mở dự án → thấy EV%, PV%, SV%, SPI và RAG mà không phải nhập gì.
- **UC-K2 – Đổi status task cập nhật tiến độ**: Member kéo task sang Done → EV% dự án tăng tức thì, RAG có thể chuyển xanh.
- **UC-K3 – PV trôi theo ngày**: Qua đêm không ai làm gì → PV tăng, SV% âm hơn → dự án có thể tự chuyển 🟡 (job nền).
- **UC-K4 – PM ép RAG**: PM biết lý do ngoài hệ thống → ép 🔴 + ghi chú; auto-RAG tạm dừng.
- **UC-K5 – Cảnh báo**: Dự án chuyển 🔴 → gửi thông báo cho PM/Admin (tái dùng module notify đã có).

---

## 13. Tiêu chí chấp nhận

- [ ] EV% dự án = đúng kết quả công thức §5.3 trên bộ dữ liệu mẫu (sai số ≤ 0.01).
- [ ] Đổi 1 task sang `done` → EV% và RAG cập nhật ngay trong phản hồi API.
- [ ] Dự án quá `end_date` chưa xong → RAG = 🔴 (khi không override).
- [ ] `rag_override=true` → hệ thống KHÔNG đổi màu tự động.
- [ ] Job nền chạy hằng ngày cập nhật PV/RAG cho dự án `active`.
- [ ] Dải KPI hiển thị đủ 7 chỉ số ở trang dự án; card có thanh EV%.
- [ ] Hiệu năng: list 100 dự án < 300ms (nhờ cache cột).

---

## 14. Rủi ro & quyết định cần chốt

| # | Vấn đề | Đề xuất | Cần bạn chốt |
|---|--------|---------|--------------|
| Q1 | % cho `in_progress` nên là 50%? | Mặc định 50% | Có/khác |
| Q2 | Roll-up theo **giờ ước tính** hay **đếm task đều**? | Theo giờ nếu có, fallback đếm | OK? |
| Q3 | Có dùng `phases.weight` không (nhiều PM bỏ trống)? | Dùng nếu Σweight>0, không thì roll-up task | OK? |
| Q4 | Ngưỡng RAG −10/−25/30%? | Theo bảng §8 | Điều chỉnh? |
| Q5 | Cache cột hay tính on-the-fly? | Hybrid (cache) | OK? |
| Q6 | CPI cần `actual_hours` chính xác (đang ít ai log)? | v1 hiện CPI "thiếu dữ liệu" nếu chưa log giờ | Chấp nhận? |

---

## 15. Lộ trình triển khai

| Giai đoạn | Nội dung | Ước lượng |
|-----------|----------|-----------|
| **P1 – Lõi tiến độ** | Hàm tính EV% (task→phase→project) trong SQL; trả ở getProject/listProjects/getPhases; auto-recompute khi task đổi | 1–1.5 ngày |
| **P2 – KPI & Auto-RAG** | Tính PV/SV/SPI/CPI/%overdue; luật auto-RAG (tôn trọng override); cột cache + migration | 1–1.5 ngày |
| **P3 – Job nền + Thông báo** | Cron hằng ngày cập nhật PV/RAG; thông báo khi chuyển 🔴 | 0.5 ngày |
| **P4 – UI** | Dải KPI trang dự án, badge card, widget dashboard, tooltip | 1 ngày |

> Khuyến nghị làm **P1 trước** (giá trị cao nhất, rủi ro thấp): biến cột `progress` từ "luôn 0" thành số thật.

---

*Hết tài liệu. Sau khi bạn chốt các câu hỏi §14, tôi sẽ triển khai theo lộ trình §15 (bắt đầu P1).*
