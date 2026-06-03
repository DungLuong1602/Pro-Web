const API_BASE_URL = 'http://localhost:8080/api';

let currentPlayingSongId = null;
let currentSelectedPlaylistId = null;
let currentUser = null;
let allGlobalSongs = [];
let likedSongIds = new Set();
let currentPlaybackList = [];
let currentPlaybackIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    
    const audio = document.getElementById('main-audio');
    if (audio) {
        audio.addEventListener('ended', playNextSong);
    }

    // Add Enter key support for search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
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
        currentUser = user;
        
        document.getElementById('display-username').textContent = user.username;
        
        // Load songs, playlists and liked songs on page load
        loadAllSongs();
        loadUserPlaylists(user.id);
        loadLikedSongIds(user.id);
        
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
    const views = ['home','search','library','liked','upload'];
    views.forEach(v => {
        const el = document.getElementById('view-' + v);
        if (!el) return;
        el.style.display = (v === viewId) ? 'block' : 'none';
    });

    if (viewId === 'liked' && currentUser) {
        loadLikedSongs(currentUser.id);
    }
}

function performSearch() {
    const q = document.getElementById('search-input').value.trim().toLowerCase();
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    
    if (!q) {
        container.innerHTML = '<p style="color:#b3b3b3;">Nhập từ khóa để tìm kiếm.</p>';
        return;
    }

    // Filter songs by title or artist
    const results = allGlobalSongs.filter(song => 
        song.title.toLowerCase().includes(q) || 
        song.artist.toLowerCase().includes(q)
    );

    if (results.length === 0) {
        container.innerHTML = `<p style="color:#b3b3b3;">Không tìm thấy bài hát nào cho "${q}".</p>`;
        return;
    }

    results.forEach(song => {
        container.appendChild(createSongCard(song, { showActions: false, showLike: true, playbackList: results }));
    });
}

function createSongCard(song, options = {}) {
    const { showActions = false, showLike = true, showRemove = false, onRemove = null, playbackList = null } = options;
    const card = document.createElement('div');
    card.className = 'song-card';

    const cover = document.createElement('div');
    cover.className = 'song-cover';
    cover.textContent = '🎵';
    cover.addEventListener('click', () => playSong(song.id, song.title, song.artist, playbackList));

    const info = document.createElement('div');
    info.className = 'song-info';
    info.style.flex = '1';
    info.innerHTML = `<h4>${song.title || 'Untitled'}</h4><p>${song.artist || 'Unknown Artist'}</p>`;
    info.addEventListener('click', () => playSong(song.id, song.title, song.artist, playbackList));

    card.appendChild(cover);
    card.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'song-actions';

    if (showLike) {
        const likeBtn = document.createElement('button');
        likeBtn.className = 'btn-like-song';
        likeBtn.dataset.songId = song.id;
        const isLiked = likedSongIds.has(song.id);
        likeBtn.textContent = isLiked ? '❤️' : '🤍';
        likeBtn.title = isLiked ? 'Bỏ thích' : 'Thích';
        likeBtn.addEventListener('click', (e) => handleSongLikeClick(e, song.id));
        actions.appendChild(likeBtn);
    }

    if (showActions) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-action-edit';
        editBtn.title = 'Sửa thông tin';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editSong(song.id, song.title, song.artist);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-action-delete';
        deleteBtn.title = 'Xóa bài hát';
        deleteBtn.textContent = '🗑️';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSong(song.id);
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
    }

    if (showRemove && typeof onRemove === 'function') {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-action-remove';
        removeBtn.title = 'Xóa khỏi Playlist';
        removeBtn.textContent = '➖';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            onRemove(song.id);
        });
        actions.appendChild(removeBtn);
    }

    if (actions.childNodes.length > 0) {
        card.appendChild(actions);
    }

    return card;
}

function loadLikedSongIds(userId) {
    fetch(`${API_BASE_URL}/interactions/liked-songs?userId=${userId}`)
        .then(res => res.json())
        .then(res => {
            const likedSongs = res.data || [];
            likedSongIds = new Set(likedSongs.map(song => song.id));
            // Reload visible song list if needed
            const isVisible = (id) => window.getComputedStyle(document.getElementById(id)).display === 'block';
            if (isVisible('view-home')) {
                loadAllSongs();
            }
            if (isVisible('view-search')) {
                performSearch();
            }
            if (isVisible('view-liked')) {
                if (currentUser) loadLikedSongs(currentUser.id);
            }
        })
        .catch(err => {
            console.error('Lỗi tải danh sách bài hát đã thích:', err);
        });
}

