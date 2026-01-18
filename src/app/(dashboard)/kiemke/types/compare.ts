import { KiemKeItem } from './kiemke';

export type ChangeType = 'out_of_stock' | 'new_item' | 'increased' | 'decreased' | 'unchanged';

export interface CompareResult {
    MaVT: string;
    TenVT: string;
    NhomVT?: string;
    ĐVT?: string;
    slLan1: number | null; // null = không có ở lần 1
    slLan2: number | null; // null = không có ở lần 2
    changeType: ChangeType;
    difference: number; // Chênh lệch (có thể âm)
}

export interface InventorySession {
    date: string; // Format: DD/MM/YYYY
    items: KiemKeItem[];
    totalItems: number;
}
