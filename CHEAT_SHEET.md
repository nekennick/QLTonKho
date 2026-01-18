# 🚀 Antigravity Kit - Hướng Dẫn Chi Tiết Cho Người Mới

> **Dành cho người mới bắt đầu và low-code developers**
> Hướng dẫn từng bước sử dụng Antigravity Kit để làm việc hiệu quả với AI coding assistants.

---

## 📋 Mục Lục

1. [Giới thiệu đơn giản](#-giới-thiệu-đơn-giản)
2. [Cài đặt](#-cài-đặt)
3. [3 Tình Huống Sử Dụng](#-3-tình-huống-sử-dụng)
4. [Các Lệnh Quan Trọng](#-các-lệnh-quan-trọng)
5. [Mẹo Và Thủ Thuật](#-mẹo-và-thủ-thuật)
6. [FAQ - Câu Hỏi Thường Gặp](#-faq---câu-hỏi-thường-gặp)

---

## 🎯 Giới Thiệu Đơn Giản

### Antigravity Kit là gì?

Antigravity Kit là **bộ công cụ giúp AI hiểu và làm việc tốt hơn** với code của bạn. Khi cài đặt vào dự án, AI sẽ có thêm:

| Thành phần | Ý nghĩa | Ví dụ |
|------------|---------|-------|
| **Skills** | Chuyên gia theo lĩnh vực | AI biết cách làm React, Database, UI/UX... |
| **Rules** | Nguyên tắc làm việc | AI sẽ hỏi trước khi làm, không tự ý thêm tính năng |
| **Workflows** | Quy trình chuẩn | AI làm việc theo quy trình chuyên nghiệp |

### Tại sao nên dùng?

- ✅ AI code chất lượng hơn, ít lỗi hơn
- ✅ AI hiểu context dự án của bạn tốt hơn
- ✅ Có quy trình làm việc rõ ràng
- ✅ Tiết kiệm thời gian sửa lỗi

---

## 📦 Cài Đặt

### Yêu cầu trước khi cài

- ✅ Đã cài **Node.js** (phiên bản 16 trở lên)
- ✅ Có **terminal/command prompt**

### Kiểm tra Node.js

Mở terminal và gõ:
```bash
node --version
```

Nếu hiện ra số phiên bản (ví dụ: `v18.17.0`) → Đã cài đặt ✅
Nếu báo lỗi → Vào [nodejs.org](https://nodejs.org) để cài đặt

### Cài đặt Antigravity Kit

```bash
# Bước 1: Mở terminal, đi đến thư mục dự án
cd đường-dẫn-đến-dự-án

# Bước 2: Chạy lệnh cài đặt
npx @vudovn/ag-kit init

# Or install globally:
npm install -g @vudovn/ag-kit
ag-kit init
```

**Kết quả:** Sẽ có thư mục `.agent` trong dự án của bạn

```
dự-án-của-bạn/
├── .agent/          ← Thư mục mới được tạo
│   ├── rules/       ← Các nguyên tắc
│   ├── skills/      ← Các chuyên gia
│   └── workflows/   ← Các quy trình
└── (các file khác)
```

---

## 🎮 3 Tình Huống Sử Dụng

---

### 🆕 Tình Huống 1: Bắt Đầu Dự Án Mới

**Bạn muốn:** Tạo một website/app hoàn toàn mới

#### Bước 1: Tạo thư mục dự án

```bash
# Tạo thư mục mới
mkdir ten-du-an-cua-ban
cd ten-du-an-cua-ban
```

#### Bước 2: Cài đặt Antigravity Kit

```bash
npx @vudovn/antigravity-kit init
```

#### Bước 3: Nói với AI bạn muốn gì

**❌ Cách nói KHÔNG TỐT:**
> "Làm cho tôi một website"

**✅ Cách nói TỐT:**
> "Tôi muốn tạo một landing page cho dịch vụ spa với:
> - Giao diện sang trọng, chuyên nghiệp
> - Có form đặt lịch
> - Responsive trên mobile
> 
> Hãy tư vấn cho tôi về tech stack và structure trước khi code"

#### Bước 4: AI sẽ hỏi lại để làm rõ

AI sẽ đưa ra 2-3 lựa chọn và hỏi:
> "Bạn muốn dùng Option A hay Option B? Xác nhận để tôi bắt đầu code"

**→ Bạn cần trả lời xác nhận** (ví dụ: "Dùng Option A")

#### Bước 5: AI code theo thứ tự chuẩn

1. **Types** - Định nghĩa các kiểu dữ liệu
2. **Logic/Hooks** - Xử lý logic
3. **UI** - Giao diện người dùng
4. **Styles** - CSS/Styling

---

### 📂 Tình Huống 2: Làm Việc Với Dự Án Có Sẵn

**Bạn muốn:** Hiểu dự án của người khác và tiếp tục phát triển

#### Bước 1: Cài đặt Antigravity Kit vào dự án

```bash
cd duong-dan-den-du-an
npx @vudovn/antigravity-kit init
```

#### Bước 2: Yêu cầu AI phân tích dự án

**Prompt mẫu:**
> "Hãy đọc qua dự án này và giải thích cho tôi:
> 1. Dự án này làm gì?
> 2. Tech stack sử dụng là gì?
> 3. Cấu trúc thư mục như thế nào?
> 4. Các file/component quan trọng nhất?"

#### Bước 3: Hỏi về phần bạn muốn thay đổi

**Prompt mẫu:**
> "Tôi muốn thêm tính năng [X] vào dự án này.
> Hãy tư vấn xem cần sửa những file nào và approach như thế nào?"

#### Bước 4: Xác nhận trước khi AI thay đổi code

AI sẽ đề xuất → Bạn xác nhận → AI thực hiện

---

### ➕ Tình Huống 3: Thêm Tính Năng Mới

**Bạn muốn:** Thêm một tính năng/module vào dự án hiện có

#### Bước 1: Mô tả rõ ràng tính năng cần thêm

**Prompt mẫu:**
> "Thêm tính năng đăng nhập bằng Google với các yêu cầu:
> - Sử dụng NextAuth
> - Lưu thông tin user vào database
> - Hiển thị avatar user sau khi đăng nhập
> 
> Tư vấn cho tôi approach trước khi code"

#### Bước 2: AI sẽ đề xuất (CONSULT mode)

AI đưa ra options → Bạn chọn → AI bắt đầu code

#### Bước 3: Review từng phần

AI sẽ code theo từng bước, bạn có thể:
- ✅ "Tiếp tục" - nếu đồng ý
- 🔄 "Sửa lại phần X" - nếu muốn thay đổi
- ❓ "Giải thích phần này" - nếu chưa hiểu

---

## 🔧 Các Lệnh Quan Trọng

### Lệnh Terminal

| Lệnh | Ý nghĩa |
|------|---------|
| `npx @vudovn/antigravity-kit init` | Cài đặt lần đầu |
| `npx @vudovn/antigravity-kit update` | Cập nhật phiên bản mới |
| `npx @vudovn/antigravity-kit status` | Kiểm tra trạng thái |

### Prompt Templates

#### 🔍 Khi cần tư vấn/so sánh:
```
Tôi đang phân vân giữa [A] và [B].
Context: [mô tả dự án]
Yêu cầu: [các yêu cầu cần đáp ứng]
Hãy so sánh và đề xuất cho tôi.
```

#### 🏗️ Khi cần tạo mới:
```
Tạo [component/feature] với các yêu cầu:
- Yêu cầu 1
- Yêu cầu 2
- Yêu cầu 3

Tech stack: [nếu có chỉ định]
Hãy đề xuất structure trước khi code.
```

#### 🔧 Khi cần sửa lỗi:
```
Lỗi: [mô tả lỗi hoặc paste error message]
Xảy ra khi: [mô tả tình huống]
Code liên quan: [file hoặc paste code]

Giúp tôi tìm và fix lỗi này.
```

#### ⚡ Khi cần tối ưu:
```
Code/file này đang [chậm/khó đọc/có vấn đề].
Yêu cầu: [mô tả mong muốn]
Hãy refactor/optimize giúp tôi.
```

---

## 💡 Mẹo Và Thủ Thuật

### ✅ NÊN LÀM

1. **Mô tả rõ ràng và chi tiết**
   - ❌ "Làm trang login"
   - ✅ "Làm trang login với form email/password, có validate, hiển thị lỗi, responsive"

2. **Yêu cầu tư vấn trước khi code**
   - Thêm: "Hãy tư vấn trước khi bắt đầu code"
   - AI sẽ đề xuất options để bạn chọn

3. **Chia nhỏ yêu cầu lớn**
   - ❌ "Làm website bán hàng hoàn chỉnh"
   - ✅ "Bước 1: Làm trang hiển thị sản phẩm"

4. **Xác nhận từng bước**
   - Đọc code AI tạo ra
   - Hỏi nếu không hiểu
   - Xác nhận trước khi tiếp tục

### ❌ KHÔNG NÊN LÀM

1. **Không nói quá chung chung**
   - ❌ "Làm đẹp hơn"
   - ✅ "Thêm gradient background, bo tròn các góc, thêm shadow"

2. **Không skip bước tư vấn**
   - AI hỏi → Bạn trả lời → Rồi mới code

3. **Không copy code mà không hiểu**
   - Hỏi AI giải thích nếu chưa rõ

---

## ❓ FAQ - Câu Hỏi Thường Gặp

### Q: Tôi cần biết code để dùng không?

**A:** Không cần biết nhiều. Bạn chỉ cần:
- Biết mô tả bạn muốn gì
- Biết chạy các lệnh cơ bản trong terminal
- Biết đọc và hiểu code cơ bản (AI sẽ giải thích)

### Q: Skills hoạt động như thế nào?

**A:** AI **tự động chọn skill phù hợp** dựa trên yêu cầu của bạn:
- Yêu cầu về React → AI tự dùng `react-expert`
- Yêu cầu về database → AI tự dùng `database-expert`
- Bạn không cần gọi skill thủ công

### Q: Có cần trả phí không?

**A:** Antigravity Kit **miễn phí**. Bạn chỉ cần có AI assistant (như Claude, Cursor...) đã hỗ trợ agent skills.

### Q: Làm sao biết cài đặt thành công?

**A:** Chạy lệnh sau:
```bash
npx @vudovn/antigravity-kit status
```
Nếu hiện thông tin về `.agent` folder → Đã cài thành công ✅

### Q: Cập nhật như thế nào?

**A:** Chạy lệnh:
```bash
npx @vudovn/antigravity-kit update
```

---

## 📊 Bảng Tham Khảo Nhanh

### 4 Loại Task

| Icon | Loại | Từ khóa | Ví dụ |
|:----:|:-----|:--------|:------|
| 🔍 | **TƯ VẤN** | "nên", "so sánh", "đề xuất" | "Nên dùng React hay Vue?" |
| 🏗️ | **TẠO MỚI** | "tạo", "làm", "viết" | "Tạo component Button" |
| 🔧 | **SỬA LỖI** | "lỗi", "fix", "không chạy" | "Fix lỗi login không được" |
| ⚡ | **TỐI ƯU** | "chậm", "refactor", "cải thiện" | "Code này chạy chậm" |

### Checklist Trước Khi Giao Code

AI sẽ tự kiểm tra những điều này:

- [ ] Không có `any` type (TypeScript)
- [ ] Không hardcode giá trị
- [ ] Có xử lý lỗi đầy đủ
- [ ] Đặt tên biến/function rõ ràng
- [ ] File không quá 200 dòng
- [ ] Có Loading/Error/Empty states (cho UI)

---

## 🎉 Tổng Kết

**3 bước đơn giản để bắt đầu:**

1. **Cài đặt:** `npx @vudovn/antigravity-kit init`
2. **Mô tả rõ ràng** bạn muốn gì
3. **Xác nhận** trước khi AI code

**Nhớ:** AI sẽ hỏi trước khi làm, bạn chỉ cần trả lời và xác nhận!

---

<p align="center">
  <b>Chúc bạn code vui vẻ! 🚀</b>
</p>

<p align="center">
  Made with ❤️ by <a href="https://github.com/vudovn">VudoVN</a>
</p>
