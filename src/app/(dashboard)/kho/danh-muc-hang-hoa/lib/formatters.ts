export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatCurrency = (amount?: string | number | null): string => {
  if (!amount) return '0 ₫';
  
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0 ₫';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '0 ₫';
  }
};

export const formatNotes = (notes?: string | null): string => {
  if (!notes || notes.trim() === '') return 'Chưa có ghi chú';
  return notes.trim();
};

export const formatImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl || imageUrl.trim() === '') return '';
  return imageUrl.trim();
};

export const formatQuality = (quality?: string | null): string => {
  if (!quality) return 'Chưa xác định';
  return quality.trim();
};

export const formatInventoryDate = (dateString?: string | null): string => {
  if (!dateString) return 'Chưa có';
  
  try {
    // Parse date từ format "09/25/2025 00:00:00" hoặc các format khác
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Chưa có';
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Format ngày thành dd/mm/yyyy
    const formattedDate = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Tính relative time
    if (diffDays === 0) {
      return `${formattedDate} (Hôm nay)`;
    } else if (diffDays === 1) {
      return `${formattedDate} (1 ngày trước)`;
    } else if (diffDays > 1 && diffDays <= 7) {
      return `${formattedDate} (${diffDays} ngày trước)`;
    } else if (diffDays > 7 && diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${formattedDate} (${weeks} tuần trước)`;
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${formattedDate} (${months} tháng trước)`;
    } else {
      // Ngày trong tương lai
      const futureDays = Math.abs(diffDays);
      if (futureDays === 1) {
        return `${formattedDate} (Ngày mai)`;
      } else {
        return `${formattedDate} (${futureDays} ngày sau)`;
      }
    }
  } catch (error) {
    console.error('Error formatting inventory date:', error);
    return 'Chưa có';
  }
};
