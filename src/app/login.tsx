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
import { Eye, EyeOff, User, Lock, ArrowRight, Shield, Sparkles, Building2, BookOpen, Globe, Network, Settings, BarChart3 } from 'lucide-react';
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
            toast.success(`Chào mừng ${user.username} quay trở lại Tồn kho ĐTB!`);
            await new Promise(resolve => setTimeout(resolve, 100));
            let returnUrl = searchParams.get('returnUrl') || config.ROUTES.DASHBOARD;
            if (returnUrl.includes('%')) {
                returnUrl = decodeURIComponent(returnUrl);
            }
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
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500/30 border-t-violet-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden flex items-center justify-center">
            {/* Animated gradient background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-full blur-[100px]" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* Main Content - Centered */}
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-12">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur-xl opacity-60" />
                            <div className="relative w-16 h-16 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center p-2">
                                <Image
                                    src="/logo1.png"
                                    alt="Logo"
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-white">Tồn kho ĐTB</h1>
                            <p className="text-white/40">Hệ thống quản lý kho hàng</p>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
                    <Card className="relative bg-white/[0.03] border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden">
                        <CardContent className="p-10">
                            {/* Header */}
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-white mb-3">
                                    Đăng nhập
                                </h2>
                                <p className="text-white/50 text-lg">
                                    Truy cập vào hệ thống quản lý kho
                                </p>
                            </div>

                            {/* Return URL Notice */}
                            {searchParams.get('returnUrl') && (
                                <div className="mb-8 p-4 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-2xl">
                                    <div className="flex items-center">
                                        <Shield className="w-5 h-5 mr-3" />
                                        <p className="text-base">
                                            <span className="font-medium">Yêu cầu xác thực:</span> Vui lòng đăng nhập để tiếp tục
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Username */}
                                <div>
                                    <Label htmlFor="username" className="block text-base font-medium text-white/70 mb-3">
                                        Tên đăng nhập
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-white/30" />
                                        </div>
                                        <Input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            placeholder="Nhập tên đăng nhập"
                                            className="pl-14 h-14 text-base bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500 focus:ring-violet-500 rounded-2xl"
                                            value={formData.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <Label htmlFor="password" className="text-base font-medium text-white/70">
                                            Mật khẩu
                                        </Label>
                                        <span className="text-sm text-violet-400 cursor-pointer hover:text-violet-300 transition-colors">
                                            Liên hệ Admin
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-white/30" />
                                        </div>
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Nhập mật khẩu"
                                            className="pl-14 pr-14 h-14 text-base bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500 focus:ring-violet-500 rounded-2xl"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-5 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-white/30 hover:text-white/60 transition-colors" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-white/30 hover:text-white/60 transition-colors" />
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
                                        className="h-5 w-5 bg-white/5 border-white/20 rounded text-violet-500 focus:ring-violet-500"
                                    />
                                    <label htmlFor="remember-me" className="ml-3 block text-base text-white/50">
                                        Ghi nhớ đăng nhập
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-lg rounded-2xl transition-all duration-200 shadow-2xl shadow-violet-500/30"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin mr-3 h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                                            Đang xác thực...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            Đăng nhập
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </div>
                                    )}
                                </Button>
                            </form>

                            {/* Features */}
                            <div className="mt-10 pt-8 border-t border-white/5">
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { icon: Network, label: 'Quản lý tồn kho', color: 'from-cyan-500 to-blue-500' },
                                        { icon: Settings, label: 'Xuất nhập kho', color: 'from-violet-500 to-purple-500' },
                                        { icon: BarChart3, label: 'Báo cáo thống kê', color: 'from-pink-500 to-rose-500' }
                                    ].map((feature, index) => (
                                        <div key={index} className="text-center group cursor-pointer">
                                            <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <feature.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors">{feature.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="text-center mt-10 space-y-4">
                    {/* Quick Links */}
                    <div className="flex items-center justify-center space-x-6">
                        <button
                            onClick={() => router.push('/intro')}
                            className="flex items-center text-white/40 hover:text-violet-400 transition-colors"
                        >
                            <Globe className="w-4 h-4 mr-2" />
                            <span>Giới thiệu</span>
                        </button>
                        <button
                            onClick={() => router.push('/guide')}
                            className="flex items-center text-white/40 hover:text-cyan-400 transition-colors"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            <span>Hướng dẫn</span>
                        </button>
                    </div>

                    <p className="text-white/20 text-sm">© 2025 Tồn kho ĐTB V1</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;