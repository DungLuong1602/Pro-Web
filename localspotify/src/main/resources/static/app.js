const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

// Sidebar navigation
function sidebarNavigate(viewId) {
    document.querySelectorAll('.nav-menu .nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
    showView(viewId);
}

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
        
        // Load songs and playlists on page load
        loadAllSongs();
        loadUserPlaylists(user.id);
        
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

function showView(viewId) {
    const views = ['home','search','library','upload'];
    views.forEach(v => {
        const el = document.getElementById('view-' + v);
        if (!el) return;
        el.style.display = (v === viewId) ? 'block' : 'none';
    });
}

function performSearch() {
    const q = document.getElementById('search-input').value.trim();
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    if (!q) {
        container.innerHTML = '<p style="color:#b3b3b3;">Nhập từ khóa để tìm kiếm.</p>';
        return;
    }
    // Placeholder: real search will call API later
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `<div class="song-cover">🎧</div><div class="song-info"><h4>Tìm: ${q}</h4><p>Kết quả giả</p></div>`;
    container.appendChild(card);
}

function uploadAudio() {
    const input = document.getElementById('file-input');
    const titleInput = document.getElementById('upload-title');
    const artistInput = document.getElementById('upload-artist');
    
    if (!input.files || input.files.length === 0) {
        alert('Vui lòng chọn tệp audio trước khi tải lên.');
        return;
    }
    
    const file = input.files[0];
    const title = titleInput.value.trim() || file.name.replace(/\.[^/.]+$/, '');
    const artist = artistInput.value.trim() || 'Unknown Artist';
    
    const formData = new FormData();
formData.append('file', file);
formData.append('title', title);
formData.append('artist', artist);

// Lấy thông tin user đang đăng nhập và gửi kèm userId
const userStr = localStorage.getItem('currentUser');
if (userStr) {
    const user = JSON.parse(userStr);
    formData.append('userId', user.id); 
}

const uploadBtn = document.querySelector('.btn-upload-submit');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Đang tải lên...';
    
    fetch(`${API_BASE_URL}/songs/upload`, {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        return res.json();
    })
    .then(data => {
        alert('Tải nhạc lên thành công!');
        input.value = '';
        titleInput.value = '';
        artistInput.value = '';
        loadAllSongs();
        sidebarNavigate('home');
    })
    .catch(err => {
        console.error('Lỗi tải lên:', err);
        alert('Lỗi tải lên: ' + err.message);
    })
    .finally(() => {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Tải lên';
    });
}

// Stream Nhạc
function loadAllSongs() {
    fetch(`${API_BASE_URL}/songs`)
        .then(res => res.json())
        .then(result => {
            const songList = document.querySelector('.song-list');
            songList.innerHTML = '';
            
            const songs = result.data; 

            if (!songs || songs.length === 0) {
                songList.innerHTML = '<p style="color:#b3b3b3;">Không có bài hát nào.</p>';
                return;
            }
            
            songs.forEach(song => {
                const card = document.createElement('div');
                card.className = 'song-card';
                card.innerHTML = `
                    <div class="song-cover">🎵</div>
                    <div class="song-info">
                        <h4>${song.title || 'Untitled'}</h4>
                        <p>${song.artist || 'Unknown Artist'}</p>
                    </div>
                    <div class="song-actions">
                        <button class="btn-action-edit" title="Sửa thông tin">✏️</button>
                        <button class="btn-action-delete" title="Xóa bài hát">🗑️</button>
                    </div>
                `;
                
                // Sự kiện click vào thẻ để phát nhạc
                card.addEventListener('click', () => playSong(song.id, song.title, song.artist));
                
                // Sự kiện click nút Sửa
                card.querySelector('.btn-action-edit').addEventListener('click', (e) => {
                    e.stopPropagation(); // Ngăn việc phát nhạc khi bấm nút này
                    editSong(song.id, song.title, song.artist);
                });

                // Sự kiện click nút Xóa
                card.querySelector('.btn-action-delete').addEventListener('click', (e) => {
                    e.stopPropagation(); // Ngăn việc phát nhạc khi bấm nút này
                    deleteSong(song.id);
                });

                songList.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Lỗi tải danh sách bài hát:', err);
            document.querySelector('.song-list').innerHTML = '<p style="color:#b3b3b3;">Lỗi tải dữ liệu.</p>';
        });
}

//Chức năng Sửa bài hát bằng hộp thoại Prompt nhanh chóng
function editSong(songId, currentTitle, currentArtist) {
    const newTitle = prompt("Nhập tên bài hát mới:", currentTitle);
    if (newTitle === null) return; // Người dùng hủy bỏ
    
    const newArtist = prompt("Nhập tên nghệ sĩ mới:", currentArtist);
    if (newArtist === null) return; // Người dùng hủy bỏ

    if (!newTitle.trim()) {
        alert("Tên bài hát không được để trống!");
        return;
    }

    const formData = new FormData();
    formData.append('title', newTitle.trim());
    formData.append('artist', newArtist.trim());

    fetch(`${API_BASE_URL}/songs/${songId}`, {
        method: 'PUT',
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error(`Cập nhật thất bại: ${res.status}`);
        return res.json();
    })
    .then(data => {
        alert('Cập nhật thông tin bài hát thành công!');
        loadAllSongs(); // Tải lại danh sách bài hát mới cập nhật
    })
    .catch(err => {
        console.error('Lỗi cập nhật bài hát:', err);
        alert('Lỗi: ' + err.message);
    });
}

// Chức năng Xóa bài hát khỏi hệ thống và ổ đĩa
function deleteSong(songId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài hát này không? Tệp âm thanh trên máy chủ cũng sẽ bị xóa.')) {
        return;
    }

    fetch(`${API_BASE_URL}/songs/${songId}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) throw new Error(`Xóa bài hát thất bại: ${res.status}`);
        return res.json();
    })
    .then(data => {
        alert('Xóa bài hát thành công!');
        loadAllSongs(); // Tải lại danh sách sau khi xóa
    })
    .catch(err => {
        console.error('Lỗi xóa bài hát:', err);
        alert('Lỗi: ' + err.message);
    });
}

function playSong(songId, songTitle, songArtist) {
    const audio = document.getElementById('main-audio');
    audio.src = `${API_BASE_URL}/songs/${songId}/stream`;
    document.getElementById('player-title').textContent = songTitle || 'Untitled';
    document.getElementById('player-artist').textContent = songArtist || 'Unknown Artist';
    audio.play().catch(err => console.error('Lỗi phát nhạc:', err));
}

// Tương tác & Playlist
function likeSong(songId) {
    // TODO: Implement like song functionality
    console.log('Like song:', songId);
}

function loadUserPlaylists(userId) {
    // TODO: Implement load playlists functionality
    console.log('Load playlists for user:', userId);
}