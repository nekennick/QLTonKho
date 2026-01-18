# Trang Duyệt Phiếu Xuất Nhập Kho

Trang quản lý phiếu cho thủ kho duyệt phiếu xuất nhập kho và in phiếu.

## Tính năng chính

### 1. Quản lý phiếu
- Xem danh sách tất cả phiếu xuất nhập kho
- Lọc phiếu theo loại (Nhập kho/Xuất kho)
- Lọc phiếu theo trạng thái (Chờ xác nhận/Đã duyệt/Từ chối)
- Tìm kiếm phiếu theo mã phiếu, nhân viên đề nghị, kho
- **Tạo phiếu mới**: Mở trang tạo phiếu xuất nhập kho trong tab mới

### 2. Duyệt phiếu
- **Duyệt phiếu**: Thủ kho có thể duyệt các phiếu đang chờ xác nhận
- **Từ chối phiếu**: Thủ kho có thể từ chối phiếu với lý do
- **Sửa phiếu**: Chỉnh sửa phiếu chưa duyệt bằng cách mở trang xuat-nhap-kho ở chế độ edit
- **Ghi chú**: Thêm ghi chú khi duyệt/từ chối phiếu
- **Lịch sử**: Theo dõi lịch sử thay đổi trạng thái phiếu với thông tin người thực hiện
- **Theo dõi người duyệt**: Lưu username của người duyệt/từ chối phiếu vào trường NhanVienKho

### 3. Xem chi tiết
- **Modal 2 tab**: Thông tin phiếu và danh sách vật tư
- Xem thông tin chi tiết của phiếu
- Xem danh sách vật tư trong phiếu với bảng chi tiết
- Hiển thị tổng số lượng và thành tiền
- Xem lịch sử xử lý phiếu với scroll
- **Xóa phiếu**: Chỉ cho phép xóa phiếu chưa duyệt

### 4. In phiếu
- In phiếu xuất nhập kho với template chuẩn
- Tái sử dụng component in từ `xuat-nhap-kho/utils/Print.ts`
- Hỗ trợ in với thông tin công ty, chữ ký, tổng tiền

### 5. Thống kê
- Hiển thị số lượng phiếu theo trạng thái
- Thống kê tổng số phiếu, phiếu chờ duyệt, đã duyệt, từ chối

### 6. API và Dữ liệu
- **Không sử dụng cache**: Luôn lấy dữ liệu mới nhất từ API
- Tự động refresh dữ liệu khi cần thiết
- Đảm bảo tính nhất quán dữ liệu

## Cấu trúc thư mục

```
duyet-phieu/
├── components/
│   ├── ApprovalDialog.tsx          # Dialog duyệt/từ chối phiếu
│   ├── InventoryDetailDialog.tsx   # Dialog xem chi tiết phiếu
│   └── index.ts                    # Export components
├── hooks/
│   └── useInventoryApproval.ts     # Hook quản lý trạng thái duyệt
├── utils/
│   ├── columns.tsx                 # Định nghĩa cột cho DataTable
│   └── constants.ts                # Constants cho trang
├── page.tsx                        # Trang chính
└── README.md                       # Tài liệu này
```

## Components tái sử dụng

### Từ xuat-nhap-kho
- `DataTable`: Bảng hiển thị danh sách phiếu
- `DataTableToolbar`: Thanh công cụ với tìm kiếm và lọc
- `Print utilities`: Chức năng in phiếu

### Components mới
- `ApprovalDialog`: Dialog duyệt/từ chối phiếu
- `InventoryDetailDialog`: Dialog xem chi tiết phiếu

## Hook tùy chỉnh

### useInventoryApproval
Quản lý trạng thái duyệt phiếu:
- `fetchInventories()`: Tải danh sách phiếu
- `fetchInventoryDetails()`: Tải chi tiết phiếu
- `approveInventory()`: Duyệt phiếu
- `rejectInventory()`: Từ chối phiếu
- `bulkApproveInventories()`: Duyệt nhiều phiếu
- `bulkRejectInventories()`: Từ chối nhiều phiếu

## Trạng thái phiếu

1. **Chờ xác nhận**: Phiếu mới tạo, chờ thủ kho duyệt
2. **Đã duyệt**: Phiếu đã được thủ kho duyệt
3. **Từ chối**: Phiếu bị thủ kho từ chối

## Quy trình duyệt

1. Nhân viên tạo phiếu xuất nhập kho
2. Phiếu có trạng thái "Chờ xác nhận"
3. Thủ kho xem danh sách phiếu chờ duyệt
4. Thủ kho xem chi tiết phiếu và vật tư
5. Thủ kho có thể:
   - **Sửa phiếu**: Mở trang xuat-nhap-kho ở chế độ edit để chỉnh sửa
   - **Duyệt phiếu**: Xác nhận phiếu với ghi chú (nếu có)
   - **Từ chối phiếu**: Từ chối phiếu với lý do
6. Hệ thống cập nhật trạng thái và lịch sử
7. Có thể in phiếu sau khi duyệt

## Tích hợp

- Sử dụng `authUtils` để gọi API
- Tích hợp với bảng `NXKHO` và `NXKHODE`
- Tái sử dụng components từ `xuat-nhap-kho`
- Sử dụng `lucide-react` icons [[memory:8594887]]
- Responsive design cho mobile và desktop
