import config from '../config/config';

class AuthUtils {
    async apiRequest(tableName: string, action: string, data: any, select: any = {}) {
        try {
            const response = await fetch(`${config.API_URL}/${tableName}/Action`, {
                method: 'POST',
                headers: {
                    'ApplicationAccessKey': config.ACCESS_KEY!,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Action: action,

                    ...select
                    ,
                    ...data
                })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    saveReturnUrl(url: string) {
        if (url && !url.includes('/login') && !url.includes('/?') && typeof window !== 'undefined') {
            localStorage.setItem('returnUrl', url);
        }
    }

    getAndClearReturnUrl() {
        if (typeof window === 'undefined') return config.ROUTES.DASHBOARD;

        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl) {
            localStorage.removeItem('returnUrl');
            return returnUrl;
        }
        return config.ROUTES.DASHBOARD;
    }

    // Trong authUtils.js
    saveAuthData(userData: any) {
        if (typeof window === 'undefined') return;

        const now = new Date();
        const expiryTime = new Date(now.getTime() + config.AUTH.TOKEN_DURATION);
        const token = 'Bearer ' + Math.random().toString(36).substring(7);

        // Lưu vào localStorage
        localStorage.setItem(config.AUTH.TOKEN_KEY, token);
        localStorage.setItem(config.AUTH.USER_DATA_KEY, JSON.stringify(userData));
        localStorage.setItem(config.AUTH.TOKEN_EXPIRY_KEY, expiryTime.toISOString());

        // Lưu vào cookie với các options đầy đủ
        const cookieValue = `authToken=${token}; expires=${expiryTime.toUTCString()}; path=/; SameSite=Strict`;
        document.cookie = cookieValue;

        // Log để debug
        console.log('Cookie set:', cookieValue);
    }
    clearAuthData() {
        if (typeof window === 'undefined') return;

        // Xóa localStorage (giữ nguyên)
        localStorage.removeItem(config.AUTH.TOKEN_KEY);
        localStorage.removeItem(config.AUTH.USER_DATA_KEY);
        localStorage.removeItem(config.AUTH.TOKEN_EXPIRY_KEY);
        localStorage.removeItem('returnUrl');

        // THÊM: Xóa cookie
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    getUserData() {
        if (typeof window === 'undefined') return null;

        const userData = localStorage.getItem(config.AUTH.USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    // Thêm method mới để lấy userData từ URL parameters hoặc localStorage
    getUserDataFromUrlOrStorage() {
        if (typeof window === 'undefined') return null;

        // Kiểm tra xem user đã đăng nhập chưa
        const isLoggedIn = this.isAuthenticated();

        if (isLoggedIn) {
            // Nếu đã đăng nhập, sử dụng getUserData()
            return this.getUserData();
        } else {
            // Nếu chưa đăng nhập, thử lấy từ tempUserData (từ URL parameters)
            const tempUserData = localStorage.getItem('tempUserData');
            if (tempUserData) {
                return JSON.parse(tempUserData);
            }
        }

        return null;
    }

    // Thêm method để kiểm tra xem user có phải từ URL parameters không
    isUserFromUrlParams() {
        if (typeof window === 'undefined') return false;

        // Kiểm tra xem user đã đăng nhập chưa
        const isLoggedIn = this.isAuthenticated();

        if (isLoggedIn) {
            // Nếu đã đăng nhập, không phải từ URL parameters
            return false;
        } else {
            // Nếu chưa đăng nhập, kiểm tra có tempUserData không
            return localStorage.getItem('tempUserData') !== null;
        }
    }

    // Thêm method để xóa tempUserData
    clearTempUserData() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('tempUserData');
    }

    isAuthenticated(currentPath?: string) {
        if (typeof window === 'undefined') return false;

        // Kiểm tra xác thực thông thường trước
        const token = localStorage.getItem(config.AUTH.TOKEN_KEY);
        const expiryTime = localStorage.getItem(config.AUTH.TOKEN_EXPIRY_KEY);
        const userData = localStorage.getItem(config.AUTH.USER_DATA_KEY);

        if (token && expiryTime && userData) {
            if (new Date() > new Date(expiryTime)) {
                this.clearAuthData();
                if (currentPath && !currentPath.includes('/?')) {
                    this.saveReturnUrl(currentPath);
                }
                return false;
            }
            return true;
        }

        // Nếu không có xác thực thông thường, kiểm tra personal route với tempUserData
        if (currentPath && currentPath.startsWith('/personal')) {
            const tempUserData = localStorage.getItem('tempUserData');
            if (tempUserData) {
                try {
                    const userData = JSON.parse(tempUserData);
                    if (userData.manv && userData.ChucVu) {
                        // Debug log cho 3 trang có vấn đề
                        if (currentPath.includes('lich-su-cham-cong') || currentPath.includes('thong-ke-san-pham-han') || currentPath.includes('thong-ke-san-pham-keo')) {
                            console.log('=== DEBUG AUTHUTILS ===');
                            console.log('Pathname:', currentPath);
                            console.log('tempUserData:', userData);
                            console.log('Returning true for personal route with URL params');
                        }
                        return true;
                    }
                } catch (error) {
                    console.error('Error parsing tempUserData:', error);
                }
            }

            // Debug log cho 3 trang có vấn đề khi không có tempUserData
            if (currentPath.includes('lich-su-cham-cong') || currentPath.includes('thong-ke-san-pham-han') || currentPath.includes('thong-ke-san-pham-keo')) {
                console.log('=== DEBUG AUTHUTILS ===');
                console.log('Pathname:', currentPath);
                console.log('No tempUserData found, returning false');
            }
        }

        // Không có xác thực hợp lệ
        if (currentPath && !currentPath.includes('/?')) {
            this.saveReturnUrl(currentPath);
        }
        return false;
    }



    async login(username: string, password: string) {
        if (!username || !password) {
            throw new Error('Vui lòng nhập đầy đủ thông tin đăng nhập!');
        }

        const result = await this.apiRequest('DSNV', 'Find', {
            Properties: {
                Selector: `Filter(DSNV, and( [username] = "${username}" , [password] = "${password}"))`
            }
        });

        if (result && Array.isArray(result) && result.length === 1) {
            const user = result[0];
            if (user.password === password) {
                this.saveAuthData(user);
                return user;
            }
        }
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng!');
    }

    logout() {
        this.clearAuthData();
        return config.ROUTES.LOGIN;
    }

    // Các method khác giữ nguyên...
    async uploadImage(file: File) {
        if (!file) {
            throw new Error('Không tìm thấy file');
        }

        if (file.size > config.UPLOAD.MAX_SIZE) {
            throw new Error(`Kích thước file không được vượt quá ${config.UPLOAD.MAX_SIZE / 1024 / 1024}MB`);
        }

        if (!config.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Định dạng file không được hỗ trợ');
        }

        try {
            const base64Image = await this.getImageAsBase64(file);

            const CLOUDINARY_CLOUD_NAME = config.CLOUD_NAME || 'duv9pccwi';
            const CLOUDINARY_UPLOAD_PRESET = config.UPLOAD_PRESET || 'poalupload';

            const formData = new FormData();
            formData.append('file', base64Image);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed: ' + response.statusText);
            }

            const data = await response.json();

            if (!data.secure_url) {
                throw new Error('Invalid response from Cloudinary');
            }

            return {
                success: true,
                url: data.secure_url,
                public_id: data.public_id,
                metadata: {
                    name: data.original_filename,
                    size: data.bytes,
                    format: data.format,
                    width: data.width,
                    height: data.height
                }
            };
        } catch (error: any) {
            console.error('Image upload failed:', error);
            throw new Error('Không thể tải ảnh lên: ' + error.message);
        }
    }

    async getImageAsBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    validateImage(file: File) {
        const errors: string[] = [];

        if (!file) {
            errors.push('Không tìm thấy file');
        }

        if (file.size > config.UPLOAD.MAX_SIZE) {
            errors.push(`Kích thước file không được vượt quá ${config.UPLOAD.MAX_SIZE / 1024 / 1024}MB`);
        }

        if (!config.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
            errors.push('Định dạng file không được hỗ trợ');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default new AuthUtils();