function loadLikedSongs(userId) {
    const container = document.getElementById('liked-song-list');
    container.innerHTML = '<p style="color:#b3b3b3;">Đang tải danh sách bài hát đã thích...</p>';

    fetch(`${API_BASE_URL}/interactions/liked-songs?userId=${userId}`)
        .then(res => res.json())
        .then(res => {
            const songs = res.data || [];
            likedSongIds = new Set(songs.map(song => song.id));

            if (songs.length === 0) {
                container.innerHTML = '<p style="color:#b3b3b3;">Bạn chưa thích bài hát nào.</p>';
                return;
            }

            container.innerHTML = '';
            songs.forEach(song => {
                container.appendChild(createSongCard(song, { showActions: false, showLike: true, playbackList: songs }));
            });
        })
        .catch(err => {
            console.error('Lỗi tải bài hát đã thích:', err);
            container.innerHTML = '<p style="color:#b3b3b3;">Lỗi tải bài hát đã thích.</p>';
        });
}

function handleSongLikeClick(event, songId) {
    event.stopPropagation();
    if (!currentUser) {
        alert('Bạn cần đăng nhập để thích bài hát.');
        return;
    }

    fetch(`${API_BASE_URL}/interactions/like?userId=${currentUser.id}&songId=${songId}`, {
        method: 'POST'
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 200) {
            const liked = res.data.liked;
            if (liked) {
                likedSongIds.add(songId);
            } else {
                likedSongIds.delete(songId);
            }
            updateLikeButtons(songId, liked);
            if (document.getElementById('view-liked').style.display === 'block' && currentUser) {
                loadLikedSongs(currentUser.id);
            }
        }
    })
    .catch(err => {
        console.error('Lỗi thích bài hát:', err);
    });
}

