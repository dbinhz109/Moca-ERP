# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ (BA)
## Phần Mềm ERP Quản Lý Dự Án

---

| Thông tin | Nội dung |
|-----------|---------|
| **Tên dự án** | ERP Simple – Hệ thống Quản lý Dự án |
| **Phiên bản** | 1.0 |
| **Ngày tạo** | 14/05/2026 |
| **Tác giả** | Business Analyst |
| **Trạng thái** | Draft |

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Phân tích thị trường](#2-phân-tích-thị-trường)
3. [Stakeholders](#3-stakeholders)
4. [Phân tích hệ thống tham khảo](#4-phân-tích-hệ-thống-tham-khảo)
5. [Yêu cầu nghiệp vụ](#5-yêu-cầu-nghiệp-vụ)
6. [Yêu cầu chức năng](#6-yêu-cầu-chức-năng)
7. [Yêu cầu phi chức năng](#7-yêu-cầu-phi-chức-năng)
8. [Use Cases chi tiết](#8-use-cases-chi-tiết)
9. [Data Model](#9-data-model)
10. [Màn hình & Luồng người dùng](#10-màn-hình--luồng-người-dùng)
11. [Tiêu chí chấp nhận](#11-tiêu-chí-chấp-nhận)
12. [Phân tích rủi ro](#12-phân-tích-rủi-ro)
13. [Lộ trình triển khai](#13-lộ-trình-triển-khai)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Giới thiệu

**ERP Simple** là hệ thống quản lý dự án nội bộ dành cho các doanh nghiệp vừa và nhỏ, tập trung vào ba module cốt lõi:
- **Workspace** – Không gian làm việc nhóm
- **Dự án** – Quản lý vòng đời dự án toàn diện
- **Lịch họp** – Lên lịch và quản lý cuộc họp

### 1.2 Mục tiêu kinh doanh

| Mục tiêu | Đo lường thành công |
|----------|-------------------|
| Giảm thời gian báo cáo tiến độ | Giảm 60% thời gian họp status |
| Tăng visibility cho PM/CEO | Dashboard real-time thay thế email báo cáo |
| Tập trung hóa thông tin dự án | 0 thông tin nằm rải rác ngoài hệ thống |
| Cải thiện phân công nguồn lực | Tránh over-allocate thành viên > 100% |
| Giảm công việc bị bỏ sót | 0 task quá hạn do không theo dõi được |

### 1.3 Phạm vi

**Trong phạm vi:**
- Quản lý Workspace, Dự án, Công việc (Task)
- Theo dõi giai đoạn (Phase), tiến độ, nguồn lực
- Lịch họp với phân loại và nhắc lịch
- Dashboard tổng hợp
- Phân quyền người dùng (Admin, PM, Member)
- Báo cáo nhanh

**Ngoài phạm vi (Phase 1):**
- Chấm công, tính lương
- Kế toán, tài chính
- CRM, bán hàng
- Mobile app native

---

## 2. PHÂN TÍCH THỊ TRƯỜNG

### 2.1 Tổng quan thị trường

Theo nghiên cứu thị trường 2026, thị trường phần mềm quản lý dự án đang tăng trưởng ~13% YoY. Các xu hướng chính:
- **Work OS** (Monday.com): Hợp nhất nhiều công cụ vào một nền tảng
- **AI-assisted** project management: Tự động gợi ý assignee, deadline
- **Async collaboration**: Giảm họp, tăng comment trên task
- **Real-time reporting**: CEO/Manager xem được tiến độ bất kỳ lúc nào

### 2.2 So sánh các phần mềm tham chiếu

| Tính năng | Jira | Asana | Monday.com | Lancs ERP | **ERP Simple (Mục tiêu)** |
|-----------|------|-------|------------|-----------|--------------------------|
| Kanban Board | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gantt Chart | ⚡ (Plugin) | ⚡ (Premium) | ✅ | ✅ | ✅ |
| Sprint/Phase | ✅ | ❌ | ❌ | ✅ | ✅ |
| Workspace | ❌ | ✅ | ✅ | ✅ | ✅ |
| Meeting Calendar | ❌ | ❌ | ❌ | ✅ | ✅ |
| Resource Workload | ⚡ (Premium) | ⚡ (Premium) | ✅ | ✅ | ✅ |
| CEO Report | ❌ | ❌ | ❌ | ✅ | ✅ |
| RAG Status | ❌ | ❌ | ❌ | ✅ | ✅ |
| WIP Limits | ✅ | ❌ | ✅ | ❌ | ✅ |
| Approval Workflow | ⚡ | ❌ | ⚡ | ✅ | ✅ |
| Tiếng Việt | ❌ | ❌ | ❌ | ✅ | ✅ |
| Giá | $$$$ | $$$ | $$$ | Internal | $ |

> **✅** = Có đầy đủ | **⚡** = Có nhưng hạn chế/tốn phí | **❌** = Không có

### 2.3 Phân tích điểm mạnh/yếu của hệ thống tham khảo (Lancs ERP)

**Điểm mạnh:**
- RAG status (Red/Amber/Green) theo dõi sức khỏe dự án trực quan
- Approval workflow tích hợp trong task
- Workload tracking theo thành viên
- Báo cáo CEO in-app
- Giao diện tiếng Việt

**Điểm cần cải thiện:**
- Workspace chưa có tính năng (hiện trống)
- Lịch họp chưa có ghi chú/biên bản họp
- Không có WIP limits trên Kanban
- Thiếu subtask
- Không có timeline view riêng cho meeting
- Thiếu notification/reminder cho lịch họp

---

## 3. STAKEHOLDERS

### 3.1 Danh sách Stakeholders

| Vai trò | Mô tả | Mức độ ảnh hưởng | Quan tâm chính |
|---------|-------|-----------------|---------------|
| **CEO/Giám đốc** | Người phê duyệt, xem báo cáo tổng quan | Cao | Dashboard, báo cáo, RAG status |
| **Project Manager (PM)** | Người tạo và quản lý dự án | Cao | Tiến độ, nguồn lực, giai đoạn, họp |
| **Team Member** | Thực hiện công việc | Cao | Task của tôi, deadline, thông báo |
| **Team Lead** | Quản lý nhóm nhỏ | Trung bình | Workload nhóm, phân công task |
| **Admin IT** | Quản trị hệ thống | Thấp | Phân quyền, cài đặt, backup |
| **HR** | Quản lý nhân sự | Thấp | Danh sách nhân viên, phòng ban |

### 3.2 Ma trận RACI

| Chức năng | CEO | PM | Member | Admin |
|-----------|-----|----|--------|-------|
| Tạo Workspace | I | R | - | A |
| Tạo Dự án | I | R/A | - | - |
| Phân công Task | I | R | C | - |
| Thực hiện Task | - | A | R | - |
| Phê duyệt Task | A | R | C | - |
| Tạo Lịch họp | I | R | C | - |
| Xem Dashboard | R | R | C | - |
| Báo cáo CEO | R | A | - | - |

---

## 4. PHÂN TÍCH HỆ THỐNG THAM KHẢO

### 4.1 Module Dashboard (Tổng quan)

**Các thông tin hiển thị:**
- Số dự án đang tham gia
- Số công việc quá hạn
- Tổng công việc
- Danh sách dự án (grid/list view)
- Bộ lọc: theo RAG, theo loại dự án
- Sắp xếp: theo RAG status

**Hành động có thể thực hiện:**
- Mở dự án
- Xem báo cáo CEO
- Duyệt Approval Queue
- Tìm kiếm dự án

### 4.2 Module Workspace

**Trạng thái hiện tại (tham khảo):** Workspace là nhóm chứa nhiều dự án, chưa có nội dung mẫu.

**Tính năng dự kiến:**
- Tạo/sửa/xóa Workspace
- Thêm dự án vào Workspace
- Phân quyền thành viên theo Workspace
- Dashboard tổng hợp của Workspace

### 4.3 Module Dự án

**Danh sách dự án:**
- Grid view & List view
- RAG Status: Đúng tiến độ (Green) / Trễ tiến độ (Red)
- Thông tin nhanh: số task, số thành viên, sprint điểm
- Tìm kiếm, lọc theo loại
- Phân trang

**Chi tiết dự án – Tab Giai đoạn:**
- Thanh tiến độ tổng (%)
- Trọng số pha (%)
- Mốc thời gian (start → end date)
- Danh sách thành viên
- Thêm/xóa giai đoạn
- Gantt chart view
- Tìm kiếm giai đoạn

**Chi tiết dự án – Tab Công việc (Task):**
- 3 chế độ xem: Kanban / Sơ đồ cây / Danh sách
- Columns Kanban: Mới / Đang làm / Chờ duyệt / Hoàn thành
- Bộ lọc: Tất cả / Của tôi / Quá hạn / Chưa gán
- Thuộc tính task: Tiêu đề, Mức ưu tiên, Người thực hiện, Deadline, Trạng thái
- Approval workflow: Duyệt / Từ chối
- Thêm task mới inline

**Chi tiết dự án – Tab Tài liệu:**
- Upload/download file
- Xem tài liệu trực tuyến
- Phân loại tài liệu

**Chi tiết dự án – Tab Nguồn lực:**
- Danh sách thành viên dự án
- Workload % của mỗi người
- Số task đang active
- Task đang thực hiện của từng người

**Chi tiết dự án – Tab Nhật ký làm việc:**
- Ghi nhận giờ làm việc
- Lịch sử log

### 4.4 Module Lịch họp

**Tính năng quan sát:**
- Calendar view (tháng)
- Filter theo ngày trong tuần (T2 → CN)
- Phân loại cuộc họp: Review / Standup / Board / Khác
- Tạo lịch họp mới
- Trạng thái: "Không có cuộc họp nào"

---

## 5. YÊU CẦU NGHIỆP VỤ

### 5.1 BR-001: Quản lý Workspace

> **Mô tả:** Hệ thống phải cho phép tổ chức dự án theo không gian làm việc (Workspace) để nhóm nhiều dự án liên quan lại với nhau.

**Quy tắc nghiệp vụ:**
- BR-001.1: Mỗi Workspace có một PM chịu trách nhiệm
- BR-001.2: Thành viên chỉ thấy Workspace được phân quyền
- BR-001.3: Workspace có thể chứa 1..N dự án
- BR-001.4: Xóa Workspace không xóa dự án bên trong (orphan projects)
- BR-001.5: Admin có thể xem tất cả Workspace

### 5.2 BR-002: Quản lý Dự án

> **Mô tả:** Hệ thống phải cung cấp vòng đời dự án đầy đủ từ khởi tạo đến đóng dự án.

**Quy tắc nghiệp vụ:**
- BR-002.1: Mỗi dự án có duy nhất một PM
- BR-002.2: Dự án có trạng thái: Lên kế hoạch / Đang chạy / Tạm dừng / Hoàn thành / Hủy
- BR-002.3: RAG status tự động tính dựa trên % tiến độ vs timeline:
  - Green (Đúng tiến độ): Tiến độ thực tế ≥ tiến độ kế hoạch
  - Amber (Cảnh báo): Tiến độ thực tế thấp hơn kế hoạch 1-20%
  - Red (Trễ tiến độ): Tiến độ thực tế thấp hơn kế hoạch > 20%
- BR-002.4: PM có thể override RAG status thủ công kèm lý do
- BR-002.5: Dự án phải có ngày bắt đầu và ngày kết thúc dự kiến
- BR-002.6: Xóa dự án yêu cầu PM xác nhận và Admin phê duyệt

### 5.3 BR-003: Quản lý Giai đoạn (Phase)

> **Mô tả:** Dự án được chia thành các giai đoạn để theo dõi tiến độ chi tiết.

**Quy tắc nghiệp vụ:**
- BR-003.1: Mỗi giai đoạn có trọng số (weight %) đóng góp vào tiến độ dự án
- BR-003.2: Tổng trọng số các giai đoạn = 100%
- BR-003.3: Tiến độ dự án = Σ(tiến độ giai đoạn × trọng số giai đoạn)
- BR-003.4: Tiến độ giai đoạn = (số task hoàn thành / tổng task) × 100%
- BR-003.5: Giai đoạn có thể xem dạng Gantt chart
- BR-003.6: Thứ tự giai đoạn có thể kéo thả thay đổi

### 5.4 BR-004: Quản lý Công việc (Task)

> **Mô tả:** Task là đơn vị công việc nhỏ nhất, được gán cho thành viên và theo dõi tiến độ.

**Quy tắc nghiệp vụ:**
- BR-004.1: Task thuộc về một giai đoạn của dự án
- BR-004.2: Mức độ ưu tiên: Thấp / Trung bình / Cao / Khẩn
- BR-004.3: Luồng trạng thái task:
  ```
  Mới → Đang làm → Chờ duyệt → Hoàn thành
                ↓
              Từ chối → Đang làm
  ```
- BR-004.4: Chỉ PM hoặc Team Lead mới duyệt task "Chờ duyệt"
- BR-004.5: Task có thể có nhiều người theo dõi (watcher)
- BR-004.6: Task quá hạn tự động highlight và thông báo
- BR-004.7: Một task chỉ có 1 người thực hiện chính (assignee)
- BR-004.8: Task có thể có subtask (tối đa 2 cấp)
- BR-004.9: WIP Limit: mỗi column Kanban có thể đặt giới hạn số task đang làm

### 5.5 BR-005: Quản lý Nguồn lực

> **Mô tả:** Theo dõi workload để tránh phân công quá tải cho thành viên.

**Quy tắc nghiệp vụ:**
- BR-005.1: Workload tính theo số giờ ước tính của task đang active / working hours chuẩn (8h/ngày)
- BR-005.2: Cảnh báo khi thành viên đạt workload > 80%
- BR-005.3: PM có thể xem workload của tất cả thành viên trong dự án
- BR-005.4: Thành viên có thể tham gia nhiều dự án cùng lúc

### 5.6 BR-006: Quản lý Lịch họp

> **Mô tả:** Lên lịch, theo dõi và ghi nhận kết quả cuộc họp.

**Quy tắc nghiệp vụ:**
- BR-006.1: Loại cuộc họp: Review / Standup / Board / Khác
- BR-006.2: Mỗi cuộc họp có: Tiêu đề, Thời gian (start-end), Địa điểm/Link, Người tổ chức, Danh sách tham dự
- BR-006.3: Tự động gửi thông báo nhắc lịch 15 phút và 1 giờ trước họp
- BR-006.4: Sau họp, tổ chức có thể ghi biên bản (meeting notes)
- BR-006.5: Liên kết cuộc họp với dự án liên quan
- BR-006.6: Trạng thái cuộc họp: Lên lịch / Đang diễn ra / Đã kết thúc / Hủy

---

## 6. YÊU CẦU CHỨC NĂNG

### 6.1 Module Xác thực (Authentication)

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-AUTH-01 | Đăng nhập | Email/username + mật khẩu | Must |
| F-AUTH-02 | SSO | Đăng nhập qua Keycloak/Google | Should |
| F-AUTH-03 | Ghi nhớ đăng nhập | Lưu session 30 ngày | Must |
| F-AUTH-04 | Đặt lại mật khẩu | Gửi email reset | Must |
| F-AUTH-05 | Đổi mật khẩu | Trong profile | Must |
| F-AUTH-06 | Đăng xuất | Xóa session | Must |

### 6.2 Module Workspace

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-WS-01 | Tạo Workspace | Tên, mô tả, màu sắc, ảnh đại diện | Must |
| F-WS-02 | Sửa Workspace | Cập nhật thông tin | Must |
| F-WS-03 | Xóa Workspace | Xóa mềm (soft delete) | Must |
| F-WS-04 | Thêm dự án vào WS | Kéo thả hoặc từ menu | Must |
| F-WS-05 | Quản lý thành viên WS | Thêm/xóa/phân quyền | Must |
| F-WS-06 | Dashboard WS | Tổng quan dự án, RAG, tiến độ | Must |
| F-WS-07 | Tìm kiếm WS | Tìm theo tên | Should |
| F-WS-08 | Archive Workspace | Lưu trữ WS không còn active | Could |

### 6.3 Module Dự án

#### 6.3.1 Danh sách dự án

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-PRJ-01 | Tạo dự án | Tên, mã, loại, PM, timeline, thành viên | Must |
| F-PRJ-02 | Sửa dự án | Cập nhật thông tin | Must |
| F-PRJ-03 | Xóa dự án | Soft delete, cần xác nhận | Must |
| F-PRJ-04 | Danh sách dự án | Grid/List view | Must |
| F-PRJ-05 | Tìm kiếm dự án | Theo tên, mã dự án | Must |
| F-PRJ-06 | Lọc dự án | Theo loại, trạng thái, RAG | Must |
| F-PRJ-07 | Sắp xếp dự án | Theo RAG, tên, ngày tạo | Must |
| F-PRJ-08 | RAG Status | Tự động & override thủ công | Must |
| F-PRJ-09 | Báo cáo CEO | Xuất tóm tắt dự án | Should |
| F-PRJ-10 | Duplicate dự án | Sao chép cấu trúc dự án | Could |

#### 6.3.2 Tab Giai đoạn

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-PHS-01 | Thêm giai đoạn | Tên, mô tả, trọng số, timeline | Must |
| F-PHS-02 | Sửa giai đoạn | Cập nhật thông tin | Must |
| F-PHS-03 | Xóa giai đoạn | Kiểm tra task trước khi xóa | Must |
| F-PHS-04 | Sắp xếp giai đoạn | Kéo thả thứ tự | Must |
| F-PHS-05 | Gantt chart | Timeline dạng Gantt | Must |
| F-PHS-06 | Tiến độ tổng | Hiển thị % tiến độ dự án | Must |
| F-PHS-07 | Tìm kiếm | Trong giai đoạn | Should |

#### 6.3.3 Tab Công việc (Task)

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-TSK-01 | Tạo task | Tiêu đề, mô tả, assignee, priority, deadline | Must |
| F-TSK-02 | Sửa task | Cập nhật thông tin | Must |
| F-TSK-03 | Xóa task | Soft delete | Must |
| F-TSK-04 | Kanban view | Drag-drop giữa các column | Must |
| F-TSK-05 | List view | Bảng dạng table | Must |
| F-TSK-06 | Tree view | Hiển thị subtask | Should |
| F-TSK-07 | Subtask | Tạo task con (tối đa 2 cấp) | Should |
| F-TSK-08 | Bình luận | Comment trên task | Must |
| F-TSK-09 | Đính kèm file | Upload attachment | Must |
| F-TSK-10 | Approval workflow | PM duyệt/từ chối task | Must |
| F-TSK-11 | WIP Limit | Giới hạn task trong column | Should |
| F-TSK-12 | Lọc task | Theo tôi / quá hạn / chưa gán | Must |
| F-TSK-13 | Tìm kiếm task | Full-text search | Must |
| F-TSK-14 | Label/Tag | Gắn nhãn task | Could |
| F-TSK-15 | Estimate giờ | Ước tính và ghi nhận giờ | Should |
| F-TSK-16 | Task history | Lịch sử thay đổi | Should |

#### 6.3.4 Tab Nguồn lực

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-RES-01 | Danh sách thành viên | Tên, vai trò, workload % | Must |
| F-RES-02 | Workload chart | Thanh tiến độ workload | Must |
| F-RES-03 | Task đang làm | List task active của người | Must |
| F-RES-04 | Cảnh báo quá tải | Alert khi workload > 80% | Should |
| F-RES-05 | Thêm/xóa thành viên | Quản lý team dự án | Must |

#### 6.3.5 Tab Nhật ký làm việc

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-LOG-01 | Ghi log giờ | Ghi nhận giờ làm theo task | Should |
| F-LOG-02 | Xem lịch sử | Timeline log của dự án | Should |
| F-LOG-03 | Tổng hợp giờ | Báo cáo giờ theo thành viên | Could |

### 6.4 Module Lịch họp

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-MTG-01 | Tạo lịch họp | Tiêu đề, loại, thời gian, địa điểm/link, mời | Must |
| F-MTG-02 | Sửa lịch họp | Cập nhật thông tin | Must |
| F-MTG-03 | Hủy lịch họp | Gửi thông báo cho người tham dự | Must |
| F-MTG-04 | Calendar view | Hiển thị lịch theo tháng | Must |
| F-MTG-05 | Week view | Hiển thị theo tuần | Must |
| F-MTG-06 | Day filter | Lọc theo ngày trong tuần | Must |
| F-MTG-07 | Phân loại | Review / Standup / Board / Khác | Must |
| F-MTG-08 | Nhắc lịch | Notification 15 phút & 1 giờ trước | Must |
| F-MTG-09 | Biên bản họp | Ghi nội dung, quyết định, action items | Should |
| F-MTG-10 | Liên kết dự án | Gắn cuộc họp với dự án | Should |
| F-MTG-11 | Recurring meeting | Cuộc họp lặp lại (daily/weekly) | Should |
| F-MTG-12 | Xác nhận tham dự | Accept/Decline mời họp | Could |
| F-MTG-13 | Gửi email mời | Gửi ICS/email cho người tham dự | Could |

### 6.5 Module Dashboard

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-DSH-01 | Thống kê nhanh | Dự án của tôi, quá hạn, tổng task | Must |
| F-DSH-02 | Danh sách dự án | Tóm tắt dự án đang tham gia | Must |
| F-DSH-03 | Task hôm nay | Task cần làm hôm nay | Should |
| F-DSH-04 | Họp hôm nay | Lịch họp trong ngày | Should |
| F-DSH-05 | Activity feed | Hoạt động gần đây | Could |
| F-DSH-06 | Approval Queue | Task đang chờ duyệt | Must |

### 6.6 Module Thông báo

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-NTF-01 | In-app notification | Thông báo trong hệ thống | Must |
| F-NTF-02 | Badge count | Số thông báo chưa đọc | Must |
| F-NTF-03 | Email notification | Gửi email theo sự kiện | Should |
| F-NTF-04 | Cài đặt notification | Tùy chỉnh loại thông báo | Could |

### 6.7 Module Phân quyền

| ID | Tính năng | Mô tả | Độ ưu tiên |
|----|-----------|-------|-----------|
| F-PRM-01 | Phân quyền hệ thống | Admin / PM / Member | Must |
| F-PRM-02 | Phân quyền dự án | PM / Team Lead / Member của dự án | Must |
| F-PRM-03 | Quản lý người dùng | Admin tạo/sửa/xóa tài khoản | Must |

---

## 7. YÊU CẦU PHI CHỨC NĂNG

### 7.1 Hiệu năng (Performance)

| Chỉ số | Mục tiêu |
|--------|---------|
| Thời gian tải trang | < 2 giây (điều kiện mạng thường) |
| API response time | < 500ms cho 95% request |
| Hỗ trợ đồng thời | 100 user đồng thời không giảm hiệu năng |
| Kanban drag-drop | Lag < 100ms |

### 7.2 Bảo mật (Security)

| Yêu cầu | Mô tả |
|---------|-------|
| Authentication | JWT token, expire 24h |
| Authorization | RBAC (Role-Based Access Control) |
| Data isolation | User chỉ thấy data được phân quyền |
| HTTPS | Bắt buộc trên production |
| Password hashing | Bcrypt với salt |
| Rate limiting | 100 req/min per IP |
| XSS/CSRF | Protection theo OWASP Top 10 |

### 7.3 Khả dụng (Availability)

| Chỉ số | Mục tiêu |
|--------|---------|
| Uptime | 99.5% (< 44h downtime/năm) |
| Backup | Hàng ngày, lưu 30 ngày |
| Recovery Time | < 4 giờ khi sự cố |

### 7.4 Khả năng mở rộng (Scalability)

- Hỗ trợ tối thiểu 1,000 user
- Tối thiểu 10,000 task mỗi dự án
- Cơ sở dữ liệu có thể sharding khi cần

### 7.5 Giao diện người dùng (Usability)

- Giao diện Tiếng Việt (mặc định) + Tiếng Anh
- Responsive: hỗ trợ màn hình từ 1280px trở lên
- Tuân theo design system nhất quán
- Tối đa 3 click để đến tính năng chính

### 7.6 Khả năng tích hợp (Integration)

- REST API chuẩn hóa với Swagger docs
- Webhook cho event cơ bản (task created, task completed...)
- Google Calendar sync (Phase 2)

---

## 8. USE CASES CHI TIẾT

### UC-001: Tạo Dự án Mới

| Trường | Nội dung |
|--------|---------|
| **Tên UC** | Tạo dự án mới |
| **Actor chính** | Project Manager |
| **Actor phụ** | Admin |
| **Điều kiện tiên quyết** | PM đã đăng nhập, có quyền tạo dự án |
| **Mục đích** | PM tạo dự án mới và cấu hình cơ bản |

**Luồng chính:**
1. PM nhấn "Tạo dự án" từ Dashboard hoặc Workspace
2. Hệ thống hiển thị form tạo dự án
3. PM nhập: Tên dự án, Mã dự án, Loại dự án, Mô tả
4. PM chọn ngày bắt đầu và ngày kết thúc dự kiến
5. PM chọn Workspace (tùy chọn)
6. PM thêm thành viên và phân quyền
7. PM nhấn "Tạo dự án"
8. Hệ thống validate dữ liệu
9. Hệ thống tạo dự án và chuyển vào trang chi tiết dự án
10. Hệ thống gửi thông báo đến các thành viên được thêm

**Luồng thay thế:**
- 8a. Nếu tên dự án đã tồn tại: hiển thị cảnh báo, yêu cầu nhập tên khác
- 8b. Nếu ngày kết thúc < ngày bắt đầu: hiển thị lỗi validation

**Điều kiện hậu:**
- Dự án mới được tạo với trạng thái "Lên kế hoạch"
- Thành viên nhận thông báo
- PM được tự động thêm vào dự án với quyền PM

---

### UC-002: Quản lý Task trên Kanban

| Trường | Nội dung |
|--------|---------|
| **Tên UC** | Cập nhật trạng thái task qua Kanban |
| **Actor chính** | Team Member |
| **Điều kiện tiên quyết** | Member đã đăng nhập, là thành viên dự án |

**Luồng chính:**
1. Member mở tab "Công việc" của dự án
2. Hệ thống hiển thị Kanban board với các columns
3. Member kéo task từ "Đang làm" sang "Chờ duyệt"
4. Hệ thống cập nhật trạng thái task
5. Hệ thống gửi thông báo đến PM để duyệt
6. PM xem task trong Approval Queue
7. PM nhấn "Duyệt" hoặc "Từ chối"
8. Nếu duyệt: task chuyển sang "Hoàn thành"
9. Nếu từ chối: task quay về "Đang làm", có comment lý do
10. Hệ thống thông báo kết quả cho Member

**Luồng thay thế:**
- 3a. Nếu WIP limit đã đầy: hiển thị cảnh báo "Đã đạt giới hạn WIP"
- 7a. PM có thể để lại comment khi từ chối

---

### UC-003: Tạo và Tham dự Lịch họp

| Trường | Nội dung |
|--------|---------|
| **Tên UC** | Tạo lịch họp và quản lý tham dự |
| **Actor chính** | PM / Team Lead |
| **Actor phụ** | Team Member |

**Luồng chính:**
1. PM vào module "Lịch họp"
2. PM nhấn "+ Tạo lịch họp"
3. PM nhập: Tiêu đề, Loại (Standup/Review/Board/Khác), Ngày giờ bắt đầu, Ngày giờ kết thúc, Địa điểm hoặc Link online
4. PM thêm người tham dự
5. PM liên kết với dự án (tùy chọn)
6. PM lưu lịch họp
7. Hệ thống gửi thông báo in-app đến người tham dự
8. Hệ thống nhắc lịch 1 giờ và 15 phút trước giờ họp
9. Sau họp, PM tạo biên bản họp (meeting notes)
10. Biên bản được lưu và người tham dự có thể xem lại

---

### UC-004: Xem Dashboard và Báo cáo CEO

| Trường | Nội dung |
|--------|---------|
| **Tên UC** | Xem tổng quan tiến độ dự án |
| **Actor chính** | CEO / PM |

**Luồng chính:**
1. CEO đăng nhập vào hệ thống
2. Hệ thống hiển thị Dashboard với:
   - Số dự án đang chạy
   - Số task quá hạn
   - RAG status tổng hợp
3. CEO nhấn "Báo cáo CEO"
4. Hệ thống tạo báo cáo tóm tắt:
   - Danh sách dự án + RAG status
   - % tiến độ mỗi dự án
   - Vấn đề nổi bật (task quá hạn, workload cao)
5. CEO có thể xuất PDF hoặc xem inline

---

## 9. DATA MODEL

### 9.1 Entity Relationship Diagram (mô tả)

```
USER ──────────── WORKSPACE_MEMBER ──── WORKSPACE
 │                                          │
 │                                     WORKSPACE_PROJECT
 │                                          │
 ├── PROJECT_MEMBER ──────────────────── PROJECT
 │                                          │
 │                                        PHASE
 │                                          │
 ├── TASK (assignee) ────────────────── PHASE
 │    │
 │    ├── TASK (parent) ──── TASK (subtask)
 │    ├── COMMENT
 │    ├── ATTACHMENT
 │    └── WORK_LOG
 │
 └── MEETING_ATTENDEE ─────────────── MEETING
                                          │
                                      MEETING_NOTE
```

### 9.2 Bảng dữ liệu chính

#### Bảng: users
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | UUID | PK | ID người dùng |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Tên đăng nhập |
| full_name | VARCHAR(200) | NOT NULL | Họ tên đầy đủ |
| password_hash | TEXT | NOT NULL | Mật khẩu đã hash |
| avatar_url | TEXT | NULL | Ảnh đại diện |
| system_role | ENUM | NOT NULL | admin / pm / member |
| is_active | BOOLEAN | DEFAULT TRUE | Trạng thái tài khoản |
| created_at | TIMESTAMP | NOT NULL | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL | Ngày cập nhật |

#### Bảng: workspaces
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | UUID | PK | ID workspace |
| name | VARCHAR(200) | NOT NULL | Tên workspace |
| description | TEXT | NULL | Mô tả |
| color | VARCHAR(7) | NULL | Màu hex (#RRGGBB) |
| icon | VARCHAR(50) | NULL | Icon code |
| owner_id | UUID | FK → users.id | Người sở hữu |
| is_archived | BOOLEAN | DEFAULT FALSE | Đã lưu trữ |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

#### Bảng: projects
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | UUID | PK | ID dự án |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Mã dự án |
| name | VARCHAR(300) | NOT NULL | Tên dự án |
| description | TEXT | NULL | Mô tả |
| type | VARCHAR(50) | NOT NULL | Loại dự án |
| pm_id | UUID | FK → users.id | Project Manager |
| workspace_id | UUID | FK → workspaces.id | Workspace chứa |
| status | ENUM | NOT NULL | planning/active/paused/completed/cancelled |
| rag_status | ENUM | NOT NULL | green/amber/red |
| rag_override | BOOLEAN | DEFAULT FALSE | Override thủ công |
| rag_note | TEXT | NULL | Lý do override |
| start_date | DATE | NOT NULL | Ngày bắt đầu |
| end_date | DATE | NOT NULL | Ngày kết thúc KH |
| progress | DECIMAL(5,2) | DEFAULT 0 | % tiến độ tổng |
| is_deleted | BOOLEAN | DEFAULT FALSE | Soft delete |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

#### Bảng: phases
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | UUID | PK | ID giai đoạn |
| project_id | UUID | FK → projects.id | Dự án |
| name | VARCHAR(200) | NOT NULL | Tên giai đoạn |
| description | TEXT | NULL | Mô tả |
| weight | DECIMAL(5,2) | NOT NULL | Trọng số (0-100) |
| sort_order | INTEGER | NOT NULL | Thứ tự |
| start_date | DATE | NULL | Ngày bắt đầu |
| end_date | DATE | NULL | Ngày kết thúc |
| progress | DECIMAL(5,2) | DEFAULT 0 | % tiến độ |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

#### Bảng: tasks
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | UUID | PK | ID task |
| project_id | UUID | FK → projects.id | Dự án |
| phase_id | UUID | FK → phases.id | Giai đoạn |
| parent_id | UUID | FK → tasks.id | Task cha (subtask) |
| title | VARCHAR(500) | NOT NULL | Tiêu đề |
| description | TEXT | NULL | Mô tả chi tiết |
| assignee_id | UUID | FK → users.id | Người thực hiện |
| created_by | UUID | FK → users.id | Người tạo |
| priority | ENUM | NOT NULL | low/medium/high/urgent |
| status | ENUM | NOT NULL | new/in_progress/pending_review/done/rejected |
| estimated_hours | DECIMAL(6,2) | NULL | Giờ ước tính |
| actual_hours | DECIMAL(6,2) | DEFAULT 0 | Giờ thực tế |
| due_date | DATE | NULL | Deadline |
| column_position | INTEGER | NOT NULL | Vị trí trong column |
| is_deleted | BOOLEAN | DEFAULT FALSE | Soft delete |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

#### Bảng: meetings
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| id | UUID | PK | ID cuộc họp |
| title | VARCHAR(300) | NOT NULL | Tiêu đề |
| type | ENUM | NOT NULL | review/standup/board/other |
| organizer_id | UUID | FK → users.id | Người tổ chức |
| project_id | UUID | FK → projects.id | Dự án liên quan |
| location | VARCHAR(300) | NULL | Địa điểm |
| meeting_url | TEXT | NULL | Link họp online |
| start_time | TIMESTAMP | NOT NULL | Giờ bắt đầu |
| end_time | TIMESTAMP | NOT NULL | Giờ kết thúc |
| status | ENUM | NOT NULL | scheduled/ongoing/done/cancelled |
| notes | TEXT | NULL | Biên bản họp |
| is_recurring | BOOLEAN | DEFAULT FALSE | Lặp lại |
| recurrence_rule | VARCHAR(100) | NULL | Quy tắc lặp (cron-like) |
| created_at | TIMESTAMP | NOT NULL | |
| updated_at | TIMESTAMP | NOT NULL | |

---

## 10. MÀN HÌNH & LUỒNG NGƯỜI DÙNG

### 10.1 Sơ đồ Navigation

```
[Login]
    │
    ▼
[Dashboard]
    ├── [Workspace]
    │       ├── [Danh sách WS]
    │       └── [Chi tiết WS] → [Dự án trong WS]
    │
    ├── [Dự án]
    │       ├── [Danh sách Dự án] (Grid/List)
    │       └── [Chi tiết Dự án]
    │               ├── Tab: [Giai đoạn] → [Gantt]
    │               ├── Tab: [Công việc] → [Kanban | List | Tree]
    │               │                          └── [Chi tiết Task]
    │               ├── Tab: [Tài liệu]
    │               ├── Tab: [Nguồn lực]
    │               └── Tab: [Nhật ký]
    │
    ├── [Lịch họp]
    │       ├── [Calendar view]
    │       └── [Chi tiết Cuộc họp]
    │               └── [Biên bản họp]
    │
    └── [Thông báo]
```

### 10.2 Wireframe mô tả – Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ [Logo]  Workspace | Dự án | Lịch họp    [Bell][Avatar]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Dự án: 5   │  │  Quá hạn: 2 │  │ Task: 47    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  [Tìm kiếm...]  [Lọc ▼]  [Sắp xếp ▼]  [Grid|List]    │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ ● Project A │  │ ○ Project B │  │ ● Project C │    │
│  │ GREEN | 65% │  │ RED  | 20%  │  │ GREEN | 80% │    │
│  │ 12 tasks    │  │ 8 tasks     │  │ 5 tasks     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 10.3 Wireframe mô tả – Kanban Board

```
┌─────────────────────────────────────────────────────────┐
│ [← Quay lại]  [TECH] Project Name          [Báo cáo]   │
├────────────────────────────────────────────────────────┤
│ [Giai đoạn] [Công việc*] [Tài liệu] [Nguồn lực] [Log] │
├────────────────────────────────────────────────────────┤
│ [Kanban] [List] [Tree]  [🔍 Tìm...]  [+ Tạo task]     │
│ [Tất cả] [Của tôi] [Quá hạn] [Chưa gán]               │
├──────────────┬──────────────┬──────────────┬───────────┤
│   MỚI (3)   │ ĐANG LÀM(4) │ CHỜ DUYỆT(2)│HOÀN THÀNH │
│  WIP: —     │  WIP: 5     │              │           │
│             │              │              │           │
│ ┌─────────┐ │ ┌─────────┐  │ ┌─────────┐ │           │
│ │Task A   │ │ │Task D   │  │ │Task G   │ │           │
│ │!Cao     │ │ │!Khẩn    │  │ │!Trung   │ │           │
│ │[Avatar] │ │ │[Avatar] │  │ │[Duyệt]  │ │           │
│ │25/05    │ │ │12/05    │  │ │[Từ chối]│ │           │
│ └─────────┘ │ └─────────┘  │ └─────────┘ │           │
│ + Thêm task │              │              │           │
└──────────────┴──────────────┴──────────────┴───────────┘
```

### 10.4 Wireframe mô tả – Lịch họp

```
┌─────────────────────────────────────────────────────────┐
│ Lịch họp                              [+ Tạo lịch họp] │
├─────────────────────────────────────────────────────────┤
│ [Tất cả] [T2] [T3] [T4] [T5*] [T6] [T7] [CN]          │
├───────────────────────┬─────────────────────────────────┤
│   Tháng 5/2026        │  Thứ 5, 14/05/2026             │
│  T2 T3 T4 T5 T6 T7 CN│                                 │
│   1  2  3  4  5  6  7 │  09:00 ● Daily Standup          │
│   8  9 10[11]12 13 14 │       Review | Meeting Room 1   │
│  15 16 17 18 19 20 21 │       5 người tham dự           │
│  22 23 24 25 26 27 28 │                                 │
│  29 30 31             │  14:00 ◐ Sprint Review Q2       │
│                       │       Board | Google Meet        │
│ ● Review  ● Standup   │       8 người tham dự           │
│ ● Board   ● Khác      │                                 │
└───────────────────────┴─────────────────────────────────┘
```

---

## 11. TIÊU CHÍ CHẤP NHẬN

### 11.1 Workspace

| ID | Tiêu chí | Pass/Fail |
|----|---------|-----------|
| AC-WS-01 | Tạo Workspace với tên, màu, mô tả → Hiển thị trong danh sách | |
| AC-WS-02 | Thêm dự án vào Workspace → Dự án hiển thị trong WS | |
| AC-WS-03 | Member không có quyền → Không thấy Workspace | |
| AC-WS-04 | Xóa Workspace → Dự án vẫn tồn tại ở trang Dự án | |

### 11.2 Dự án

| ID | Tiêu chí | Pass/Fail |
|----|---------|-----------|
| AC-PRJ-01 | Tạo dự án đầy đủ thông tin → Xuất hiện ở Dashboard | |
| AC-PRJ-02 | RAG Green khi tiến độ đúng kế hoạch | |
| AC-PRJ-03 | RAG Red khi tiến độ trễ > 20% | |
| AC-PRJ-04 | Tiến độ dự án = Σ(tiến độ phase × weight) | |
| AC-PRJ-05 | PM override RAG kèm ghi chú → Hiển thị icon override | |

### 11.3 Task & Kanban

| ID | Tiêu chí | Pass/Fail |
|----|---------|-----------|
| AC-TSK-01 | Kéo task giữa columns → Trạng thái cập nhật ngay | |
| AC-TSK-02 | Task "Chờ duyệt" → PM nhận notification | |
| AC-TSK-03 | PM duyệt → Task chuyển "Hoàn thành", Member nhận thông báo | |
| AC-TSK-04 | PM từ chối + comment → Task quay "Đang làm" | |
| AC-TSK-05 | Task quá deadline → Highlight đỏ | |
| AC-TSK-06 | WIP limit 5 → Column không cho thêm task khi đã đủ 5 | |
| AC-TSK-07 | Filter "Của tôi" → Chỉ hiện task được assign cho user hiện tại | |

### 11.4 Lịch họp

| ID | Tiêu chí | Pass/Fail |
|----|---------|-----------|
| AC-MTG-01 | Tạo lịch họp → Hiển thị đúng trên calendar | |
| AC-MTG-02 | Người tham dự nhận in-app notification | |
| AC-MTG-03 | Nhắc họp 1 giờ trước → Notification xuất hiện | |
| AC-MTG-04 | Lọc theo T5 → Chỉ hiện cuộc họp thứ 5 trong tuần | |
| AC-MTG-05 | Lọc theo loại "Standup" → Chỉ hiện Standup | |
| AC-MTG-06 | Hủy họp → Tất cả người tham dự nhận thông báo | |

---

## 12. PHÂN TÍCH RỦI RO

| ID | Rủi ro | Xác suất | Tác động | Biện pháp |
|----|--------|----------|----------|-----------|
| R-01 | Người dùng không chịu thay đổi thói quen (dùng Excel/Zalo) | Cao | Cao | Onboarding training, import từ Excel |
| R-02 | Dữ liệu mất khi deploy sai | Thấp | Cao | Backup hàng ngày, staging environment |
| R-03 | Hiệu năng kém khi nhiều user đồng thời | Trung bình | Trung bình | Load testing, pagination, caching |
| R-04 | Phân quyền sai → Lộ data | Thấp | Cao | Unit test phân quyền, security audit |
| R-05 | Tính năng thay đổi scope giữa chừng | Cao | Trung bình | Agile sprint, sign-off từng module |
| R-06 | Tích hợp email notification fail | Trung bình | Thấp | Fallback in-app, retry queue |

---

## 13. LỘ TRÌNH TRIỂN KHAI

### Phase 1 – MVP (Tuần 1-6)

**Sprint 1 (Tuần 1-2): Nền tảng**
- [ ] Authentication (login, logout, JWT)
- [ ] Phân quyền RBAC
- [ ] Quản lý người dùng cơ bản
- [ ] Dashboard layout & navigation

**Sprint 2 (Tuần 3-4): Dự án & Task**
- [ ] CRUD Dự án
- [ ] CRUD Giai đoạn + Gantt
- [ ] Task Kanban Board (3 view)
- [ ] Approval workflow
- [ ] RAG status tự động

**Sprint 3 (Tuần 5-6): Workspace & Meeting**
- [ ] CRUD Workspace
- [ ] Lịch họp (Calendar view)
- [ ] In-app Notification
- [ ] Dashboard thống kê

### Phase 2 – Hoàn thiện (Tuần 7-10)

**Sprint 4 (Tuần 7-8): Nâng cao**
- [ ] Subtask
- [ ] WIP Limits
- [ ] Resource workload view
- [ ] Work log (time tracking)
- [ ] Báo cáo CEO (export PDF)

**Sprint 5 (Tuần 9-10): Polish**
- [ ] Email notification
- [ ] Biên bản họp (meeting notes)
- [ ] Recurring meeting
- [ ] Mobile responsive
- [ ] Performance optimization

### Phase 3 – Tích hợp (Tuần 11+)

- [ ] Google Calendar sync
- [ ] REST API public + Swagger
- [ ] Webhook
- [ ] SSO (Keycloak/Google)
- [ ] Import từ Excel/CSV

---

## PHỤ LỤC

### A. Thuật ngữ

| Thuật ngữ | Giải thích |
|-----------|-----------|
| RAG | Red/Amber/Green – Hệ thống màu đánh giá sức khỏe dự án |
| PM | Project Manager – Quản lý dự án |
| WIP | Work in Progress – Công việc đang thực hiện |
| Sprint | Giai đoạn phát triển ngắn (1-2 tuần) trong Agile |
| Kanban | Phương pháp quản lý công việc theo board |
| Soft delete | Xóa ảo, không xóa thật khỏi cơ sở dữ liệu |
| RBAC | Role-Based Access Control – Phân quyền theo vai trò |

### B. Tech Stack Đề xuất

#### Frontend

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Framework | Next.js 14 + TypeScript | SSR, SEO, type-safe |
| UI Library | shadcn/ui + Tailwind CSS | Component có sẵn, dễ custom |
| Kanban | @dnd-kit/core | Drag-drop nhẹ, accessible |
| Calendar | FullCalendar | Đầy đủ tính năng lịch |
| Gantt | dhtmlx-gantt hoặc custom | Timeline chuyên dụng |
| State | Zustand + TanStack Query | Client state + server state tách biệt |
| WebSocket | Socket.io-client | Nhận notification real-time |

#### Backend (go-zero)

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Framework | **go-zero** | High-performance, built-in middleware, code-gen với `goctl` |
| Ngôn ngữ | Go 1.22+ | Hiệu năng cao, concurrency tốt, low memory |
| API style | REST (go-zero `api`) | Giao tiếp với frontend |
| Code gen | `goctl api go` | Tự sinh handler, logic, router từ `.api` file |
| Database | PostgreSQL | Quan hệ phức tạp, ACID |
| DB Access | go-zero `sqlx` + `goctl model` | Type-safe, code-gen model từ schema |
| Migration | golang-migrate | Version-controlled schema migration |
| Cache | Redis (go-zero built-in) | Session, WIP counts, rate limit |
| Auth | JWT (go-zero middleware) | Built-in `jwt` middleware trong go-zero |
| Password | bcrypt | Hash mật khẩu |
| WebSocket | gorilla/websocket | Real-time notification |
| File Storage | MinIO (self-host) / S3 | Lưu trữ file attachment |
| Email | go-mail / SMTP | Gửi email notification |
| Validation | go-playground/validator | Validate request struct |
| Logging | go-zero built-in zap | Structured logging |
| Config | go-zero `yaml` config | Quản lý cấu hình theo môi trường |

#### go-zero Project Structure

```
erp-backend/
├── api/                    # .api files định nghĩa routes
│   ├── user.api
│   ├── project.api
│   ├── task.api
│   ├── workspace.api
│   └── meeting.api
├── internal/
│   ├── config/             # Config structs (map từ yaml)
│   ├── handler/            # HTTP handlers (auto-generated)
│   │   ├── project/
│   │   ├── task/
│   │   └── meeting/
│   ├── logic/              # Business logic (viết tay)
│   │   ├── project/
│   │   ├── task/
│   │   └── meeting/
│   ├── middleware/          # Custom middleware (auth, rbac)
│   ├── model/              # DB models (auto-generated từ goctl)
│   │   ├── projectmodel.go
│   │   ├── taskmodel.go
│   │   └── meetingmodel.go
│   ├── svc/                # ServiceContext (DI container)
│   │   └── servicecontext.go
│   └── types/              # Request/Response types (auto-generated)
├── scripts/
│   ├── migrations/         # SQL migration files
│   └── generate.sh         # goctl code gen scripts
├── etc/
│   ├── erp-api.yaml        # Config production
│   └── erp-api-dev.yaml    # Config development
├── go.mod
└── main.go
```

#### go-zero API định nghĩa mẫu (project.api)

```go
syntax = "v1"

info(
    title: "MOCA ERP – Project API"
    version: "1.0"
)

type CreateProjectReq {
    Name      string `json:"name" validate:"required,max=300"`
    Code      string `json:"code" validate:"required,max=20"`
    Type      string `json:"type" validate:"required"`
    StartDate string `json:"start_date" validate:"required"`
    EndDate   string `json:"end_date" validate:"required"`
}

type ProjectResp {
    Id       string `json:"id"`
    Name     string `json:"name"`
    RagStatus string `json:"rag_status"`
    Progress float64 `json:"progress"`
}

@server(
    middleware: JwtAuth, RbacCheck
    prefix: /api/v1
    group: project
)
service erp-api {
    @doc "Tạo dự án mới"
    @handler CreateProject
    post /projects (CreateProjectReq) returns (ProjectResp)

    @doc "Danh sách dự án"
    @handler ListProjects
    get /projects returns ([]ProjectResp)

    @doc "Chi tiết dự án"
    @handler GetProject
    get /projects/:id returns (ProjectResp)

    @doc "Cập nhật dự án"
    @handler UpdateProject
    put /projects/:id (CreateProjectReq) returns (ProjectResp)
}
```

#### Deployment

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Container | Docker + Docker Compose | Dễ deploy, isolate |
| Reverse Proxy | Nginx | SSL termination, static files |
| CI/CD | GitHub Actions | Auto build & deploy |
| Monitoring | Prometheus + Grafana | go-zero có built-in metrics |

---

*Tài liệu này là bản draft và sẽ được cập nhật sau khi có phản hồi từ stakeholders.*

*Phiên bản tiếp theo sẽ bổ sung: Prototype Figma, API Specification chi tiết, Test Plan.*
