// Hàm chuyển đổi giữa form Đăng nhập và Đăng ký
function toggleForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (formType === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

// Đường dẫn gốc tới Backend
const API_BASE_URL = 'https://spotify-m4d3.onrender.com/api/auth';

// 1. Xử lý Đăng Nhập
async function handleLogin(event) {
    event.preventDefault(); // Ngăn trình duyệt tự reload trang

    const usernameStr = document.getElementById('login-username').value;
    const passwordStr = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameStr,
                password: passwordStr
            })
        });

        const result = await response.json();

        if (response.ok && result.status === 200) {
            alert('Đăng nhập thành công!');
            // Lưu thông tin user vào Local Storage để các trang khác biết là đã đăng nhập
            localStorage.setItem('currentUser', JSON.stringify(result.data));
            
            // Chuyển hướng sang trang chủ
            window.location.href = 'index.html'; 
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi gọi API:', error);
        alert('Không thể kết nối đến máy chủ Backend. Đảm bảo Spring Boot đang chạy!');
    }
}

// 2. Xử lý Đăng Ký
async function handleRegister(event) {
    event.preventDefault();

    const usernameStr = document.getElementById('reg-username').value;
    const passwordStr = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameStr,
                password: passwordStr
            })
        });

        const result = await response.json();

        if (response.ok && result.status === 200) {
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            // Tự động chuyển về form đăng nhập, điền sẵn username
            toggleForm('login');
            document.getElementById('login-username').value = usernameStr;
            document.getElementById('login-password').value = '';
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi gọi API:', error);
        alert('Không thể kết nối đến máy chủ Backend.');
    }
}