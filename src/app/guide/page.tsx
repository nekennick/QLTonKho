'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Package, 
  TrendingUp, 
  ClipboardList, 
  BarChart3, 
  Users, 
  Shield, 
  CheckSquare,
  Receipt,
  History,
  ChartBar,
  UserCog,
  ArrowLeft,
  ArrowRight,
  Play,
  Download,
  Upload,
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Info,
  Lightbulb,
  Target,
  Zap,
  BookOpen,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NotificationTestPanel } from '@/components/NotificationTestPanel';

export default function GuidePage() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<string[]>(['overview']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const quickStartSteps = [
    {
      step: 1,
      title: 'Đăng nhập hệ thống',
      description: 'Sử dụng tài khoản được cấp để đăng nhập vào hệ thống',
      icon: Shield,
      details: [
        'Truy cập trang đăng nhập',
        'Nhập username và password',
        'Chọn vai trò phù hợp (Admin/Quản lý/Thủ kho/Nhân viên)',
        'Click "Đăng nhập"'
      ]
    },
    {
      step: 2,
      title: 'Khám phá giao diện',
      description: 'Làm quen với layout và các menu chính của hệ thống',
      icon: Eye,
      details: [
        'Sidebar bên trái: Menu điều hướng chính',
        'Header: Thông tin người dùng và cài đặt',
        'Main content: Nội dung chính của từng trang',
        'Responsive: Tự động điều chỉnh trên mobile'
      ]
    },
    {
      step: 3,
      title: 'Thiết lập kho hàng',
      description: 'Tạo và cấu hình các kho hàng trong hệ thống',
      icon: Building2,
      details: [
        'Vào menu "Quản lý kho hàng" > "Quản lý kho"',
        'Click "Thêm kho mới"',
        'Điền thông tin: Mã kho, Tên kho, Địa chỉ, Thủ kho',
        'Lưu thông tin kho'
      ]
    },
    {
      step: 4,
      title: 'Tạo danh mục hàng hóa',
      description: 'Thêm các sản phẩm vào danh mục hàng hóa',
      icon: Package,
      details: [
        'Vào menu "Quản lý kho hàng" > "Danh mục hàng hóa"',
        'Click "Thêm hàng hóa mới"',
        'Điền thông tin: Mã vật tư, Tên vật tư, Đơn vị tính, Giá',
        'Lưu thông tin hàng hóa'
      ]
    },
    {
      step: 5,
      title: 'Thực hiện xuất nhập kho',
      description: 'Tạo phiếu xuất nhập kho và quản lý giao dịch',
      icon: TrendingUp,
      details: [
        'Vào menu "Xuất nhập kho" > "Tạo phiếu xuất nhập"',
        'Chọn loại phiếu (Nhập kho/Xuất kho)',
        'Thêm chi tiết vật tư và số lượng',
        'Gửi phiếu để duyệt (nếu cần)'
      ]
    }
  ];

  const features = [
    {
      title: 'Quản lý kho hàng',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      sections: [
        {
          name: 'Quản lý kho',
          path: '/kho',
          description: 'Tạo, sửa, xóa thông tin kho hàng',
          steps: [
            'Truy cập menu "Quản lý kho hàng" > "Quản lý kho"',
            'Sử dụng nút "Thêm kho mới" để tạo kho',
            'Điền đầy đủ thông tin: Mã kho, Tên kho, Địa chỉ, Thủ kho',
            'Có thể thêm hình ảnh và ghi chú cho kho',
            'Sử dụng chức năng tìm kiếm và lọc để quản lý nhiều kho',
            'Export/Import Excel để quản lý hàng loạt'
          ],
          tips: [
            'Mã kho nên đặt theo quy tắc dễ nhớ (VD: KHO001, KHO002)',
            'Thông tin thủ kho giúp phân quyền và liên hệ khi cần',
            'Có thể upload hình ảnh kho để dễ nhận diện'
          ]
        },
        {
          name: 'Danh mục hàng hóa',
          path: '/kho/danh-muc-hang-hoa',
          description: 'Quản lý danh sách sản phẩm, vật tư trong kho',
          steps: [
            'Truy cập menu "Quản lý kho hàng" > "Danh mục hàng hóa"',
            'Click "Thêm hàng hóa mới" để thêm sản phẩm',
            'Điền thông tin: Mã vật tư, Tên vật tư, Đơn vị tính, Giá',
            'Có thể thêm mã QR code cho từng sản phẩm',
            'Sử dụng chức năng tìm kiếm và lọc theo nhóm hàng',
            'Import Excel để thêm hàng loạt sản phẩm'
          ],
          tips: [
            'Mã vật tư nên đặt theo quy tắc phân loại rõ ràng',
            'Đơn vị tính cần thống nhất (cái, kg, thùng, hộp...)',
            'Giá sản phẩm sẽ được sử dụng để tính thành tiền'
          ]
        }
      ]
    },
    {
      title: 'Xuất nhập kho',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      sections: [
        {
          name: 'Tạo phiếu xuất nhập',
          path: '/kho/xuat-nhap-kho',
          description: 'Tạo và quản lý phiếu xuất nhập kho',
          steps: [
            'Truy cập menu "Xuất nhập kho" > "Tạo phiếu xuất nhập"',
            'Click "Tạo phiếu mới"',
            'Chọn loại phiếu: Nhập kho hoặc Xuất kho',
            'Điền thông tin phiếu: Mã phiếu, Ngày, Địa chỉ, Ghi chú',
            'Chọn nhân viên đề nghị và nhân viên kho',
            'Thêm chi tiết vật tư: Chọn sản phẩm, nhập số lượng, chất lượng',
            'Hệ thống tự động tính thành tiền',
            'Lưu phiếu và gửi để duyệt (nếu cần)'
          ],
          tips: [
            'Mã phiếu sẽ được tự động tạo nếu không nhập',
            'Kiểm tra kỹ số lượng và chất lượng trước khi lưu',
            'Ghi chú rõ ràng giúp theo dõi và quản lý sau này'
          ]
        },
        {
          name: 'Duyệt phiếu',
          path: '/kho/duyet-phieu',
          description: 'Duyệt và quản lý phiếu xuất nhập kho',
          steps: [
            'Truy cập menu "Xuất nhập kho" > "Duyệt phiếu"',
            'Xem danh sách phiếu theo trạng thái: Chờ duyệt, Đã duyệt, Từ chối',
            'Click vào phiếu để xem chi tiết',
            'Kiểm tra thông tin phiếu và danh sách vật tư',
            'Duyệt phiếu: Click "Duyệt" và thêm ghi chú (nếu cần)',
            'Từ chối phiếu: Click "Từ chối" và nhập lý do',
            'In phiếu sau khi duyệt thành công'
          ],
          tips: [
            'Chỉ Admin, Quản lý và Thủ kho mới có quyền duyệt phiếu',
            'Kiểm tra kỹ số lượng và chất lượng trước khi duyệt',
            'Ghi chú rõ ràng khi duyệt hoặc từ chối phiếu'
          ]
        }
      ]
    },
    {
      title: 'Kiểm kê kho',
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      sections: [
        {
          name: 'Thực hiện kiểm kê',
          path: '/kho/kiem-ton',
          description: 'Thực hiện kiểm kê số lượng tồn kho thực tế',
          steps: [
            'Truy cập menu "Kiểm kê kho" > "Thực hiện kiểm kê"',
            'Chọn kho cần kiểm kê',
            'Hệ thống hiển thị danh sách sản phẩm hiện có',
            'Nhập số lượng thực tế cho từng sản phẩm',
            'Ghi chú các sản phẩm có chênh lệch',
            'Lưu kết quả kiểm kê',
            'Tạo báo cáo chênh lệch (nếu có)'
          ],
          tips: [
            'Kiểm kê nên được thực hiện định kỳ (hàng tháng/quý)',
            'Kiểm tra kỹ số lượng thực tế để đảm bảo chính xác',
            'Ghi chú rõ ràng các sản phẩm có vấn đề'
          ]
        },
        {
          name: 'Lịch sử kiểm kê',
          path: '/kho/kiem-ton/lich-su',
          description: 'Xem lịch sử các phiên kiểm kê đã thực hiện',
          steps: [
            'Truy cập menu "Kiểm kê kho" > "Lịch sử kiểm kê"',
            'Xem danh sách các phiên kiểm kê theo thời gian',
            'Click vào phiên kiểm kê để xem chi tiết',
            'So sánh số lượng sổ sách và thực tế',
            'Xem báo cáo chênh lệch của từng phiên',
            'Export báo cáo kiểm kê ra Excel'
          ],
          tips: [
            'Lưu trữ lịch sử kiểm kê để theo dõi xu hướng',
            'Phân tích chênh lệch để cải thiện quy trình',
            'Sử dụng báo cáo để đánh giá hiệu quả quản lý kho'
          ]
        }
      ]
    },
    {
      title: 'Báo cáo & Thống kê',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      sections: [
        {
          name: 'Báo cáo kho',
          path: '/kho/bao-cao-kho',
          description: 'Báo cáo tổng quan tồn kho, xuất nhập trong kỳ',
          steps: [
            'Truy cập menu "Báo cáo & Thống kê" > "Báo cáo kho"',
            'Chọn kho cần báo cáo (hoặc tất cả kho)',
            'Chọn kỳ báo cáo: Tuần, Tháng, Quý, Năm hoặc tùy chọn',
            'Xem tổng quan: Tồn đầu kỳ, Tồn cuối kỳ, Nhập/Xuất trong kỳ',
            'Xem biểu đồ: Top sản phẩm tồn kho, nhập kho, xuất kho',
            'Xem bảng chi tiết từng sản phẩm',
            'Export báo cáo ra Excel'
          ],
          tips: [
            'Báo cáo giúp theo dõi hiệu quả quản lý kho',
            'Phân tích xu hướng xuất nhập để dự báo nhu cầu',
            'Sử dụng biểu đồ để trình bày với cấp trên'
          ]
        }
      ]
    },
    {
      title: 'Quản lý nhân viên',
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      sections: [
        {
          name: 'Quản lý nhân viên',
          path: '/nhanvien',
          description: 'Quản lý thông tin nhân viên và phân quyền',
          steps: [
            'Truy cập menu "Nhân sự" > "Quản lý nhân viên"',
            'Xem danh sách tất cả nhân viên',
            'Thêm nhân viên mới: Click "Thêm nhân viên"',
            'Điền thông tin: Họ tên, Email, Số điện thoại, Phòng ban',
            'Phân quyền: Chọn vai trò (Admin/Quản lý/Thủ kho/Nhân viên)',
            'Cập nhật thông tin nhân viên khi cần',
            'Export danh sách nhân viên ra Excel'
          ],
          tips: [
            'Phân quyền chính xác để đảm bảo bảo mật',
            'Cập nhật thông tin nhân viên thường xuyên',
            'Lưu trữ thông tin liên hệ để dễ dàng tra cứu'
          ]
        }
      ]
    }
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: 'Mẹo sử dụng hiệu quả',
      tips: [
        'Sử dụng chức năng tìm kiếm và lọc để nhanh chóng tìm thông tin',
        'Import/Export Excel để quản lý dữ liệu hàng loạt',
        'Thiết lập quy tắc đặt tên mã kho, mã vật tư thống nhất',
        'Kiểm tra kỹ thông tin trước khi lưu để tránh sai sót',
        'Sử dụng ghi chú để lưu trữ thông tin quan trọng',
        'Thực hiện kiểm kê định kỳ để đảm bảo tính chính xác',
        'Xuất báo cáo thường xuyên để theo dõi hiệu quả'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Lưu ý quan trọng',
      tips: [
        'Chỉ Admin và Quản lý mới có quyền tạo, sửa, xóa kho và hàng hóa',
        'Thủ kho có quyền duyệt phiếu xuất nhập kho',
        'Nhân viên chỉ có thể tạo phiếu và xem báo cáo',
        'Luôn kiểm tra số lượng tồn kho trước khi xuất',
        'Ghi chú rõ ràng khi duyệt hoặc từ chối phiếu',
        'Backup dữ liệu thường xuyên để tránh mất thông tin',
        'Liên hệ admin khi gặp lỗi hoặc cần hỗ trợ'
      ]
    },
    {
      icon: Zap,
      title: 'Tối ưu hóa hiệu suất',
      tips: [
        'Sử dụng chức năng tìm kiếm thay vì cuộn danh sách dài',
        'Import Excel cho dữ liệu hàng loạt thay vì nhập từng mục',
        'Sử dụng bộ lọc để xem dữ liệu theo điều kiện cụ thể',
        'Xuất báo cáo định kỳ để theo dõi xu hướng',
        'Sử dụng responsive design trên mobile để làm việc linh hoạt',
        'Lưu trữ hình ảnh kho và sản phẩm để dễ nhận diện',
        'Thiết lập quy trình làm việc chuẩn cho từng vai trò'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/intro')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hướng dẫn sử dụng</h1>
                <p className="text-sm text-gray-500">GoalKho - Hệ thống quản lý kho hàng</p>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Mục lục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={openSections.includes('overview') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => toggleSection('overview')}
                >
                  {openSections.includes('overview') ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  Tổng quan
                </Button>
                <Button
                  variant={openSections.includes('quickstart') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => toggleSection('quickstart')}
                >
                  {openSections.includes('quickstart') ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  Hướng dẫn nhanh
                </Button>
                {features.map((feature, index) => (
                  <Button
                    key={index}
                    variant={openSections.includes(feature.title) ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => toggleSection(feature.title)}
                  >
                    {openSections.includes(feature.title) ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                    {feature.title}
                  </Button>
                ))}
                <Button
                  variant={openSections.includes('tips') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => toggleSection('tips')}
                >
                  {openSections.includes('tips') ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  Mẹo & Lưu ý
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Section */}
            <Collapsible open={openSections.includes('overview')} onOpenChange={() => toggleSection('overview')}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      Tổng quan hệ thống
                    </CardTitle>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Giới thiệu GoalKho</h3>
                        <p className="text-gray-600 mb-4">
                          GoalKho là hệ thống quản lý kho hàng toàn diện, được thiết kế để giúp doanh nghiệp 
                          quản lý hiệu quả hoạt động kho hàng từ cơ bản đến nâng cao.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Tính năng chính</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className={`w-8 h-8 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                              </div>
                              <span className="font-medium">{feature.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Phân quyền người dùng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-2">Admin</h4>
                            <p className="text-sm text-red-600">Toàn quyền quản lý hệ thống</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Quản lý</h4>
                            <p className="text-sm text-blue-600">Quản lý hoạt động kho hàng</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Thủ kho</h4>
                            <p className="text-sm text-green-600">Thực hiện các thao tác kho hàng</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Nhân viên</h4>
                            <p className="text-sm text-gray-600">Sử dụng các chức năng cơ bản</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Quick Start Section */}
            <Collapsible open={openSections.includes('quickstart')} onOpenChange={() => toggleSection('quickstart')}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Play className="w-5 h-5 mr-2 text-green-600" />
                      Hướng dẫn nhanh
                    </CardTitle>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {quickStartSteps.map((step, index) => (
                        <div key={index} className="flex space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                              <step.icon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">
                              Bước {step.step}: {step.title}
                            </h3>
                            <p className="text-gray-600 mb-3">{step.description}</p>
                            <ul className="space-y-1">
                              {step.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Features Sections */}
            {features.map((feature, index) => (
              <Collapsible key={index} open={openSections.includes(feature.title)} onOpenChange={() => toggleSection(feature.title)}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <feature.icon className={`w-5 h-5 mr-2 ${feature.color}`} />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        {feature.sections.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="border-l-4 border-blue-200 pl-6">
                            <h3 className="text-lg font-semibold mb-2">{section.name}</h3>
                            <p className="text-gray-600 mb-4">{section.description}</p>
                            
                            <div className="mb-4">
                              <h4 className="font-medium mb-2 flex items-center">
                                <Target className="w-4 h-4 mr-2 text-blue-600" />
                                Các bước thực hiện:
                              </h4>
                              <ol className="space-y-2">
                                {section.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start text-sm">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                                      {stepIndex + 1}
                                    </span>
                                    <span className="text-gray-700">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                                Mẹo hữu ích:
                              </h4>
                              <ul className="space-y-1">
                                {section.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="flex items-start text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Tips Section */}
            <Collapsible open={openSections.includes('tips')} onOpenChange={() => toggleSection('tips')}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                      Mẹo & Lưu ý
                    </CardTitle>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {tips.map((tip, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <tip.icon className="w-5 h-5 mr-2" />
                            {tip.title}
                          </h3>
                          <ul className="space-y-2">
                            {tip.tips.map((tipItem, tipIndex) => (
                              <li key={tipIndex} className="flex items-start text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {tipItem}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Notification Test Section */}
            <Collapsible open={openSections.includes('notification-test')} onOpenChange={() => toggleSection('notification-test')}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-purple-600" />
                      Test Thông Báo Zalo Bot
                    </CardTitle>
                    <CardDescription>
                      Kiểm tra và test hệ thống thông báo tự động qua Zalo Bot
                    </CardDescription>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <NotificationTestPanel />
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Footer CTA */}
            <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Sẵn sàng bắt đầu?</h3>
                  <p className="mb-4 opacity-90">
                    Đăng nhập ngay để trải nghiệm hệ thống quản lý kho hàng hiện đại
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => router.push('/login')}
                      className="bg-white text-blue-600 hover:bg-gray-100"
                    >
                      <Shield className="mr-2 w-4 h-4" />
                      Đăng nhập ngay
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/intro')}
                      className="border-white text-white hover:bg-white hover:text-blue-600"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Về trang chủ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
