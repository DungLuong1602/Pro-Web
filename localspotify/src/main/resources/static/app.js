const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

function checkAuthentication() {
    const userStr = localStorage.getItem('currentUser');

    if (!userStr) {
        alert('Bạn cần đăng nhập để truy cập Local Spotify!');
        window.location.href = 'auth.html';
        return;
    }

    try {
        const user = JSON.parse(userStr);
        
        document.getElementById('display-username').textContent = user.username;
        
        // Chỗ này sau này có thể gọi các hàm lấy danh sách bài hát
        // loadAllSongs();
        // loadUserPlaylists(user.id);
        
    } catch (error) {
        console.error('Lỗi đọc dữ liệu người dùng:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
}

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
}

//Stream Nhạc
// function playSong(songId, songTitle, songArtist) { ... }
// function loadAllSongs() { ... }

// Tương tác & Playlist
// function likeSong(songId) { ... }
// function loadUserPlaylists(userId) { ... }