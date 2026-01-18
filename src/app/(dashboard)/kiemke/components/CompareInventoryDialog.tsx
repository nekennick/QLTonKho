'use client';

import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, Plus, TrendingUp, TrendingDown, Package, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { KiemKeItem } from '../types/kiemke';
import { CompareResult, ChangeType, InventorySession } from '../types/compare';
import { formatNumber } from '../utils/kiemKeUtils';

interface CompareInventoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session1: InventorySession | null; // Lần kiểm kê cũ hơn
    session2: InventorySession | null; // Lần kiểm kê mới hơn
    onUpdateOutOfStock?: (maVTList: string[]) => Promise<void>;
    hasPricePermission: boolean;
}

export function CompareInventoryDialog({
    open,
    onOpenChange,
    session1,
    session2,
    onUpdateOutOfStock,
    hasPricePermission,
}: CompareInventoryDialogProps) {
    const [activeFilter, setActiveFilter] = useState<ChangeType | 'all'>('all');
    const [search, setSearch] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // So sánh 2 lần kiểm kê
    const compareResults = useMemo<CompareResult[]>(() => {
        if (!session1 || !session2) return [];

        const results: CompareResult[] = [];
        const session1Map = new Map<string, KiemKeItem>();
        const session2Map = new Map<string, KiemKeItem>();

        // Build maps theo MaVT
        session1.items.forEach(item => {
            if (item.MaVT) {
                session1Map.set(item.MaVT, item);
            }
        });

        session2.items.forEach(item => {
            if (item.MaVT) {
                session2Map.set(item.MaVT, item);
            }
        });

        // Duyệt qua tất cả mã VT từ cả 2 lần
        const allMaVT = new Set([...session1Map.keys(), ...session2Map.keys()]);

        allMaVT.forEach(maVT => {
            const item1 = session1Map.get(maVT);
            const item2 = session2Map.get(maVT);

            const sl1 = item1 ? Number(item1.SoLuong) || 0 : null;
            const sl2 = item2 ? Number(item2.SoLuong) || 0 : null;

            let changeType: ChangeType;
            let difference = 0;

            if (sl1 !== null && sl2 === null) {
                // Có ở lần 1, không có ở lần 2 => Hết
                changeType = 'out_of_stock';
                difference = -sl1;
            } else if (sl1 === null && sl2 !== null) {
                // Không có ở lần 1, có ở lần 2 => Mới
                changeType = 'new_item';
                difference = sl2;
            } else if (sl1 !== null && sl2 !== null) {
                difference = sl2 - sl1;
                if (difference > 0) {
                    changeType = 'increased';
                } else if (difference < 0) {
                    changeType = 'decreased';
                } else {
                    changeType = 'unchanged';
                }
            } else {
                return; // Không có ở cả 2 lần (không thể xảy ra)
            }

            results.push({
                MaVT: maVT,
                TenVT: item2?.TenVT || item1?.TenVT || '',
                NhomVT: item2?.NhomVT || item1?.NhomVT,
                ĐVT: item2?.ĐVT || item1?.ĐVT,
                slLan1: sl1,
                slLan2: sl2,
                changeType,
                difference,
            });
        });

        // Sắp xếp: Hết trước, rồi Mới, rồi Giảm, rồi Tăng
        const order: Record<ChangeType, number> = {
            out_of_stock: 0,
            new_item: 1,
            decreased: 2,
            increased: 3,
            unchanged: 4,
        };

        return results.sort((a, b) => order[a.changeType] - order[b.changeType]);
    }, [session1, session2]);

    // Đếm số lượng theo loại
    const counts = useMemo(() => {
        return {
            all: compareResults.length,
            out_of_stock: compareResults.filter(r => r.changeType === 'out_of_stock').length,
            new_item: compareResults.filter(r => r.changeType === 'new_item').length,
            increased: compareResults.filter(r => r.changeType === 'increased').length,
            decreased: compareResults.filter(r => r.changeType === 'decreased').length,
        };
    }, [compareResults]);

    // Lọc theo filter và search
    const filteredResults = useMemo(() => {
        let results = compareResults;

        if (activeFilter !== 'all') {
            results = results.filter(r => r.changeType === activeFilter);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            results = results.filter(r =>
                r.MaVT.toLowerCase().includes(searchLower) ||
                r.TenVT.toLowerCase().includes(searchLower)
            );
        }

        return results;
    }, [compareResults, activeFilter, search]);

    // Cập nhật tất cả món hết về 0
    const handleUpdateAllOutOfStock = async () => {
        if (!onUpdateOutOfStock) return;

        const outOfStockItems = compareResults.filter(r => r.changeType === 'out_of_stock');
        if (outOfStockItems.length === 0) {
            toast.warning('Không có món nào cần cập nhật!');
            return;
        }

        setIsUpdating(true);
        try {
            await onUpdateOutOfStock(outOfStockItems.map(r => r.MaVT));
            toast.success(`Đã cập nhật ${outOfStockItems.length} món về SL = 0`);
        } catch (error) {
            toast.error('Có lỗi khi cập nhật!');
        } finally {
            setIsUpdating(false);
        }
    };

    const getChangeTypeBadge = (changeType: ChangeType, difference: number) => {
        switch (changeType) {
            case 'out_of_stock':
                return <Badge className="bg-red-500 text-white">🔴 Hết</Badge>;
            case 'new_item':
                return <Badge className="bg-green-500 text-white">🟢 Mới</Badge>;
            case 'increased':
                return <Badge className="bg-blue-500 text-white">📈 +{formatNumber(difference)}</Badge>;
            case 'decreased':
                return <Badge className="bg-orange-500 text-white">📉 {formatNumber(difference)}</Badge>;
            default:
                return <Badge variant="secondary">Không đổi</Badge>;
        }
    };

    if (!session1 || !session2) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Package className="w-6 h-6 text-blue-600" />
                        So sánh kiểm kê
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        So sánh: <strong>{session1.date}</strong> → <strong>{session2.date}</strong>
                    </p>
                </DialogHeader>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 py-3 border-b">
                    <Button
                        variant={activeFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('all')}
                    >
                        Tất cả ({counts.all})
                    </Button>
                    <Button
                        variant={activeFilter === 'out_of_stock' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('out_of_stock')}
                        className={activeFilter === 'out_of_stock' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Hết ({counts.out_of_stock})
                    </Button>
                    <Button
                        variant={activeFilter === 'new_item' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('new_item')}
                        className={activeFilter === 'new_item' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Mới ({counts.new_item})
                    </Button>
                    <Button
                        variant={activeFilter === 'increased' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('increased')}
                        className={activeFilter === 'increased' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Tăng ({counts.increased})
                    </Button>
                    <Button
                        variant={activeFilter === 'decreased' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('decreased')}
                        className={activeFilter === 'decreased' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                        <TrendingDown className="w-4 h-4 mr-1" />
                        Giảm ({counts.decreased})
                    </Button>
                </div>

                {/* Search & Actions */}
                <div className="flex gap-3 py-3">
                    <Input
                        placeholder="Tìm theo mã VT hoặc tên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    {hasPricePermission && counts.out_of_stock > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleUpdateAllOutOfStock}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Đang cập nhật...' : `Cập nhật ${counts.out_of_stock} món về SL = 0`}
                        </Button>
                    )}
                </div>

                {/* Results Table */}
                <div className="flex-1 overflow-auto border rounded-md">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/95 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium">STT</th>
                                <th className="px-3 py-2 text-left font-medium">Mã VT</th>
                                <th className="px-3 py-2 text-left font-medium">Tên VT</th>
                                <th className="px-3 py-2 text-center font-medium">SL Lần 1<br /><span className="text-xs text-muted-foreground">{session1.date}</span></th>
                                <th className="px-3 py-2 text-center font-medium">SL Lần 2<br /><span className="text-xs text-muted-foreground">{session2.date}</span></th>
                                <th className="px-3 py-2 text-center font-medium">Thay đổi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.length > 0 ? (
                                filteredResults.map((result, index) => (
                                    <tr
                                        key={result.MaVT}
                                        className={`border-b hover:bg-muted/50 ${result.changeType === 'out_of_stock' ? 'bg-red-50' :
                                                result.changeType === 'new_item' ? 'bg-green-50' : ''
                                            }`}
                                    >
                                        <td className="px-3 py-2 text-center">{index + 1}</td>
                                        <td className="px-3 py-2 font-mono text-xs">{result.MaVT}</td>
                                        <td className="px-3 py-2">{result.TenVT}</td>
                                        <td className="px-3 py-2 text-center">
                                            {result.slLan1 !== null ? formatNumber(result.slLan1) : '-'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {result.slLan2 !== null ? formatNumber(result.slLan2) : '-'}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {getChangeTypeBadge(result.changeType, result.difference)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                                        Không có dữ liệu phù hợp
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                        Hiển thị {filteredResults.length} / {compareResults.length} mục
                    </p>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
