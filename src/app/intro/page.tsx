'use client';

import React from 'react';
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
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  Target,
  Globe,
  Smartphone,
  Database,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TabDebug } from '@/components/ui/tab-browser/TabDebug';

export default function IntroPage() {
  const router = useRouter();

  const features = [
    {
      icon: Building2,
      title: 'Quản lý kho hàng',
      description: 'Quản lý thông tin kho, danh mục hàng hóa với giao diện trực quan',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      title: 'Xuất nhập kho',
      description: 'Tạo và quản lý phiếu xuất nhập kho với quy trình duyệt chặt chẽ',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: ClipboardList,
      title: 'Kiểm kê kho',
      description: 'Thực hiện kiểm kê tồn kho và theo dõi lịch sử kiểm kê',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: BarChart3,
      title: 'Báo cáo & Thống kê',
      description: 'Báo cáo tổng quan tồn kho, xuất nhập với biểu đồ trực quan',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      title: 'Quản lý nhân viên',
      description: 'Quản lý thông tin nhân viên, phân quyền theo vai trò',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Shield,
      title: 'Bảo mật & Phân quyền',
      description: 'Hệ thống phân quyền chặt chẽ theo vai trò Admin, Quản lý, Thủ kho',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Tự động hóa',
      description: 'Tự động tính toán, tạo báo cáo và quản lý quy trình'
    },
    {
      icon: Target,
      title: 'Chính xác',
      description: 'Kiểm soát chặt chẽ số lượng tồn kho và giao dịch'
    },
    {
      icon: Globe,
      title: 'Linh hoạt',
      description: 'Hỗ trợ đa kho, đa người dùng với giao diện responsive'
    },
    {
      icon: Database,
      title: 'Tích hợp',
      description: 'Import/Export Excel, in ấn, và tích hợp với hệ thống khác'
    }
  ];

  const userRoles = [
    {
      role: 'Admin',
      description: 'Toàn quyền quản lý hệ thống',
      permissions: ['Quản lý kho', 'Duyệt phiếu', 'Kiểm kê', 'Báo cáo', 'Quản lý nhân viên'],
      color: 'bg-red-100 text-red-800'
    },
    {
      role: 'Quản lý',
      description: 'Quản lý hoạt động kho hàng',
      permissions: ['Quản lý kho', 'Duyệt phiếu', 'Kiểm kê', 'Báo cáo'],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      role: 'Thủ kho',
      description: 'Thực hiện các thao tác kho hàng',
      permissions: ['Duyệt phiếu', 'Xuất nhập kho'],
      color: 'bg-green-100 text-green-800'
    },
    {
      role: 'Nhân viên',
      description: 'Sử dụng các chức năng cơ bản',
      permissions: ['Xem báo cáo', 'Tạo phiếu xuất nhập'],
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GoalKho</h1>
                <p className="text-sm text-gray-500">Hệ thống quản lý kho hàng</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="hidden sm:flex"
              >
                Đăng nhập
              </Button>
              <Button 
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                Bắt đầu ngay
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 border-blue-200">
              <Star className="w-4 h-4 mr-1" />
              Hệ thống quản lý kho hàng hiện đại
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Quản lý kho hàng
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {' '}thông minh
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Hệ thống quản lý kho hàng toàn diện với đầy đủ tính năng từ quản lý tồn kho, 
              xuất nhập kho, kiểm kê đến báo cáo thống kê chi tiết.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-3"
            >
              <Smartphone className="mr-2 w-5 h-5" />
              Trải nghiệm ngay
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/guide')}
              className="text-lg px-8 py-3"
            >
              <CheckCircle className="mr-2 w-5 h-5" />
              Hướng dẫn sử dụng
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">6+</div>
              <div className="text-sm text-gray-600">Tính năng chính</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-600">Cấp độ phân quyền</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Responsive</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Hỗ trợ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống được thiết kế với đầy đủ tính năng cần thiết cho việc quản lý kho hàng hiệu quả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Lợi ích khi sử dụng
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tối ưu hóa quy trình quản lý kho hàng với những lợi ích vượt trội
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Phân quyền người dùng
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống phân quyền linh hoạt phù hợp với từng vai trò trong tổ chức
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoles.map((role, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <Badge className={`w-fit mx-auto ${role.color}`}>
                    {role.role}
                  </Badge>
                  <CardTitle className="text-lg mt-2">{role.role}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {role.permissions.map((permission, permIndex) => (
                      <div key={permIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {permission}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Đăng nhập ngay để trải nghiệm hệ thống quản lý kho hàng hiện đại
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => router.push('/login')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              <Lock className="mr-2 w-5 h-5" />
              Đăng nhập ngay
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/guide')}
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
            >
              <CheckCircle className="mr-2 w-5 h-5" />
              Xem hướng dẫn
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">GoalKho</span>
              </div>
              <p className="text-gray-400">
                Hệ thống quản lý kho hàng toàn diện, hiện đại và dễ sử dụng.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Tính năng chính</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Quản lý kho hàng</li>
                <li>Xuất nhập kho</li>
                <li>Kiểm kê kho</li>
                <li>Báo cáo thống kê</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@goalkho.com</li>
                <li>Hotline: 1900-xxxx</li>
                <li>Hỗ trợ 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoalKho. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
      
      {/* Tab Debug - chỉ hiển thị trong development */}
      <TabDebug />
    </div>
  );
}
