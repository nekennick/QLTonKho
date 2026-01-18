# Mobile View cho Duyệt Phiếu

## Tổng quan

Module duyệt phiếu đã được tối ưu hóa để tự động chuyển đổi giữa giao diện desktop và mobile, giúp người dùng có thể duyệt phiếu xuất nhập kho một cách dễ dàng trên điện thoại.

## Tính năng chính

### 🔄 Tự động chuyển đổi
- **Desktop**: Giao diện bảng với thống kê và bộ lọc đầy đủ
- **Mobile**: Giao diện card với navigation tab và thống kê tối ưu

### 📱 Giao diện Mobile tối ưu

#### 1. **Thống kê thông minh**
- Hiển thị tổng quan: Tổng phiếu, Chờ duyệt, Đã duyệt, Từ chối
- Cảnh báo ưu tiên khi có nhiều phiếu chờ duyệt

#### 2. **Navigation Tab**
- **Tất cả**: Hiển thị tất cả phiếu
- **Chờ duyệt**: Chỉ hiển thị phiếu cần xử lý
- **Đã duyệt**: Phiếu đã được duyệt
- **Từ chối**: Phiếu bị từ chối

#### 3. **Tìm kiếm và bộ lọc**
- Tìm kiếm theo mã phiếu, nhân viên, kho
- Bộ lọc theo loại phiếu (Nhập/Xuất)
- Bộ lọc theo trạng thái
- Xóa bộ lọc nhanh chóng

#### 4. **Card hiển thị phiếu**
- Thông tin đầy đủ: Mã phiếu, nhân viên, kho, địa chỉ
- Badge trạng thái và loại phiếu với màu sắc phân biệt
- Ngày tạo phiếu
- Ghi chú (nếu có)

#### 5. **Thao tác nhanh**
- **Xem chi tiết**: Mở dialog xem đầy đủ thông tin
- **In phiếu**: In phiếu xuất nhập
- **Chỉnh sửa**: Sửa phiếu chưa duyệt (mở tab mới)
- **Duyệt**: Duyệt phiếu với ghi chú
- **Từ chối**: Từ chối phiếu với lý do

### 🎯 Tính năng nổi bật

#### **Thống kê thông minh**
- Hiển thị số liệu trực quan với icon
- Cảnh báo khi có quá nhiều phiếu chờ duyệt
- Thanh tiến độ xử lý với phần trăm
- Theo dõi hiệu suất làm việc

#### **Card tối ưu**
- Layout compact phù hợp màn hình nhỏ
- Thông tin được sắp xếp logic
- Badge màu sắc phân biệt trạng thái
- Actions button dễ nhấn

#### **Navigation trực quan**
- Tab navigation với số lượng phiếu
- Chuyển đổi nhanh giữa các trạng thái
- Focus vào phiếu cần xử lý

#### **Responsive Design**
- Tự động phát hiện thiết bị mobile (< 768px)
- Giao diện tối ưu cho touch screen
- Kích thước phù hợp với màn hình nhỏ
- Navigation dễ sử dụng

## Cách sử dụng

### Trên Desktop
- Giao diện bảng truyền thống với thống kê đầy đủ
- Bộ lọc và tìm kiếm nâng cao
- Tất cả tính năng hiển thị cùng lúc

### Trên Mobile
1. **Xem thống kê**: Kiểm tra tình hình tổng quan
2. **Chọn tab**: Chuyển đổi giữa các trạng thái phiếu
3. **Tìm kiếm**: Sử dụng bộ lọc để tìm phiếu cụ thể
4. **Xem chi tiết**: Nhấn "Xem chi tiết" để xem đầy đủ
5. **Duyệt/Từ chối**: Thực hiện thao tác với ghi chú
6. **In phiếu**: In phiếu khi cần thiết

## Cấu trúc file

```
components/
├── MobileApprovalForm.tsx      # Component chính cho mobile
├── MobileApprovalCard.tsx      # Card hiển thị phiếu
├── MobileApprovalStats.tsx     # Thống kê thông minh
├── ApprovalDialog.tsx          # Dialog duyệt/từ chối
└── InventoryDetailDialog.tsx   # Dialog xem chi tiết
```

## Tích hợp

### Trong page.tsx
```typescript
import { useMobileDetection } from '../xuat-nhap-kho/hooks/useMobileDetection';
import MobileApprovalForm from './components/MobileApprovalForm';

export default function DuyetPhieuPage() {
  const { isMobile } = useMobileDetection();
  
  // Render mobile view if on mobile device
  if (isMobile) {
    return <MobileApprovalForm {...props} />;
  }
  
  // Render desktop view
  return <DesktopView {...props} />;
}
```

### Hook useMobileDetection
```typescript
const { isMobile, isTablet, isDesktop, screenWidth } = useMobileDetection();
```

## Lợi ích

### 🚀 **Trải nghiệm người dùng**
- Giao diện thân thiện với mobile
- Navigation trực quan với tab
- Thao tác nhanh chóng

### ⚡ **Hiệu suất**
- Tự động phát hiện thiết bị
- Chỉ load component cần thiết
- Responsive design mượt mà

### 🎨 **Thiết kế**
- UI/UX nhất quán
- Visual feedback rõ ràng
- Accessibility tốt

### 🔧 **Bảo trì**
- Code tách biệt rõ ràng
- Component tái sử dụng
- Dễ mở rộng và cập nhật

## Workflow duyệt phiếu

### 1. **Kiểm tra thống kê**
- Xem tổng quan tình hình
- Phát hiện phiếu cần xử lý gấp
- Theo dõi tiến độ làm việc

### 2. **Lọc phiếu cần duyệt**
- Chuyển sang tab "Chờ duyệt"
- Sử dụng tìm kiếm nếu cần
- Xem danh sách phiếu ưu tiên

### 3. **Xem chi tiết phiếu**
- Nhấn "Xem chi tiết" trên card
- Kiểm tra thông tin đầy đủ
- Xem danh sách vật tư

### 4. **Thực hiện duyệt**
- **Duyệt**: Nhấn nút xanh, thêm ghi chú
- **Từ chối**: Nhấn nút đỏ, nêu lý do
- **Chỉnh sửa**: Mở tab mới để sửa

### 5. **Theo dõi kết quả**
- Chuyển sang tab "Đã duyệt" hoặc "Từ chối"
- Kiểm tra phiếu đã xử lý
- In phiếu khi cần thiết

## Tương lai

- [ ] Push notifications cho phiếu mới
- [ ] Batch approval (duyệt nhiều phiếu cùng lúc)
- [ ] Offline support
- [ ] Voice notes cho ghi chú
- [ ] Camera scan barcode
- [ ] Dark mode

---

**Lưu ý**: Tính năng này hoạt động tự động, không cần cấu hình thêm. Hệ thống sẽ tự động phát hiện thiết bị mobile và chuyển sang giao diện tương ứng.