function updateLikeButtons(songId, liked) {
    document.querySelectorAll(`.btn-like-song[data-song-id="${songId}"]`).forEach(btn => {
        btn.textContent = liked ? '❤️' : '🤍';
        btn.title = liked ? 'Bỏ thích' : 'Thích';
    });
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
            allGlobalSongs = songs || []; // Store for search functionality

            if (!songs || songs.length === 0) {
                songList.innerHTML = '<p style="color:#b3b3b3;">Không có bài hát nào.</p>';
                return;
            }
            
            songs.forEach(song => {
                songList.appendChild(createSongCard(song, { showActions: true, showLike: true, playbackList: allGlobalSongs }));
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

function setCurrentPlaybackList(songArray) {
    currentPlaybackList = songArray ? songArray.slice() : [];
}

function playSong(songId, songTitle, songArtist, playbackList = null) {
    if (playbackList && Array.isArray(playbackList)) {
        setCurrentPlaybackList(playbackList);
    } else if (currentPlaybackList.length === 0 && allGlobalSongs.length > 0) {
        setCurrentPlaybackList(allGlobalSongs);
    }

    currentPlaybackIndex = currentPlaybackList.findIndex(song => song.id === songId);
    if (currentPlaybackIndex === -1 && allGlobalSongs.length > 0) {
        currentPlaybackIndex = allGlobalSongs.findIndex(song => song.id === songId);
        if (currentPlaybackIndex !== -1) {
            setCurrentPlaybackList(allGlobalSongs);
        }
    }

    currentPlayingSongId = songId; // Update current playing song ID
    const audio = document.getElementById('main-audio');
    audio.src = `${API_BASE_URL}/songs/${songId}/stream`;
    document.getElementById('player-title').textContent = songTitle || 'Untitled';
    document.getElementById('player-artist').textContent = songArtist || 'Unknown Artist';
    audio.play().catch(err => console.error('Lỗi phát nhạc:', err));
}

function playNextSong() {
    if (!currentPlaybackList || currentPlaybackList.length === 0) {
        return;
    }

    const nextIndex = currentPlaybackIndex + 1;
    if (nextIndex >= 0 && nextIndex < currentPlaybackList.length) {
        const nextSong = currentPlaybackList[nextIndex];
        playSong(nextSong.id, nextSong.title, nextSong.artist);
    }
}

function skipSong() {
    playNextSong();
}

function playPreviousSong() {
    if (!currentPlaybackList || currentPlaybackList.length === 0) return;

    const prevIndex = currentPlaybackIndex - 1;
    if (prevIndex >= 0 && prevIndex < currentPlaybackList.length) {
        const prevSong = currentPlaybackList[prevIndex];
        playSong(prevSong.id, prevSong.title, prevSong.artist);
    } else {
        // If at the start, restart current song
        const audio = document.getElementById('main-audio');
        if (audio) audio.currentTime = 0;
    }
}

function rewindSong() {
    playPreviousSong();
}

// Tải danh sách playlist của người dùng
function loadUserPlaylists(userId) {
    fetch(`${API_BASE_URL}/playlists/user/${userId}`)
        .then(res => res.json())
        .then(res => {
            const container = document.getElementById('playlist-container');
            container.innerHTML = '';
            const playlists = res.data || [];
            
            if(playlists.length === 0) {
                container.innerHTML = '<li style="color: #b3b3b3; font-style: italic; font-size: 13px;">Chưa có playlist nào</li>';
                return;
            }

            playlists.forEach(p => {
                const li = document.createElement('li');
                li.className = 'playlist-item-nav';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';
                li.style.paddingRight = '5px';
                
                const nameSpan = document.createElement('span');
                nameSpan.style.flex = '1';
                nameSpan.textContent = `📁 ${p.name}`;
                nameSpan.style.cursor = 'pointer';
                nameSpan.onclick = () => openPlaylistDetail(p.id, p.name);
                
                const actionDiv = document.createElement('div');
                actionDiv.style.display = 'flex';
                actionDiv.style.gap = '5px';
                
                const editBtn = document.createElement('button');
                editBtn.textContent = '✏️';
                editBtn.style.background = 'none';
                editBtn.style.border = 'none';
                editBtn.style.cursor = 'pointer';
                editBtn.style.fontSize = '14px';
                editBtn.title = 'Sửa Playlist';
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    editPlaylist(p.id, p.name);
                };
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = '🗑️';
                deleteBtn.style.background = 'none';
                deleteBtn.style.border = 'none';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.fontSize = '14px';
                deleteBtn.title = 'Xóa Playlist';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    deletePlaylist(p.id, p.name, userId);
                };
                
                actionDiv.appendChild(editBtn);
                actionDiv.appendChild(deleteBtn);
                
                li.appendChild(nameSpan);
                li.appendChild(actionDiv);
                container.appendChild(li);
            });
        });
}

function handleCreatePlaylist() {
    const name = prompt("Nhập tên Playlist mới:");
    if (!name || !name.trim()) return;

    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    fetch(`${API_BASE_URL}/playlists/create?name=${encodeURIComponent(name.trim())}&userId=${user.id}`, {
        method: 'POST'
    })
    .then(res => res.json())
    .then(res => {
        if(res.status === 200) {
            alert('Tạo playlist thành công!');
            loadUserPlaylists(user.id);
        } else {
            alert(res.message);
        }
    });
}

function editPlaylist(playlistId, currentName) {
    const newName = prompt("Nhập tên Playlist mới:", currentName);
    if (newName === null) return;
    if (!newName.trim()) {
        alert('Tên Playlist không được để trống!');
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    fetch(`${API_BASE_URL}/playlists/${playlistId}?name=${encodeURIComponent(newName.trim())}`, {
        method: 'PUT'
    })
    .then(res => res.json())
    .then(res => {
        if(res.status === 200 || res.status === 'success') {
            alert('Cập nhật Playlist thành công!');
            loadUserPlaylists(user.id);
        } else {
            alert('Lỗi: ' + (res.message || 'Không thể cập nhật Playlist'));
        }
    })
    .catch(err => {
        console.error('Lỗi cập nhật Playlist:', err);
        alert('Lỗi: ' + err.message);
    });
}

function deletePlaylist(playlistId, playlistName, userId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa Playlist "${playlistName}"?`)) {
        return;
    }

    fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(res => {
        if(res.status === 200 || res.status === 'success') {
            alert('Xóa Playlist thành công!');
            loadUserPlaylists(userId);
            // Reset library view if the deleted playlist was active
            if (currentSelectedPlaylistId === playlistId) {
                sidebarNavigate('home');
            }
        } else {
            alert('Lỗi: ' + (res.message || 'Không thể xóa Playlist'));
        }
    })
    .catch(err => {
        console.error('Lỗi xóa Playlist:', err);
        alert('Lỗi: ' + err.message);
    });
}

function openPlaylistDetail(playlistId, playlistName) {
    currentSelectedPlaylistId = playlistId;
    sidebarNavigate('library');
    
    document.getElementById('library-title').textContent = `📁 ${playlistName}`;
    const addSongBtn = document.getElementById('btn-add-song-to-current');
    if (addSongBtn) {
        addSongBtn.style.display = 'block';
        addSongBtn.onclick = () => showAddSongToPlaylistModal();
    }

    fetchPlaylistSongs(playlistId);
}

function fetchPlaylistSongs(playlistId) {
    const content = document.getElementById('library-content');
    content.innerHTML = '<p style="color:#b3b3b3;">Đang tải bài hát trong Playlist...</p>';

    // Gọi API của user để quét lại playlist cụ thể
    const user = JSON.parse(localStorage.getItem('currentUser'));
    fetch(`${API_BASE_URL}/playlists/user/${user.id}`)
        .then(res => res.json())
        .then(res => {
            const currentP = res.data.find(p => p.id === playlistId);
            content.innerHTML = '';

            if(!currentP || !currentP.songs || currentP.songs.length === 0) {
                content.innerHTML = '<p style="color:#b3b3b3;">Playlist này chưa có bài hát nào. Hãy thêm nhạc ngay!</p>';
                return;
            }

            currentP.songs.forEach(song => {
                content.appendChild(createSongCard(song, {
                    showActions: false,
                    showLike: true,
                    showRemove: true,
                    playbackList: currentP.songs,
                    onRemove: (songId) => removeSongFromPlaylist(currentP.id, songId)
                }));
            });
        });
}

// Bổ sung Tính năng thêm bài hát vào playlist đã tạo bằng giao diện chọn nhanh
function showAddSongToPlaylistModal() {
    const content = document.getElementById('library-content');
    
    // If we don't have songs loaded, fetch them first
    if (allGlobalSongs.length === 0) {
        fetch(`${API_BASE_URL}/songs`)
            .then(res => res.json())
            .then(result => {
                allGlobalSongs = result.data || [];
                displaySongsForPlaylistAdd(content);
            })
            .catch(err => {
                console.error('Lỗi tải danh sách bài hát:', err);
                content.innerHTML = '<p style="color: red;">Lỗi tải danh sách bài hát.</p>';
            });
        return;
    }
    
    displaySongsForPlaylistAdd(content);
}

function displaySongsForPlaylistAdd(content) {
    content.innerHTML = '<h3 style="margin-bottom:15px; color:#1db954;">Chọn bài hát để thêm vào Playlist:</h3>';

    if(allGlobalSongs.length === 0) {
        content.innerHTML += '<p style="color:#b3b3b3;">Hệ thống chưa có nhạc, hãy qua thẻ Tải Lên trước.</p>';
        return;
    }

    allGlobalSongs.forEach(song => {
        const div = document.createElement('div');
        div.className = 'modal-song-row';
        div.innerHTML = `
            <div>
                <strong>${song.title}</strong> - <span style="color:#b3b3b3; font-size:13px;">${song.artist}</span>
            </div>
            <button class="btn-add-to-p" onclick="executeAddSong(${song.id})">➕ Thêm</button>
        `;
        content.appendChild(div);
    });
}

function executeAddSong(songId) {
    fetch(`${API_BASE_URL}/playlists/add-song?playlistId=${currentSelectedPlaylistId}&songId=${songId}`, {
        method: 'POST'
    })
    .then(res => res.json())
    .then(res => {
        if(res.status === 200) {
            alert('Đã thêm bài hát vào playlist!');
            fetchPlaylistSongs(currentSelectedPlaylistId);
        } else {
            alert(res.message);
        }
    });
}

function removeSongFromPlaylist(playlistId, songId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài hát này khỏi playlist?')) {
        return;
    }

    fetch(`${API_BASE_URL}/playlists/${playlistId}/songs/${songId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 200 || res.status === 'success') {
            alert('Đã xóa bài hát khỏi playlist.');
            if (currentSelectedPlaylistId === playlistId) {
                fetchPlaylistSongs(playlistId);
            }
        } else {
            alert('Lỗi: ' + (res.message || 'Không thể xóa bài hát khỏi playlist'));
        }
    })
    .catch(err => {
        console.error('Lỗi xóa bài hát khỏi playlist:', err);
        alert('Lỗi: ' + err.message);
    });
}

