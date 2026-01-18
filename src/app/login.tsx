'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authUtils from '@/utils/authUtils';
import config from '@/config/config';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, User, Lock, ArrowRight, Shield, Settings, Network, Phone, Mail, MapPin, BookOpen, Globe } from 'lucide-react';
import Image from 'next/image';

const LoginPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    useEffect(() => {
        setMounted(true);

        if (authUtils.isAuthenticated()) {
            const returnUrl = searchParams.get('returnUrl') || config.ROUTES.DASHBOARD;
            router.push(returnUrl);
            return;
        }

        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl && typeof window !== 'undefined') {
            localStorage.setItem('returnUrl', returnUrl);
        }
    }, [router, searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            toast.error('Vui lòng nhập đầy đủ thông tin đăng nhập!');
            return;
        }

        setLoading(true);
        try {
            const user = await authUtils.login(formData.username, formData.password);
            console.log('Login successful:', user);

            toast.success(`Chào mừng ${user.username} quay trở lại Tồn kho ĐTB!`);

            await new Promise(resolve => setTimeout(resolve, 100));

            let returnUrl = searchParams.get('returnUrl') || config.ROUTES.DASHBOARD;

            if (returnUrl.includes('%')) {
                returnUrl = decodeURIComponent(returnUrl);
            }

            console.log('Redirecting to:', returnUrl);
            window.location.href = returnUrl;

        } catch (error: any) {
            console.error('Login error:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-teal-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 via-blue-50/30 to-teal-50 min-h-screen">
            <div className="flex min-h-screen">
                {/* Left Panel - Branding & Features - Desktop only */}
                <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                    {/* Decorative Elements */}
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-40 right-32 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
                        {/* Logo */}
                        <div className="mb-12">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 p-2">
                                    <Image
                                        src="/logo1.png"
                                        alt="NZ Logo"
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                <div className="ml-4">
                                    <h1 className="text-3xl font-bold">Tồn kho ĐTB</h1>
                                    <p className="text-blue-100 text-sm">Phần mềm quản lý kho
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Welcome Message */}
                        <div className="mb-12">
                            <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                                Quản lý kho
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-teal-300">
                                    chuyên nghiệp
                                </span>
                            </h2>
                            <p className="text-xl text-blue-100 leading-relaxed">
                                Tối ưu hóa quy trình kho, theo dõi tồn kho và quản lý hàng hóa một cách hiệu quả.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                                    <Network className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Quản lý tồn kho</h3>
                                    <p className="text-blue-100">Theo dõi và kiểm soát số lượng hàng hóa trong kho</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Quản lý xuất nhập kho</h3>
                                    <p className="text-blue-100">Kiểm soát quy trình nhập kho, xuất kho và điều chuyển</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Báo cáo thống kê</h3>
                                    <p className="text-blue-100">Phân tích hiệu suất kho và tối ưu hóa quản lý</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-12 grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-300 mb-1">1000+</div>
                                <div className="text-sm text-blue-100">Sản phẩm</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-teal-300 mb-1">Hơn 50</div>
                                <div className="text-sm text-blue-100">Kho hàng</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-300 mb-1">24/7</div>
                                <div className="text-sm text-blue-100">Giám sát</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col min-h-screen">
                    {/* Mobile Header */}
                    <div className="lg:hidden bg-gradient-to-r text-white py-4 px-6 flex-shrink-0">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 p-1">
                                <Image
                                    src="/logo1.png"
                                    alt="NZ Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Tồn kho ĐTB</h1>
                                <p className="text-blue-100 text-xs">Phần mềm quản lý kho</p>
                            </div>
                        </div>
                    </div>

                    {/* Login Content */}
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                        <div className="w-full max-w-md">
                            {/* Desktop Logo for Login Form */}
                            <div className="hidden lg:block text-center mb-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br rounded-2xl mb-4 p-3">
                                    <Image
                                        src="/logo1.png"
                                        alt="NZ Logo"
                                        width={56}
                                        height={56}
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800">Tồn kho ĐTB</h1>
                            </div>

                            {/* Login Form */}
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                                            Đăng nhập hệ thống
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            Truy cập vào hệ thống quản lý kho
                                        </p>
                                    </div>

                                    {/* Return URL Notice */}
                                    {searchParams.get('returnUrl') && (
                                        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg">
                                            <div className="flex items-center">
                                                <Shield className="w-3 h-3 mr-2" />
                                                <p className="text-xs">
                                                    <span className="font-medium">Yêu cầu xác thực:</span> Vui lòng đăng nhập
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                   

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Username */}
                                        <div>
                                            <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                                Tên đăng nhập
                                            </Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="username"
                                                    name="username"
                                                    type="text"
                                                    required
                                                    placeholder="Nhập tên đăng nhập"
                                                    className="pl-10 h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg text-sm"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                    Mật khẩu
                                                </Label>
                                                <span className="text-xs text-purple-600 font-medium">
                                                    Liên hệ Admin
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    placeholder="Nhập mật khẩu"
                                                    className="pl-10 pr-10 h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg text-sm"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remember me */}
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                                Ghi nhớ đăng nhập
                                            </label>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-10 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                                    Đang xác thực...
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    Đăng nhập
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 p-4 text-center text-xs text-gray-500 space-y-1">
                        <div className="flex items-center justify-center mb-2">
                            <Image
                                src="/logo1.png"
                                alt="Tồn kho ĐTB Logo"
                                width={16}
                                height={16}
                                className="object-contain mr-2"
                            />
                            <span className="font-medium">Tồn kho ĐTB</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>Hệ thống quản lý kho hàng</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>Demo Version - Phần mềm quản lý kho</span>
                        </div>
                        
                        {/* Quick Links */}
                        <div className="flex items-center justify-center space-x-4 mt-3">
                            <button
                                onClick={() => router.push('/intro')}
                                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <Globe className="w-3 h-3 mr-1" />
                                <span>Giới thiệu</span>
                            </button>
                            <button
                                onClick={() => router.push('/guide')}
                                className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                            >
                                <BookOpen className="w-3 h-3 mr-1" />
                                <span>Hướng dẫn</span>
                            </button>
                        </div>
                        
                        <p className="text-gray-400">© 2025 Tồn kho ĐTB V1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;