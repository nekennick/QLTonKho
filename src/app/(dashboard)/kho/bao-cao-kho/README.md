# Trang Báo Cáo Kho

Trang báo cáo kho cung cấp tổng quan chi tiết về tình hình tồn kho, xuất nhập trong kỳ và các thống kê quan trọng.

## Tính năng chính

### 1. Báo cáo tổng quan
- **Tồn đầu kỳ**: Số lượng tồn kho tại thời điểm bắt đầu kỳ báo cáo
- **Tồn cuối kỳ**: Số lượng tồn kho tại thời điểm kết thúc kỳ báo cáo
- **Nhập trong kỳ**: Tổng số lượng nhập kho trong khoảng thời gian được chọn
- **Xuất trong kỳ**: Tổng số lượng xuất kho trong khoảng thời gian được chọn
- **Giá trị tồn**: Tổng giá trị hàng hóa tồn kho

### 2. Bộ lọc và tìm kiếm
- **Chọn kho**: Lọc báo cáo theo kho cụ thể hoặc tất cả kho
- **Kỳ báo cáo**: Chọn kỳ báo cáo (tuần, tháng, quý, năm, tùy chọn)
- **Khoảng thời gian**: Tùy chỉnh ngày bắt đầu và kết thúc
- **Tìm kiếm**: Tìm kiếm theo tên hàng hóa, mã vật tư, nhóm hàng hóa

### 3. Biểu đồ trực quan
- **Biểu đồ tồn kho**: Top 10 sản phẩm có tồn kho cao nhất
- **Biểu đồ nhập kho**: Top 10 sản phẩm nhập kho nhiều nhất
- **Biểu đồ xuất kho**: Top 10 sản phẩm xuất kho nhiều nhất
- **Biểu đồ giá trị**: Top 10 sản phẩm có giá trị tồn kho cao nhất

### 4. Bảng chi tiết
- Hiển thị đầy đủ thông tin từng hàng hóa
- Sắp xếp theo các tiêu chí khác nhau
- Phân trang để dễ dàng xem dữ liệu
- Hỗ trợ responsive trên mobile

### 5. Xuất báo cáo
- Xuất báo cáo ra file Excel
- Bao gồm tất cả dữ liệu và thống kê
- Định dạng chuẩn cho báo cáo

## Cấu trúc thư mục

```
bao-cao-kho/
├── page.tsx                    # Trang chính
├── types/
│   └── warehouseReport.ts      # Định nghĩa types
├── hooks/
│   └── useWarehouseReport.ts   # Hook quản lý dữ liệu
├── components/
│   ├── index.ts               # Export components
│   ├── WarehouseReportFilters.tsx    # Bộ lọc
│   ├── WarehouseReportSummary.tsx    # Thống kê tổng quan
│   ├── WarehouseReportCharts.tsx     # Biểu đồ
│   └── WarehouseReportTable.tsx      # Bảng dữ liệu
├── utils/
│   └── reportUtils.ts         # Utilities tính toán
└── README.md                  # Tài liệu này
```

## Cách sử dụng

### 1. Truy cập trang báo cáo
- Điều hướng đến `/kho/bao-cao-kho`
- Trang sẽ tự động tải dữ liệu mới nhất

### 2. Lọc dữ liệu
- Chọn kho cần xem báo cáo (hoặc "Tất cả kho")
- Chọn kỳ báo cáo từ dropdown
- Hoặc tùy chỉnh khoảng thời gian cụ thể
- Sử dụng các nút nhanh: "Hôm qua", "Hôm nay", "7 ngày qua", "30 ngày qua"

### 3. Xem báo cáo
- **Thống kê tổng quan**: Xem các chỉ số chính ở đầu trang
- **Biểu đồ**: Chuyển đổi giữa các loại biểu đồ khác nhau
- **Bảng chi tiết**: Xem chi tiết từng hàng hóa với khả năng sắp xếp và tìm kiếm

### 4. Xuất báo cáo
- Nhấn nút "Xuất báo cáo" ở góc phải trên
- File Excel sẽ được tải về với tên `BaoCaoKho_YYYYMMDD.xlsx`

## Dữ liệu hiển thị

### Thông tin hàng hóa
- Mã vật tư (MaVT)
- Tên vật tư (TenVT)
- Nhóm vật tư (NhomVT)
- Đơn vị tính (ĐVT)
- Đơn giá

### Thông tin kho
- Mã kho (MaKho)
- Tên kho (TenKho)

### Số liệu tồn kho
- Tồn đầu kỳ
- Tồn cuối kỳ
- Tổng nhập trong kỳ
- Tổng xuất trong kỳ
- Giá trị tồn kho

### Thông tin bổ sung
- Ngày kiểm kê gần nhất
- Ghi chú
- Biến động tồn kho (tăng/giảm)

## Lưu ý quan trọng

1. **Dữ liệu thời gian thực**: Báo cáo được cập nhật theo thời gian thực từ hệ thống
2. **Quyền truy cập**: Tất cả người dùng có thể xem báo cáo, không cần quyền đặc biệt
3. **Hiệu suất**: Dữ liệu được cache để tăng tốc độ tải
4. **Responsive**: Giao diện tự động điều chỉnh cho mobile và desktop

## Tích hợp với hệ thống

Trang báo cáo kho tích hợp với:
- **Danh mục hàng hóa**: Lấy thông tin sản phẩm
- **Quản lý kho**: Lấy thông tin kho
- **Kiểm kê**: Lấy dữ liệu tồn kho
- **Xuất nhập kho**: Lấy dữ liệu giao dịch

## Mở rộng trong tương lai

- Thêm biểu đồ xu hướng theo thời gian
- Báo cáo so sánh giữa các kỳ
- Cảnh báo tồn kho thấp
- Dự báo nhu cầu
- Tích hợp với hệ thống ERP
