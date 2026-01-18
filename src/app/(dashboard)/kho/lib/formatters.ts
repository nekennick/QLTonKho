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

export const formatAddress = (address?: string | null): string => {
  if (!address || address.trim() === '') return 'Chưa cập nhật';
  return address.trim();
};

export const formatNotes = (notes?: string | null): string => {
  if (!notes || notes.trim() === '') return 'Chưa có ghi chú';
  return notes.trim();
};

export const formatImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl || imageUrl.trim() === '') return '';
  return imageUrl.trim();
};