function removeSongFromPlaylist(playlistId, songId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài hát này khỏi playlist?')) {
        return;
    }

    fetch(`${API_BASE_URL}/playlists/${playlistId}/songs/${songId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 200 || res.status === 'success') {
            alert('Đã xóa bài hát khỏi playlist.');
            if (currentSelectedPlaylistId === playlistId) {
                fetchPlaylistSongs(playlistId);
            }
        } else {
            alert('Lỗi: ' + (res.message || 'Không thể xóa bài hát khỏi playlist')); 
        }
    })
    .catch(err => {
        console.error('Lỗi xóa bài hát khỏi playlist:', err);
        alert('Lỗi: ' + err.message);
    });
}

// Tương tác 
// Xử lý Thích / Bỏ thích bài hát công khai
function handleLikeToggle() {
    if (!currentPlayingSongId) {
        alert('Vui lòng chọn phát 1 bài nhạc trước khi tương tác thích!');
        return;
    }
    const user = JSON.parse(localStorage.getItem('currentUser'));

    fetch(`${API_BASE_URL}/interactions/like?userId=${user.id}&songId=${currentPlayingSongId}`, {
        method: 'POST'
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 200) {
            const isLiked = res.data.liked;
            const count = res.data.count;
            
            document.getElementById('player-like-btn').textContent = isLiked ? '❤️' : '🤍';
            document.getElementById('like-count-display').textContent = `${count} Likes`;
        }
    });
}

// Cập nhật trạng thái Like hiển thị trên thanh Player
function updateLikeStatusDisplay(songId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    // Mượn API Like để lấy trạng thái tổng số lượt tương tác hiện tại
    fetch(`${API_BASE_URL}/interactions/like?userId=0&songId=${songId}`, { method: 'POST' })
    .then(res => res.json())
    .then(res => {
         // Đọc tổng số lượt thích từ cơ sở dữ liệu
         const count = res.data.count;
         document.getElementById('like-count-display').textContent = `${count} Likes`;
         document.getElementById('player-like-btn').textContent = '🤍'; // Mặc định trạng thái toggle
    });
}

// Tải danh sách các bình luận hiện có của bài hát lên UI
function loadComments(songId) {
    fetch(`${API_BASE_URL}/interactions/comments/${songId}`)
    .then(res => res.json())
    .then(res => {
        const container = document.getElementById('comments-display-container');
        container.innerHTML = '';
        const comments = res.data || [];

        if (comments.length === 0) {
            container.innerHTML = '<p id="no-comment-text" style="color:#b3b3b3; font-style:italic; font-size:13px;">Chưa có bình luận nào cho bài hát này. Hãy là người đầu tiên bình luận!</p>';
            return;
        }

        comments.forEach(c => {
            const card = document.createElement('div');
            card.className = 'comment-card';
            card.innerHTML = `
                <div class="comment-user">@${c.user ? c.user.username : 'Ẩn danh'}</div>
                <div class="comment-text">${c.content}</div>
            `;
            container.appendChild(card);
        });
    });
}

// Gửi bình luận mới lên máy chủ Backend
function submitComment() {
    const input = document.getElementById('comment-input-field');
    const content = input.value.trim();
    if (!content) return;

    const user = JSON.parse(localStorage.getItem('currentUser'));

    fetch(`${API_BASE_URL}/interactions/comment?userId=${user.id}&songId=${currentPlayingSongId}&content=${encodeURIComponent(content)}`, {
        method: 'POST'
    })
    .then(res => res.json())
    .then(res => {
        if(res.status === 200) {
            input.value = '';
            loadComments(currentPlayingSongId); // Nạp lại danh sách mà không ảnh hưởng tới audio
        } else {
            alert(res.message);
        }
    });
}

