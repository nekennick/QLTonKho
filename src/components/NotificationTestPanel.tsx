'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  sendZaloMessage, 
  sendZaloPhoto,
  generateInventoryApprovalMessage,
  generateInventoryCreationMessage,
  generateInventorySlipHtml,
  convertHtmlToImageUrl
} from '@/utils/notificationUtils';
import { NOTIFICATION_CONFIG } from '@/config/notification';
import toast from 'react-hot-toast';
import { TestTube, Send, Image, CheckCircle, XCircle } from 'lucide-react';

export function NotificationTestPanel() {
  const [testMessage, setTestMessage] = useState('Test message from GoalKho system');
  const [testSlipCode, setTestSlipCode] = useState('TEST-001');
  const [loading, setLoading] = useState(false);

  const handleTestTextMessage = async () => {
    if (!NOTIFICATION_CONFIG.ENABLED) {
      toast.error('Thông báo Zalo chưa được kích hoạt! Vui lòng cấu hình environment variables.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendZaloMessage(
        {
          botToken: NOTIFICATION_CONFIG.BOT_TOKEN,
          chatId: NOTIFICATION_CONFIG.CHAT_ID
        },
        testMessage
      );

      if (result) {
        toast.success('Gửi tin nhắn text thành công!');
      } else {
        toast.error('Gửi tin nhắn text thất bại!');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('Có lỗi xảy ra khi gửi tin nhắn test');
    } finally {
      setLoading(false);
    }
  };

  const handleTestApprovalMessage = async () => {
    if (!NOTIFICATION_CONFIG.ENABLED) {
      toast.error('Thông báo Zalo chưa được kích hoạt! Vui lòng cấu hình environment variables.');
      return;
    }

    setLoading(true);
    try {
      const message = generateInventoryApprovalMessage(
        testSlipCode,
        'approve',
        'Test Admin',
        'Test approval message'
      );

      const result = await sendZaloMessage(
        {
          botToken: NOTIFICATION_CONFIG.BOT_TOKEN,
          chatId: NOTIFICATION_CONFIG.CHAT_ID
        },
        message
      );

      if (result) {
        toast.success('Gửi thông báo duyệt phiếu thành công!');
      } else {
        toast.error('Gửi thông báo duyệt phiếu thất bại!');
      }
    } catch (error) {
      console.error('Error sending approval message:', error);
      toast.error('Có lỗi xảy ra khi gửi thông báo duyệt phiếu');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPhotoMessage = async () => {
    if (!NOTIFICATION_CONFIG.ENABLED) {
      toast.error('Thông báo Zalo chưa được kích hoạt! Vui lòng cấu hình environment variables.');
      return;
    }

    setLoading(true);
    try {
      // Generate test slip HTML
      const slipHtml = generateInventorySlipHtml(
        {
          slipCode: testSlipCode,
          slipType: 'import',
          creator: 'Test User',
          dateTime: new Date().toLocaleString('vi-VN'),
          fromWarehouse: 'Kho A',
          toWarehouse: 'Kho B',
          address: '123 Test Street',
          notes: 'Test slip for notification'
        },
        [
          {
            code: 'VT001',
            name: 'Vật tư test',
            unit: 'Cái',
            quantity: 10,
            price: 100000,
            total: 1000000
          }
        ]
      );

      // Convert to image
      const imageUrl = await convertHtmlToImageUrl(slipHtml);

      // Send photo
      const result = await sendZaloPhoto(
        {
          botToken: NOTIFICATION_CONFIG.BOT_TOKEN,
          chatId: NOTIFICATION_CONFIG.CHAT_ID
        },
        imageUrl,
        `📄 Test phiếu: ${testSlipCode}`
      );

      if (result) {
        toast.success('Gửi ảnh phiếu thành công!');
      } else {
        toast.error('Gửi ảnh phiếu thất bại!');
      }
    } catch (error) {
      console.error('Error sending photo message:', error);
      toast.error('Có lỗi xảy ra khi gửi ảnh phiếu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Panel - Zalo Notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Trạng thái cấu hình:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant={NOTIFICATION_CONFIG.ENABLED ? "default" : "destructive"}>
              {NOTIFICATION_CONFIG.ENABLED ? "Đã kích hoạt" : "Chưa kích hoạt"}
            </Badge>
            <Badge variant={NOTIFICATION_CONFIG.BOT_TOKEN ? "default" : "destructive"}>
              Bot Token: {NOTIFICATION_CONFIG.BOT_TOKEN ? "✓" : "✗"}
            </Badge>
            <Badge variant={NOTIFICATION_CONFIG.CHAT_ID ? "default" : "destructive"}>
              Chat ID: {NOTIFICATION_CONFIG.CHAT_ID ? "✓" : "✗"}
            </Badge>
          </div>
        </div>

        {/* Test Text Message */}
        <div className="space-y-3">
          <Label htmlFor="testMessage">Tin nhắn test:</Label>
          <Textarea
            id="testMessage"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Nhập tin nhắn test..."
            rows={3}
          />
          <Button 
            onClick={handleTestTextMessage} 
            disabled={loading || !NOTIFICATION_CONFIG.ENABLED}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Test Gửi Tin Nhắn Text
          </Button>
        </div>

        {/* Test Approval Message */}
        <div className="space-y-3">
          <Label htmlFor="testSlipCode">Mã phiếu test:</Label>
          <Input
            id="testSlipCode"
            value={testSlipCode}
            onChange={(e) => setTestSlipCode(e.target.value)}
            placeholder="Nhập mã phiếu test..."
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleTestApprovalMessage} 
              disabled={loading || !NOTIFICATION_CONFIG.ENABLED}
              variant="outline"
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Duyệt Phiếu
            </Button>
            <Button 
              onClick={handleTestPhotoMessage} 
              disabled={loading || !NOTIFICATION_CONFIG.ENABLED}
              variant="outline"
              className="flex-1"
            >
              <Image className="h-4 w-4 mr-2" />
              Test Gửi Ảnh
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Hướng dẫn:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Tạo file <code>.env.local</code> trong thư mục gốc</li>
            <li>Copy nội dung từ file <code>env.example</code></li>
            <li>Điền thông tin Bot Token và Chat ID thực tế</li>
            <li>Restart ứng dụng để áp dụng cấu hình mới</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}