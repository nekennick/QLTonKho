# 🚀 Hướng Dẫn Nhanh - Thông Báo Zalo Bot

## ⚡ Thiết Lập Nhanh (5 phút)

### 1. Tạo File .env.local
```bash
# Tạo file .env.local trong thư mục root
NEXT_PUBLIC_ZALO_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_ZALO_CHAT_ID=your_chat_id_here
NEXT_PUBLIC_NOTIFICATION_ENABLED=true
```

### 2. Lấy Bot Token
1. Vào [Zalo Developer Console](https://developers.zalo.me/)
2. Tạo bot mới
3. Copy Bot Token

### 3. Lấy Chat ID
1. Thêm bot vào chat/group
2. Gửi tin nhắn cho bot
3. Dùng API: `GET https://bot-api.zapps.me/bot<TOKEN>/getUpdates`
4. Tìm `chat_id` trong response

### 4. Khởi Động Lại App
```bash
npm run dev
```

## 🧪 Test Thông Báo

### Cách 1: Qua Giao Diện
1. Vào trang `/guide`
2. Mở section "Test Thông Báo Zalo Bot"
3. Click "Chạy tất cả test"

### Cách 2: Qua Console
```javascript
// Mở Developer Console (F12)
testNotifications.runAllNotificationTests()
```

## 📱 Thông Báo Tự Động

### ✅ Khi Tạo Phiếu
- Tự động gửi thông báo khi lưu phiếu xuất/nhập kho
- Bao gồm: tin nhắn văn bản + hình ảnh phiếu

### ✅ Khi Duyệt Phiếu
- Tự động gửi thông báo khi duyệt/từ chối phiếu
- Bao gồm: tin nhắn văn bản + hình ảnh phiếu

## 🔧 Troubleshooting

### ❌ Không nhận được thông báo
1. Kiểm tra file `.env.local` có đúng không
2. Khởi động lại app
3. Kiểm tra console có warning không
4. Test qua trang `/guide`

### ❌ Lỗi 401/400
- Kiểm tra Bot Token và Chat ID
- Đảm bảo bot đã được thêm vào chat

### ❌ Biến môi trường không load
- File `.env.local` phải ở thư mục root
- Tên biến phải có prefix `NEXT_PUBLIC_`
- Khởi động lại app sau khi sửa

## 📋 Checklist

- [ ] File `.env.local` đã tạo
- [ ] Bot Token đã điền
- [ ] Chat ID đã điền
- [ ] App đã khởi động lại
- [ ] Test thông báo thành công
- [ ] Tạo phiếu test có thông báo
- [ ] Duyệt phiếu test có thông báo

## 🎯 Kết Quả Mong Đợi

Sau khi setup xong, bạn sẽ nhận được:

1. **Thông báo tạo phiếu:**
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

2. **Thông báo duyệt phiếu:**
   ```
   ✅ THÔNG BÁO DUYỆT PHIẾU
   🏷️ Mã phiếu: NXT1758855083590
   👤 Người duyệt: Admin
   📅 Thời gian: 15/01/2024 10:30:00
   ✅ Phiếu đã được duyệt thành công!
   ```

3. **Hình ảnh phiếu** được gửi kèm

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra console (F12) để xem lỗi
2. Đọc file `src/config/README_NOTIFICATION.md` để biết chi tiết
3. Test từng bước qua trang `/guide`

---
**🎉 Chúc bạn sử dụng thành công!**
