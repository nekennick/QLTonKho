/**
 * Utility functions for sending notifications via Zalo Bot API
 */

export interface ZaloBotConfig {
  botToken: string;
  chatId: string;
}

export interface NotificationMessage {
  text: string;
  photo?: string;
  caption?: string;
}

/**
 * Send text message via Zalo Bot API (using Next.js API route to avoid CORS)
 */
export async function sendZaloMessage(
  config: ZaloBotConfig,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/zalo/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        botToken: config.botToken,
        chatId: config.chatId,
        message: message
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send Zalo message:', response.status, errorData.error);
      return false;
    }

    const result = await response.json();
    console.log('Zalo message sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending Zalo message:', error);
    return false;
  }
}

/**
 * Send photo with caption via Zalo Bot API (using Next.js API route to avoid CORS)
 */
export async function sendZaloPhoto(
  config: ZaloBotConfig,
  photoUrl: string,
  caption?: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/zalo/send-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        botToken: config.botToken,
        chatId: config.chatId,
        photoUrl: photoUrl,
        caption: caption || ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send Zalo photo:', response.status, errorData.error);
      return false;
    }

    const result = await response.json();
    console.log('Zalo photo sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending Zalo photo:', error);
    return false;
  }
}

/**
 * Generate notification message for inventory slip creation
 */
export function generateInventoryCreationMessage(
  slipCode: string,
  slipType: 'import' | 'export',
  creator: string,
  fromWarehouse: string,
  toWarehouse: string,
  itemCount: number,
  totalAmount: number,
  materials?: Array<{
    code: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
  }>
): string {
  const typeText = slipType === 'import' ? 'NHẬP KHO' : 'XUẤT KHO';
  const dateTime = new Date().toLocaleString('vi-VN');
  
  let message = `📦 *CÓ PHIẾU ${typeText} MỚI*

🏷️ **Mã phiếu:** ${slipCode}
👤 **Người tạo:** ${creator}
📅 **Thời gian:** ${dateTime}
🏢 **Từ:** ${fromWarehouse}
🎯 **Đến:** ${toWarehouse}
📊 **Số mặt hàng:** ${itemCount}
💰 **Tổng tiền:** ₫${totalAmount.toLocaleString('vi-VN')}`;

  // Thêm thông tin chi tiết hàng hóa nếu có
  if (materials && materials.length > 0) {
    message += `\n\n📋 **CHI TIẾT HÀNG HÓA:**`;
    
    // Giới hạn hiển thị tối đa 5 mặt hàng để tránh tin nhắn quá dài
    const displayMaterials = materials.slice(0, 5);
    
    displayMaterials.forEach((material, index) => {
      message += `\n${index + 1}. ${material.name} (${material.code})`;
      message += `\n   📦 Số lượng: ${material.quantity} ${material.unit}`;
      message += `\n   💰 Thành tiền: ₫${material.total.toLocaleString('vi-VN')}`;
    });
    
    if (materials.length > 5) {
      message += `\n   ... và ${materials.length - 5} mặt hàng khác`;
    }
  }

  message += `\n\n✅ Phiếu đã được tạo thành công và đang chờ duyệt.`;

  return message;
}

/**
 * Generate notification message for inventory approval
 */
export function generateInventoryApprovalMessage(
  slipCode: string,
  action: 'approve' | 'reject',
  approver: string,
  notes?: string
): string {
  const actionText = action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI';
  const actionEmoji = action === 'approve' ? '✅' : '❌';
  const dateTime = new Date().toLocaleString('vi-VN');
  
  let message = `${actionEmoji} *THÔNG BÁO ${actionText} PHIẾU*

🏷️ **Mã phiếu:** ${slipCode}
👤 **Người duyệt:** ${approver}
📅 **Thời gian:** ${dateTime}`;

  if (notes) {
    message += `\n📝 **Ghi chú:** ${notes}`;
  }

  message += `\n\n${action === 'approve' ? '✅ Phiếu đã được duyệt thành công!' : '❌ Phiếu đã bị từ chối.'}`;

  return message;
}

/**
 * Convert HTML content to image URL
 * This function uses the htmlToImageService to convert HTML to image
 */
export async function convertHtmlToImageUrl(htmlContent: string): Promise<string> {
  try {
    // Import the service dynamically to avoid circular dependencies
    const { convertHtmlToImage } = await import('./htmlToImageService');
    
    // Convert HTML to image with default options
    return await convertHtmlToImage(htmlContent, {
      method: 'placeholder', // Change to 'html2canvas', 'server', or 'third-party' as needed
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });
  } catch (error) {
    console.error('Error converting HTML to image:', error);
    // Fallback to placeholder
    return 'https://placehold.co/600x400/4F46E5/FFFFFF?text=Phiếu+Xuất+Nhập+Kho';
  }
}

/**
 * Generate HTML content for inventory slip
 */
export function generateInventorySlipHtml(
  slipData: {
    slipCode: string;
    slipType: 'import' | 'export';
    creator: string;
    dateTime: string;
    fromWarehouse: string;
    toWarehouse: string;
    address: string;
    notes: string;
  },
  items: Array<{
    code: string;
    name: string;
    unit: string;
    quantity: number;
    price: number;
    total: number;
  }>
): string {
  const typeText = slipData.slipType === 'import' ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO';
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${typeText}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px; border: 1px solid #ddd; }
        .info-table .label { background-color: #f5f5f5; font-weight: bold; width: 30%; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { padding: 8px; border: 1px solid #ddd; text-align: center; }
        .items-table th { background-color: #f5f5f5; font-weight: bold; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature { text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${typeText}</div>
        <div>Mã phiếu: ${slipData.slipCode}</div>
      </div>
      
      <table class="info-table">
        <tr>
          <td class="label">Người tạo:</td>
          <td>${slipData.creator}</td>
          <td class="label">Ngày giờ:</td>
          <td>${slipData.dateTime}</td>
        </tr>
        <tr>
          <td class="label">Từ kho:</td>
          <td>${slipData.fromWarehouse}</td>
          <td class="label">Đến kho:</td>
          <td>${slipData.toWarehouse}</td>
        </tr>
        <tr>
          <td class="label">Địa chỉ:</td>
          <td colspan="3">${slipData.address}</td>
        </tr>
        <tr>
          <td class="label">Ghi chú:</td>
          <td colspan="3">${slipData.notes}</td>
        </tr>
      </table>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Mã VT</th>
            <th>Tên vật tư</th>
            <th>ĐVT</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.code}</td>
              <td>${item.name}</td>
              <td>${item.unit}</td>
              <td>${item.quantity}</td>
              <td>₫${item.price.toLocaleString('vi-VN')}</td>
              <td>₫${item.total.toLocaleString('vi-VN')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        Tổng tiền: ₫${totalAmount.toLocaleString('vi-VN')}
      </div>
      
      <div class="footer">
        <div class="signature">
          <div>Người lập phiếu</div>
          <div style="margin-top: 50px;">${slipData.creator}</div>
        </div>
        <div class="signature">
          <div>Người duyệt</div>
          <div style="margin-top: 50px;">_________________</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
