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
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  Target,
  Globe,
  Smartphone,
  Database,
  Lock,
  Sparkles,
  ArrowUpRight,
  Play
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
      color: 'from-violet-500 to-purple-500',
      glow: 'shadow-violet-500/25'
    },
    {
      icon: TrendingUp,
      title: 'Xuất nhập kho',
      description: 'Tạo và quản lý phiếu xuất nhập kho với quy trình duyệt chặt chẽ',
      color: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/25'
    },
    {
      icon: ClipboardList,
      title: 'Kiểm kê kho',
      description: 'Thực hiện kiểm kê tồn kho và theo dõi lịch sử kiểm kê',
      color: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/25'
    },
    {
      icon: BarChart3,
      title: 'Báo cáo & Thống kê',
      description: 'Báo cáo tổng quan tồn kho, xuất nhập với biểu đồ trực quan',
      color: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/25'
    },
    {
      icon: Users,
      title: 'Quản lý nhân viên',
      description: 'Quản lý thông tin nhân viên, phân quyền theo vai trò',
      color: 'from-emerald-500 to-teal-500',
      glow: 'shadow-emerald-500/25'
    },
    {
      icon: Shield,
      title: 'Bảo mật & Phân quyền',
      description: 'Hệ thống phân quyền chặt chẽ theo vai trò Admin, Quản lý, Thủ kho',
      color: 'from-indigo-500 to-violet-500',
      glow: 'shadow-indigo-500/25'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Tự động hóa',
      description: 'Tự động tính toán, tạo báo cáo và quản lý quy trình',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      icon: Target,
      title: 'Chính xác',
      description: 'Kiểm soát chặt chẽ số lượng tồn kho và giao dịch',
      color: 'from-rose-400 to-pink-500'
    },
    {
      icon: Globe,
      title: 'Linh hoạt',
      description: 'Hỗ trợ đa kho, đa người dùng với giao diện responsive',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      icon: Database,
      title: 'Tích hợp',
      description: 'Import/Export Excel, in ấn, và tích hợp với hệ thống khác',
      color: 'from-violet-400 to-purple-500'
    }
  ];

  const userRoles = [
    {
      role: 'Admin',
      description: 'Toàn quyền quản lý hệ thống',
      permissions: ['Quản lý kho', 'Duyệt phiếu', 'Kiểm kê', 'Báo cáo', 'Quản lý nhân viên'],
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      border: 'border-rose-500/30'
    },
    {
      role: 'Quản lý',
      description: 'Quản lý hoạt động kho hàng',
      permissions: ['Quản lý kho', 'Duyệt phiếu', 'Kiểm kê', 'Báo cáo'],
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      border: 'border-blue-500/30'
    },
    {
      role: 'Thủ kho',
      description: 'Thực hiện các thao tác kho hàng',
      permissions: ['Duyệt phiếu', 'Xuất nhập kho'],
      gradient: 'from-emerald-500 via-green-500 to-lime-500',
      border: 'border-emerald-500/30'
    },
    {
      role: 'Nhân viên',
      description: 'Sử dụng các chức năng cơ bản',
      permissions: ['Xem báo cáo', 'Tạo phiếu xuất nhập'],
      gradient: 'from-slate-400 via-gray-500 to-zinc-500',
      border: 'border-slate-500/30'
    }
  ];

  const stats = [
    { value: '6+', label: 'Tính năng chính', color: 'text-violet-400' },
    { value: '4', label: 'Cấp độ phân quyền', color: 'text-cyan-400' },
    { value: '100%', label: 'Responsive', color: 'text-pink-400' },
    { value: '24/7', label: 'Hỗ trợ', color: 'text-amber-400' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Main gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-full blur-[80px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">GoalKho</h1>
                <p className="text-xs text-white/40">Warehouse Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="text-white/70 hover:text-white hover:bg-white/5"
              >
                Đăng nhập
              </Button>
              <Button
                onClick={() => router.push('/login')}
                className="relative group overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0"
              >
                <span className="relative z-10 flex items-center">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-white/70">Hệ thống quản lý kho hàng hiện đại</span>
            <ArrowUpRight className="w-3 h-3 text-white/40" />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-white">Quản lý kho</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              thông minh
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            Hệ thống quản lý kho hàng toàn diện với đầy đủ tính năng từ quản lý tồn kho,
            xuất nhập kho, kiểm kê đến báo cáo thống kê chi tiết.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="relative group h-14 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0 text-lg shadow-2xl shadow-violet-500/25"
            >
              <Play className="mr-2 w-5 h-5" />
              Trải nghiệm ngay
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/guide')}
              className="h-14 px-8 border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 text-lg backdrop-blur-sm"
            >
              <CheckCircle className="mr-2 w-5 h-5" />
              Hướng dẫn sử dụng
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">
              Tính năng
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Được thiết kế với đầy đủ tính năng cần thiết cho việc quản lý kho hàng hiệu quả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative bg-white/[0.02] border-white/5 hover:border-white/10 overflow-hidden cursor-pointer transition-all duration-300"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <CardHeader className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-white transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/40 group-hover:text-white/60 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
              Lợi ích
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Lợi ích khi sử dụng
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Tối ưu hóa quy trình quản lý kho hàng với những lợi ích vượt trội
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className={`relative w-20 h-20 mx-auto mb-6`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
                  <div className={`relative w-full h-full bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-white/40">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-pink-500/10 text-pink-400 border-pink-500/20">
              Phân quyền
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Phân quyền người dùng
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Hệ thống phân quyền linh hoạt phù hợp với từng vai trò trong tổ chức
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userRoles.map((role, index) => (
              <Card
                key={index}
                className={`group relative bg-white/[0.02] ${role.border} hover:bg-white/[0.04] overflow-hidden cursor-pointer transition-all duration-300`}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`inline-flex px-4 py-1.5 rounded-full bg-gradient-to-r ${role.gradient} mx-auto mb-3`}>
                    <span className="text-sm font-semibold text-white">{role.role}</span>
                  </div>
                  <CardDescription className="text-white/50">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {role.permissions.map((permission, permIndex) => (
                      <div key={permIndex} className="flex items-center text-sm text-white/40">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
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
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-pink-600/20" />
            <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-xl" />

            {/* Content */}
            <div className="relative p-12 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-lg text-white/50 mb-8 max-w-xl mx-auto">
                Đăng nhập ngay để trải nghiệm hệ thống quản lý kho hàng hiện đại
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="h-14 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 border-0 text-lg shadow-2xl shadow-violet-500/25"
                >
                  <Lock className="mr-2 w-5 h-5" />
                  Đăng nhập ngay
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/guide')}
                  className="h-14 px-8 border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 text-lg"
                >
                  <CheckCircle className="mr-2 w-5 h-5" />
                  Xem hướng dẫn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">GoalKho</span>
              </div>
              <p className="text-white/40 text-sm">
                Hệ thống quản lý kho hàng toàn diện, hiện đại và dễ sử dụng.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Tính năng</h3>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="hover:text-white/60 cursor-pointer transition-colors">Quản lý kho hàng</li>
                <li className="hover:text-white/60 cursor-pointer transition-colors">Xuất nhập kho</li>
                <li className="hover:text-white/60 cursor-pointer transition-colors">Kiểm kê kho</li>
                <li className="hover:text-white/60 cursor-pointer transition-colors">Báo cáo thống kê</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-sm text-white/40">
                <li>Email: support@goalkho.com</li>
                <li>Hotline: 1900-xxxx</li>
                <li>Hỗ trợ 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-center text-sm text-white/30">
            <p>&copy; 2024 GoalKho. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>

      <TabDebug />
    </div>
  );
}
