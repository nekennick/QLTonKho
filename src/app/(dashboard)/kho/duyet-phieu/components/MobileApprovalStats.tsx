'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface MobileApprovalStatsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function MobileApprovalStats({
  total,
  pending,
  approved,
  rejected
}: MobileApprovalStatsProps) {

  const getPriorityStatus = () => {
    if (pending > 10) return { status: 'high', color: 'text-red-600', icon: AlertCircle };
    if (pending > 5) return { status: 'medium', color: 'text-yellow-600', icon: Clock };
    return { status: 'low', color: 'text-green-600', icon: CheckCircle };
  };

  const priority = getPriorityStatus();
  const PriorityIcon = priority.icon;

  return (
    <div className="space-y-2">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-2">
          <CardContent className="p-0">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <FileText className="h-3 w-3" />
                Tổng
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-2">
          <CardContent className="p-0">
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{pending}</div>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Chờ duyệt
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-2">
          <CardContent className="p-0">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{approved}</div>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Đã duyệt
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-2">
          <CardContent className="p-0">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{rejected}</div>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <XCircle className="h-3 w-3" />
                Từ chối
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Alert */}
      {pending > 0 && (
        <Card className="p-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PriorityIcon className={`h-4 w-4 ${priority.color}`} />
                <span className="text-sm font-medium text-gray-700">
                  {pending > 10 ? 'Cần xử lý gấp!' : 
                   pending > 5 ? 'Có phiếu chờ duyệt' : 
                   'Tình hình ổn định'}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  pending > 10 ? 'bg-red-100 text-red-800 border-red-200' :
                  pending > 5 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-green-100 text-green-800 border-green-200'
                }`}
              >
                {pending} phiếu
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
}
