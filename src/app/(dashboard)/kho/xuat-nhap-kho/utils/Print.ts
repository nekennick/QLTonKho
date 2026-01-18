/**
 * Enhanced print utility functions for warehouse management
 */

/**
 * Generate HTML template for warehouse receipt/issue voucher
 * @param {Object} formData - Form data containing voucher information
 * @param {Array} warehouseDetails - Array of warehouse detail items
 * @param {Object} options - Print options
 * @returns {string} HTML template string
 */
export const generateWarehousePrintTemplate = (formData: any, warehouseDetails: any[], options: any = {}) => {
    const {
        showCompanyInfo = true,
        showSignatures = true,
        showTotals = true,
        paperSize = 'A4'
    } = options;

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('vi-VN');

    // Calculate totals
    const totalItems = warehouseDetails?.length || 0;
    const totalQuantity = warehouseDetails?.reduce((sum, item) => 
        sum + (parseFloat(item['SỐ LƯỢNG THỰC TẾ']) || parseFloat(item['SỐ LƯỢNG YÊU CẦU']) || 0), 0) || 0;
    const totalAmount = warehouseDetails?.reduce((sum, item) => 
        sum + (parseFloat(item['THÀNH TIỀN']) || 0), 0) || 0;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Phiếu ${formData?.['LOẠI PHIẾU'] || 'Nhập Xuất Kho'} Vật Tư-Thiết Bị Thi Công</title>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: ${paperSize};
                    margin: 1cm;
                }
                
                body { 
                    font-family: "Times New Roman", serif; 
                    margin: 0; 
                    padding: 0; 
                    font-size: 12px;
                    line-height: 1.4;
                    color: #000;
                }
                
                .container {
                    max-width: 100%;
                    margin: 0 auto;
                }
                
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                
                .company-info {
                    flex: 1;
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                }
                
                .company-details {
                    flex: 1;
                }
                
                .company-name {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 5px;
                    text-transform: uppercase;
                }
                
                .company-address {
                    font-size: 11px;
                    margin-bottom: 3px;
                }
                
                .mst {
                    font-size: 11px;
                    font-weight: bold;
                }
                
                .national-info {
                    text-align: right;
                    flex: 1;
                }
                
                .national-motto {
                    font-weight: bold;
                    font-size: 13px;
                    margin-bottom: 5px;
                }
                
                .slogan {
                    font-size: 11px;
                    margin-bottom: 10px;
                }
                
                .separator {
                    font-size: 16px;
                    margin: 10px 0;
                }
                
                .logo {
                    width: 60px;
                    height: 60px;
                    border: 0.5px solid #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 18px;
                    margin: 10px 0;
                }
                
                .document-title {
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0;
                    text-transform: uppercase;
                    page-break-inside: avoid;
                }
                
                .form-section {
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
                
                .form-row {
                    display: flex;
                    margin-bottom: 8px;
                    padding-bottom: 5px;
                }
                
                .form-label {
                    width: 200px;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                
                .form-value {
                    flex: 1;
                    min-height: 20px;
                    padding-left: 10px;
                }
                
                .table-container {
                    margin: 20px 0;
                    page-break-inside: avoid;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 0.5px solid #000;
                    margin-bottom: 20px;
                }
                
                th {
                    border: 0.5px solid #000;
                    padding: 8px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 11px;
                }
                
                td {
                    border: 0.5px solid #000;
                    padding: 8px;
                    text-align: center;
                    font-size: 11px;
                    height: 30px;
                }
                
                .total-row {
                    font-weight: bold;
                }
                
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                    page-break-inside: avoid;
                }
                
                .signature-block {
                    text-align: center;
                    width: 200px;
                }
                
                .signature-label {
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                
                .signature-line {
                    border-bottom: 0.5px solid #000;
                    height: 40px;
                    margin-bottom: 5px;
                }
                
                .signature-note {
                    font-size: 10px;
                    font-style: italic;
                }
                
                .summary {
                    padding: 15px;
                    margin: 20px 0;
                    page-break-inside: avoid;
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                
                .summary-label {
                    font-weight: bold;
                }
                
                .summary-value {
                    font-weight: bold;
                }
                
                @media print {
                    body { 
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                ${showCompanyInfo ? `
                <div class="header">
                    <div class="company-info">
                        <div class="logo">NZ</div>
                        <div class="company-details">
                            <div class="company-name">TÊN CÔNG TY</div>
                            <div class="company-address">Địa chỉ: </div>
                            <div class="mst">MST: </div>
                        </div>
                    </div>
                    <div class="national-info">
                        <div class="national-motto">Cộng Hoà Xã Hội Chủ Nghĩa Việt Nam</div>
                        <div class="slogan">Độc Lập- Tự Do- Hạnh Phúc</div>
                        <div class="separator">***</div>
                    </div>
                </div>
                ` : ''}

                <div class="document-title">
                     ${(formData?.['LOẠI PHIẾU'] || 'NHẬP XUẤT KHO').toUpperCase()}  KHO
                </div>

                <div class="form-section">
                    <div class="form-row">
                        <div class="form-label">Mã phiếu:</div>
                        <div class="form-value">${formData?.['MÃ PHIẾU'] || ''}</div>
                    </div>
                    <div class="form-row">
                        <div class="form-label">Người tạo phiếu:</div>
                        <div class="form-value">${formData?.['NHÂN VIÊN ĐỀ NGHỊ'] || ''}</div>
                    </div>
                    <div class="form-row">
                        <div class="form-label">Ngày ${formData?.['LOẠI PHIẾU'] === 'Phiếu nhập' ? 'nhập' : 'xuất'} hàng:</div>
                        <div class="form-value">${formData?.['NGÀY'] ? new Date(formData['NGÀY']).toLocaleDateString('vi-VN') : formattedDate}   ${formData?.['GIỜ'] || ''}</div>
                    </div>
                  
                   
                   
                    <div class="form-row">
                        <div class="form-label">${formData?.['LOẠI PHIẾU'] === 'Phiếu nhập' ? 'Nhập từ:' : 'Xuất từ:'}</div>
                        <div class="form-value">${formData?.['TỪ'] || ''}</div>
                    </div>
                    <div class="form-row">
                        <div class="form-label">${formData?.['LOẠI PHIẾU'] === 'Phiếu nhập' ? 'Nhập đến:' : 'Xuất đến:'}</div>
                        <div class="form-value">${formData?.['ĐẾN'] || ''}</div>
                    </div>
                    ${formData?.['GHI CHÚ'] ? `
                    <div class="form-row">
                        <div class="form-label">Ghi chú:</div>
                        <div class="form-value">${formData['GHI CHÚ']}</div>
                    </div>
                    ` : ''}
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 5%;">STT</th>
                                <th style="width: 15%;">Mã VTTB</th>
                                <th style="width: 30%;">Tên Vật Tư- Thiết Bị</th>
                                <th style="width: 8%;">ĐVT</th>
                                <th style="width: 12%;">Số lượng</th>
                                <th style="width: 15%;">Đơn giá</th>
                                <th style="width: 15%;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${warehouseDetails?.map((detail, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${detail['MÃ VẬT TƯ'] || ''}</td>
                                    <td>${detail['TÊN VẬT TƯ'] || ''}</td>
                                    <td>${detail['ĐƠN VỊ TÍNH'] || ''}</td>
                                    <td>${detail['SỐ LƯỢNG THỰC TẾ'] || detail['SỐ LƯỢNG YÊU CẦU'] || ''}</td>
                                    <td class="text-right">${parseFloat(detail['ĐƠN GIÁ'] || 0).toLocaleString('vi-VN')}</td>
                                    <td class="text-right">${parseFloat(detail['THÀNH TIỀN'] || 0).toLocaleString('vi-VN')}</td>
                                </tr>
                            `).join('') || ''}
                        </tbody>
                    </table>
                </div>

                ${showTotals ? `
                <div class="summary">
                    <div class="summary-row">
                        <span class="summary-label">Tổng số mặt hàng:</span>
                        <span class="summary-value">${totalItems}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Tổng số lượng:</span>
                        <span class="summary-value">${totalQuantity.toLocaleString('vi-VN')}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Tổng thành tiền:</span>
                        <span class="summary-value">${totalAmount.toLocaleString('vi-VN')}</span>
                    </div>
                </div>
                ` : ''}

                ${showSignatures ? `
                <div class="signatures">
                    <div class="signature-block">
                        <div class="signature-label">NGƯỜI ĐỀ NGHỊ</div>
                        <div class="signature-line"></div>
                        <div class="signature-note">(Ký, ghi rõ họ tên)</div>
                    </div>
                    <div class="signature-block">
                        <div class="signature-label">THỦ KHO</div>
                        <div class="signature-line"></div>
                        <div class="signature-note">(Ký, ghi rõ họ tên)</div>
                    </div>
                    <div class="signature-block">
                        <div class="signature-label">KẾ TOÁN</div>
                        <div class="signature-line"></div>
                        <div class="signature-note">(Ký, ghi rõ họ tên)</div>
                    </div>
                </div>
                ` : ''}
            </div>
        </body>
        </html>
    `;
};

/**
 * Open print window with the generated template
 * @param {string} printContent - HTML content to print
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @param {Object} options - Print options
 */
export const openPrintWindow = (printContent: string, onSuccess?: (message: string) => void, onError?: (error: string) => void, options: any = {}) => {
    try {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            onError?.('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.');
            return;
        }
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load before printing
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                onSuccess?.('Đã mở cửa sổ in phiếu');
            }, 500);
        };
        
        // Handle print dialog close
        printWindow.onafterprint = () => {
            printWindow.close();
        };
        
    } catch (error) {
        onError?.(`Lỗi khi in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Generate print template for product list
 * @param {Array} products - Array of products
 * @param {Object} options - Print options
 * @returns {string} HTML template string
 */
export const generateProductListTemplate = (products: any[], options: any = {}) => {
    const {
        title = 'Danh sách sản phẩm',
        showImages = false,
        showPrices = true
    } = options;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <meta charset="UTF-8">
            <style>
                @page { size: A4; margin: 1cm; }
                body { font-family: "Times New Roman", serif; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 0.5px solid #000; padding: 8px; text-align: left; }
                th { font-weight: bold; }
                .header { text-align: center; margin-bottom: 20px; }
                .title { font-size: 18px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">${title}</div>
                <div>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã vật tư</th>
                        <th>Tên vật tư</th>
                        <th>Loại VT</th>
                        <th>ĐVT</th>
                        ${showPrices ? '<th>Đơn giá</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${products?.map((product, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${product['MÃ VẬT TƯ'] || ''}</td>
                            <td>${product['TÊN VẬT TƯ'] || ''}</td>
                            <td>${product['LOẠI VT'] || ''}</td>
                            <td>${product['ĐVT'] || ''}</td>
                            ${showPrices ? `<td>${parseFloat(product['ĐƠN GIÁ'] || 0).toLocaleString('vi-VN')}</td>` : ''}
                        </tr>
                    `).join('') || ''}
                </tbody>
            </table>
        </body>
        </html>
    `;
};

/**
 * Download HTML content as file
 * @param {string} content - HTML content
 * @param {string} filename - Filename
 */
export const downloadHTML = (content: string, filename: string = 'document.html') => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export default {
    generateWarehousePrintTemplate,
    openPrintWindow,
    generateProductListTemplate,
    downloadHTML
};
