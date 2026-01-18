# Hướng Dẫn Cấu Hình Thông Báo Zalo Bot

## Tổng Quan

Hệ thống thông báo cho phép gửi thông báo tự động qua Zalo Bot API khi:
- Tạo phiếu xuất/nhập kho mới
- Duyệt phiếu xuất/nhập kho
- Từ chối phiếu xuất/nhập kho

## Cấu Hình

### 1. Tạo File .env.local

Tạo file `.env.local` trong thư mục root của project với nội dung:

```bash
# Zalo Bot Configuration
NEXT_PUBLIC_ZALO_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_ZALO_CHAT_ID=your_chat_id_here

# Enable/Disable notifications (true/false)
NEXT_PUBLIC_NOTIFICATION_ENABLED=true

# Individual notification types (true/false)
NEXT_PUBLIC_NOTIFICATION_INVENTORY_CREATION=true
NEXT_PUBLIC_NOTIFICATION_INVENTORY_APPROVAL=true
NEXT_PUBLIC_NOTIFICATION_INVENTORY_REJECTION=true
```

**Lưu ý:** File `.env.local` sẽ không được commit vào Git để bảo mật thông tin.

### 2. Lấy Bot Token

1. Truy cập [Zalo Developer Console](https://developers.zalo.me/)
2. Tạo ứng dụng mới hoặc chọn ứng dụng hiện có
3. Vào phần "Bot" và tạo bot mới
4. Copy Bot Token từ trang cấu hình
5. Thay thế `your_bot_token_here` trong file `.env.local`

### 3. Lấy Chat ID

1. Thêm bot vào nhóm chat hoặc chat riêng
2. Gửi tin nhắn cho bot
3. Sử dụng Zalo Bot API để lấy thông tin chat:
   ```bash
   curl -X GET "https://bot-api.zapps.me/bot<BOT_TOKEN>/getUpdates"
   ```
4. Tìm `chat_id` trong response
5. Thay thế `your_chat_id_here` trong file `.env.local`

### 4. Khởi Động Lại Ứng Dụng

Sau khi cấu hình xong, khởi động lại ứng dụng để load các biến môi trường mới:

```bash
npm run dev
# hoặc
yarn dev
```

## Các Loại Thông Báo

### 1. Thông Báo Tạo Phiếu

Khi tạo phiếu xuất/nhập kho mới, hệ thống sẽ gửi:
- Tin nhắn văn bản với thông tin phiếu
- Hình ảnh phiếu (nếu được cấu hình)

**Nội dung thông báo:**
```
📦 THÔNG BÁO TẠO PHIẾU XUẤT KHO

🏷️ Mã phiếu: NXT1758855083590
👤 Người tạo: NZ - Admin app
📅 Thời gian: 15/01/2024 09:51:00
🏢 Từ: KHO AP
🎯 Đến: KHO B
📊 Số mặt hàng: 5
💰 Tổng tiền: ₫1,500,000

✅ Phiếu đã được tạo thành công và đang chờ duyệt.
```

### 2. Thông Báo Duyệt Phiếu

Khi duyệt phiếu, hệ thống sẽ gửi:
- Tin nhắn văn bản xác nhận duyệt
- Hình ảnh phiếu đã duyệt

**Nội dung thông báo:**
```
✅ THÔNG BÁO DUYỆT PHIẾU

🏷️ Mã phiếu: NXT1758855083590
👤 Người duyệt: Admin
📅 Thời gian: 15/01/2024 10:30:00
📝 Ghi chú: Phiếu đã được duyệt

✅ Phiếu đã được duyệt thành công!
```

### 3. Thông Báo Từ Chối Phiếu

Khi từ chối phiếu, hệ thống sẽ gửi:
- Tin nhắn văn bản thông báo từ chối
- Hình ảnh phiếu bị từ chối

**Nội dung thông báo:**
```
❌ THÔNG BÁO TỪ CHỐI PHIẾU

🏷️ Mã phiếu: NXT1758855083590
👤 Người duyệt: Admin
📅 Thời gian: 15/01/2024 10:30:00
📝 Ghi chú: Thiếu thông tin địa chỉ

❌ Phiếu đã bị từ chối.
```

## Chuyển Đổi HTML Thành Hình Ảnh

Hệ thống hỗ trợ nhiều phương pháp chuyển đổi HTML thành hình ảnh:

### 1. Placeholder (Mặc định)
- Tạo hình ảnh placeholder đơn giản
- Không cần cài đặt thêm
- Phù hợp cho testing

### 2. HTML2Canvas
- Chuyển đổi HTML thực tế thành hình ảnh
- Cần cài đặt thư viện `html2canvas`
- Chất lượng cao, hỗ trợ đầy đủ CSS

### 3. Server-side
- Sử dụng API backend để chuyển đổi
- Cần triển khai endpoint `/api/html-to-image`
- Hiệu suất tốt, hỗ trợ nhiều format

### 4. Third-party Service
- Sử dụng dịch vụ bên thứ 3
- Cần API key và cấu hình
- Chất lượng cao, ổn định

## Cài Đặt HTML2Canvas (Tùy chọn)

Nếu muốn sử dụng HTML2Canvas:

```bash
npm install html2canvas
```

Sau đó cập nhật `src/utils/htmlToImageService.ts`:

```typescript
// Thay đổi method từ 'placeholder' thành 'html2canvas'
return await convertHtmlToImage(htmlContent, {
  method: 'html2canvas', // Thay đổi từ 'placeholder'
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
});
```

## Xử Lý Lỗi

Hệ thống được thiết kế để không ảnh hưởng đến chức năng chính:
- Nếu gửi thông báo thất bại, hệ thống vẫn tiếp tục hoạt động bình thường
- Lỗi được ghi log vào console
- Người dùng không thấy thông báo lỗi về việc gửi thông báo

## Debugging

Để debug thông báo:

1. Mở Developer Tools (F12)
2. Vào tab Console
3. Tìm các log:
   - `Notification sent successfully for inventory creation`
   - `Notification sent successfully for inventory approve/reject`
   - `Failed to send notification: [error details]`

## Bảo Mật

- Không commit Bot Token vào Git
- Sử dụng biến môi trường cho production
- Giới hạn quyền truy cập Bot API
- Kiểm tra và validate input trước khi gửi

## Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra Bot Token có đúng không trong file `.env.local`
- Đảm bảo bot đã được kích hoạt
- Kiểm tra biến môi trường `NEXT_PUBLIC_ZALO_BOT_TOKEN`

### Lỗi 400 Bad Request
- Kiểm tra Chat ID có đúng không trong file `.env.local`
- Đảm bảo bot đã được thêm vào chat
- Kiểm tra biến môi trường `NEXT_PUBLIC_ZALO_CHAT_ID`

### Không nhận được thông báo
- Kiểm tra file `.env.local` có tồn tại không
- Kiểm tra `NEXT_PUBLIC_NOTIFICATION_ENABLED=true`
- Kiểm tra các loại thông báo có được bật không
- Kiểm tra network connection
- Mở Developer Console để xem warning về cấu hình

### Biến môi trường không được load
- Đảm bảo file `.env.local` ở thư mục root của project
- Khởi động lại ứng dụng sau khi thay đổi `.env.local`
- Kiểm tra tên biến có đúng prefix `NEXT_PUBLIC_` không
- Kiểm tra không có khoảng trắng thừa trong file `.env.local`

### Debug cấu hình
Mở Developer Console (F12) và kiểm tra:
- Có warning về missing environment variables không
- Giá trị của `NOTIFICATION_CONFIG` trong console
