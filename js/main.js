// =========================================================
// SOCIALWIKI - MAIN.JS (FULL & CORRECTED)
// =========================================================

// =========================================================
// SUPABASE SETUP
// =========================================================

const SUPABASE_URL = "https://hvslktufqrgdgrgxmvcm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("✅ main.js is working");
console.log("✅ Supabase client created");

// =========================================================
// HANDLE OAUTH CALLBACK
// =========================================================

async function handleAuthCallback() {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (accessToken && refreshToken) {
        try {
            await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            console.log('✅ OAuth session set successfully!');
            window.history.replaceState({}, document.title, '/index.html');
        } catch (error) {
            console.error('Error setting session:', error);
        }
    }
}

// =========================================================
// LOGOUT
// =========================================================

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "auth.html";
}

// =========================================================
// LOAD USER PROFILE
// =========================================================

async function loadUserProfile() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            console.log('⚠️ User not logged in');
            return;
        }

        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('username, full_name, avatar_url, role')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error loading profile:', error);
            return;
        }

        const displayName = profile?.full_name || profile?.username || 'User';
        const username = profile?.username || 'User';
        const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=1877f2&color=fff`;

        // تحديث الـ Navbar
        const navProfileName = document.getElementById('navProfileName');
        if (navProfileName) {
            navProfileName.textContent = displayName;
            if (profile?.role === 'owner') {
                navProfileName.style.color = '#FFD700';
                navProfileName.style.fontWeight = 'bold';
            }
        }

        const navProfileImg = document.getElementById('navProfileImg');
        if (navProfileImg) navProfileImg.src = avatarUrl;

        // تحديث القائمة اليسرى
        const sidebarName = document.getElementById('sidebarName');
        if (sidebarName) sidebarName.textContent = displayName;

        const sidebarImg = document.getElementById('sidebarImg');
        if (sidebarImg) sidebarImg.src = avatarUrl;

        // تحديث القائمة اليمنى
        const rightProfileName = document.getElementById('rightProfileName');
        if (rightProfileName) rightProfileName.textContent = displayName;

        const rightProfileUsername = document.getElementById('rightProfileUsername');
        if (rightProfileUsername) rightProfileUsername.textContent = '@' + username;

        const rightProfileImg = document.getElementById('rightProfileImg');
        if (rightProfileImg) rightProfileImg.src = avatarUrl;

        // تحديث صورة المنشور
        const postProfileImg = document.getElementById('postProfileImg');
        if (postProfileImg) postProfileImg.src = avatarUrl;

        // تحديث المودال
        const modalProfileImg = document.getElementById('modalProfileImg');
        if (modalProfileImg) modalProfileImg.src = avatarUrl;

        const modalProfileName = document.getElementById('modalProfileName');
        if (modalProfileName) modalProfileName.textContent = displayName;

        console.log(`✅ Profile loaded: ${displayName} (${profile?.role || 'user'})`);

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// =========================================================
// CHECK ROLE (التحقق من الدور)
// =========================================================

async function checkRole() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            console.log('⚠️ No user logged in');
            return;
        }

        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error loading role:', error);
            return;
        }

        const role = profile?.role || 'user';
        console.log(`👤 User role: ${role}`);

        const dashboardLink = document.getElementById('dashboardLink');
        if (dashboardLink) {
            if (role === 'owner' || role === 'super_admin' || role === 'admin') {
                dashboardLink.style.display = 'flex';
                console.log('✅ Dashboard link shown');
            } else {
                dashboardLink.style.display = 'none';
                console.log('❌ Dashboard link hidden');
            }
        } else {
            console.warn('⚠️ dashboardLink element not found');
        }
    } catch (error) {
        console.error('Error in checkRole:', error);
    }
}

// =========================================================
// ADD POINTS
// =========================================================

async function addPoints(userId, points, type, description) {
    try {
        await supabaseClient
            .from('points_transactions')
            .insert({
                user_id: userId,
                points: points,
                type: type,
                description: description || '',
                created_at: new Date()
            });

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('total_points')
            .eq('id', userId)
            .single();

        const newTotal = (profile?.total_points || 0) + points;

        await supabaseClient
            .from('profiles')
            .update({ total_points: newTotal })
            .eq('id', userId);

        console.log(`✅ Added ${points} points to user ${userId}`);

    } catch (error) {
        console.error('Error adding points:', error);
    }
}

// =========================================================
// GET USER POINTS
// =========================================================

async function getUserPoints(userId) {
    try {
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('total_points')
            .eq('id', userId)
            .single();

        return profile?.total_points || 0;
    } catch (error) {
        console.error('Error getting points:', error);
        return 0;
    }
}

// =========================================================
// UPDATE NOTIFICATION BADGE
// =========================================================

async function updateNotificationBadge() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) return;

        const { count, error } = await supabaseClient
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('is_read', false);

        if (error) {
            console.error('Error counting notifications:', error);
            return;
        }

        const badge = document.getElementById('navNotificationBadge');
        if (badge) {
            if (count && count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// =========================================================
// LOAD POSTS
// =========================================================

async function loadPosts() {
    const feedContainer = document.getElementById('feedContainer');

    if (!feedContainer) return;

    try {
        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading posts:', error);
            return;
        }

        if (!posts || posts.length === 0) {
            feedContainer.innerHTML = '<div class="feed-post" style="text-align: center; padding: 40px;">No posts yet</div>';
            return;
        }

        const userIds = posts.map(post => post.user_id);

        const { data: profiles } = await supabaseClient
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds);

        const profilesMap = {};
        if (profiles) {
            profiles.forEach(profile => {
                profilesMap[profile.id] = profile;
            });
        }

        feedContainer.innerHTML = '';

        let postCount = 0;

        posts.forEach((post, index) => {
            const profile = profilesMap[post.user_id] || {};
            const username = profile.full_name || profile.username || 'User';
            const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${username}&background=1877f2&color=fff`;
            const timeAgo = formatTimeAgo(post.created_at);

            let contentHTML = '';
            if (post.content) {
                contentHTML += `<div class="feed-content">${escapeHtml(post.content)}</div>`;
            }

            if (post.image_url) {
                contentHTML += `<img src="${post.image_url}" alt="Post Image" class="feed-image" style="width: 100%; max-height: 500px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">`;
            }

            if (post.video_url) {
                contentHTML += `<video src="${post.video_url}" controls class="feed-image"></video>`;
            }

            const postDiv = document.createElement('div');
            postDiv.className = 'feed-post';
            postDiv.innerHTML = `
                <div class="feed-header">
                    <a href="profile.html?id=${post.user_id}" style="text-decoration: none; color: #050505;">
                        <img src="${avatarUrl}" alt="Profile" class="feed-avatar" style="cursor: pointer;">
                    </a>
                    <div>
                        <a href="profile.html?id=${post.user_id}" style="text-decoration: none; color: #050505;">
                            <div class="feed-name">${escapeHtml(username)}</div>
                        </a>
                        <div class="feed-time">${timeAgo}</div>
                    </div>
                </div>
                ${contentHTML}
                <div class="feed-actions">
                    <button class="feed-action" onclick="likePost('${post.id}', this)">
                        👍 Like
                    </button>
                    <button class="feed-action" onclick="commentPost('${post.id}')">
                        💬 Comment
                    </button>
                    <button class="feed-action" onclick="sharePost('${post.id}')">
                        ↗️ Share
                    </button>
                </div>
                <div class="feed-comments" id="comments_${post.id}"></div>
                <input type="text" placeholder="Write a comment..." onkeypress="if(event.key === 'Enter') commentPost('${post.id}')" style="width: 100%; padding: 8px; border: none; background: #f0f2f5; border-radius: 20px; margin-top: 10px; outline: none;">
            `;

            feedContainer.appendChild(postDiv);
            setTimeout(() => loadComments(post.id), 100);

            postCount++;

            if (postCount % 5 === 0) {
                const adDiv = document.createElement('div');
                adDiv.className = 'feed-post';
                adDiv.style.background = '#f8f9fa';
                adDiv.style.padding = '20px';
                adDiv.style.textAlign = 'center';
                adDiv.style.borderRadius = '12px';
                adDiv.style.marginBottom = '20px';
                adDiv.innerHTML = `
                    <h3 style="margin-bottom: 10px; color: #65676b;">Sponsored</h3>
                    <script async="async" data-cfasync="false" src="https://pl31254010.profitableratecpmnetwork.com/57d453ef832901f97e96807b98319cd6/invoke.js"><\/script>
                    <div id="container-57d453ef832901f97e96807b98319cd6"></div>
                `;
                feedContainer.appendChild(adDiv);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// =========================================================
// LOAD COMMENTS
// =========================================================

async function loadComments(postId) {
    try {
        const { data: comments, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading comments:', error);
            return;
        }

        const commentsContainer = document.getElementById(`comments_${postId}`);
        if (!commentsContainer) return;

        commentsContainer.innerHTML = '';

        if (!comments || comments.length === 0) {
            commentsContainer.innerHTML = '<p style="color: #65676b; font-size: 13px; margin: 5px 0;">No comments yet</p>';
            return;
        }

        const userIds = comments.map(comment => comment.user_id);

        const { data: profiles } = await supabaseClient
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds);

        const profilesMap = {};
        if (profiles) {
            profiles.forEach(profile => {
                profilesMap[profile.id] = profile;
            });
        }

        comments.forEach(comment => {
            const profile = profilesMap[comment.user_id] || {};
            const username = profile.full_name || profile.username || 'User';
            const avatarUrl = profile.avatar_url || `https://ui-avatars.com/api/?name=${username}&background=1877f2&color=fff`;

            const commentDiv = document.createElement('div');
            commentDiv.style.display = 'flex';
            commentDiv.style.alignItems = 'center';
            commentDiv.style.gap = '8px';
            commentDiv.style.marginBottom = '8px';

            commentDiv.innerHTML = `
                <img src="${avatarUrl}" alt="Profile" style="width: 30px; height: 30px; border-radius: 50%;">
                <div style="background: #f0f2f5; border-radius: 12px; padding: 8px 12px; flex: 1;">
                    <strong style="font-size: 13px;">${escapeHtml(username)}</strong>
                    <p style="margin: 0; font-size: 13px;">${escapeHtml(comment.content)}</p>
                </div>
            `;

            commentsContainer.appendChild(commentDiv);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// =========================================================
// LIKE POST
// =========================================================

async function likePost(postId, btn) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            alert('Please login first!');
            return;
        }

        const { data: post } = await supabaseClient
            .from('posts')
            .select('user_id')
            .eq('id', postId)
            .single();

        if (!post) return;

        const postOwnerId = post.user_id;

        const { data: existingLike } = await supabaseClient
            .from('likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existingLike) {
            await supabaseClient
                .from('likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);

            btn.innerHTML = '👍 Like';
            btn.style.color = '#65676b';
        } else {
            await supabaseClient
                .from('likes')
                .insert({
                    post_id: postId,
                    user_id: user.id
                });

            btn.innerHTML = '👍 Liked';
            btn.style.color = '#1877f2';

            const { data: senderProfile } = await supabaseClient
                .from('profiles')
                .select('username, full_name')
                .eq('id', user.id)
                .single();

            const senderName = senderProfile?.full_name || senderProfile?.username || 'Someone';

            await createNotification(
                postOwnerId,
                user.id,
                'like',
                `${senderName} liked your post`
            );
        }

        const { count } = await supabaseClient
            .from('likes')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', postId);

        btn.textContent = `👍 ${count || 0}`;

    } catch (error) {
        console.error('Like error:', error);
    }
}

// =========================================================
// COMMENT POST
// =========================================================

function commentPost(postId) {
    const comment = prompt('Write a comment:');

    if (comment) {
        addComment(postId, comment);
    }
}

async function addComment(postId, content) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            alert('Please login first!');
            return;
        }

        const { data: post } = await supabaseClient
            .from('posts')
            .select('user_id')
            .eq('id', postId)
            .single();

        if (!post) return;

        const postOwnerId = post.user_id;

        const { data: newComment, error } = await supabaseClient
            .from('comments')
            .insert({
                post_id: postId,
                user_id: user.id,
                content: content,
                created_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            alert('Error adding comment: ' + error.message);
            return;
        }

        const { data: senderProfile } = await supabaseClient
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .single();

        const senderName = senderProfile?.full_name || senderProfile?.username || 'Someone';

        await createNotification(
            postOwnerId,
            user.id,
            'comment',
            `${senderName} commented on your post: "${content.substring(0, 50)}"`
        );

        loadComments(postId);

    } catch (error) {
        console.error('Error:', error);
    }
}

function sharePost(postId) {
    const url = window.location.href.split('?')[0] + `?post_id=${postId}`;
    navigator.clipboard.writeText(url);
    alert('Post link copied!');
}

// =========================================================
// CREATE NOTIFICATION
// =========================================================

async function createNotification(receiverId, senderId, type, message) {
    try {
        if (receiverId === senderId) return;

        const { error } = await supabaseClient
            .from('notifications')
            .insert({
                receiver_id: receiverId,
                sender_id: senderId,
                type: type,
                message: message,
                is_read: false,
                created_at: new Date()
            });

        if (error) {
            console.error('Error creating notification:', error);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

// =========================================================
// SEARCH USERS
// =========================================================

async function searchUsers(query) {
    if (!query || query.length < 2) {
        const resultsDiv = document.getElementById('searchResults');
        if (resultsDiv) resultsDiv.style.display = 'none';
        return;
    }

    const { data: users, error } = await supabaseClient
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

    if (error) {
        console.error('Search error:', error);
        return;
    }

    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '';
    resultsDiv.style.display = 'block';

    if (!users || users.length === 0) {
        resultsDiv.innerHTML = '<div class="search-no-results">No results found</div>';
        return;
    }

    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.onclick = () => window.location.href = `profile.html?id=${user.id}`;

        const avatar = user.avatar_url ?
            `<img src="${user.avatar_url}" alt="Profile">` :
            `<img src="https://ui-avatars.com/api/?name=${user.username || 'User'}&background=1877f2&color=fff" alt="Profile">`;

        const displayName = user.full_name || user.username || 'User';

        item.innerHTML = `
            ${avatar}
            <div class="search-result-info">
                <div class="search-result-name">${escapeHtml(displayName)}</div>
                <div class="search-result-username">@${escapeHtml(user.username || '')}</div>
            </div>
        `;

        resultsDiv.appendChild(item);
    });
}

// =========================================================
// LOAD STORIES
// =========================================================

async function loadStories() {
    try {
        const { data: stories, error } = await supabaseClient
            .from('stories')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error loading stories:', error);
            return;
        }

        if (!stories || stories.length === 0) return;

        const userIds = stories.map(story => story.user_id);

        const { data: profiles } = await supabaseClient
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', userIds);

        const profilesMap = {};
        if (profiles) {
            profiles.forEach(profile => {
                profilesMap[profile.id] = profile;
            });
        }

        const storyList = document.querySelector('.story-list');
        if (!storyList) return;

        const existingStories = storyList.querySelectorAll('.story-item:not(:first-child)');
        existingStories.forEach(story => story.remove());

        stories.forEach(story => {
            const profile = profilesMap[story.user_id] || {};
            const username = profile.full_name || profile.username || 'User';

            const storyItem = document.createElement('div');
            storyItem.className = 'story-item';
            storyItem.onclick = () => openStory(story.id);

            const { data: urlData } = supabaseClient.storage
                .from('stories')
                .getPublicUrl(story.media_url);

            const mediaUrl = urlData.publicUrl;

            if (story.media_type === 'video') {
                storyItem.innerHTML = `
                    <video src="${mediaUrl}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"></video>
                    <span class="story-name">${escapeHtml(username)}</span>
                `;
            } else {
                storyItem.innerHTML = `
                    <img src="${mediaUrl}" alt="Story" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
                    <span class="story-name">${escapeHtml(username)}</span>
                `;
            }

            storyList.appendChild(storyItem);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

function openStory(storyId) {
    alert('Opening story: ' + storyId);
}

// =========================================================
// FORMAT TIME
// =========================================================

function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
}

// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("📌 DOM loaded - main.js");

    // معالجة OAuth callback
    handleAuthCallback();

    // تطبيق اللغة المحفوظة
    const lang = localStorage.getItem('socialwiki_lang') || 'en';
    if (typeof setLanguage === 'function') {
        setLanguage(lang);
    }

    // تحميل البيانات
    setTimeout(updateNotificationBadge, 500);
    setTimeout(checkRole, 500);
    setTimeout(loadUserProfile, 500);
    setTimeout(loadStories, 500);
    setTimeout(loadPosts, 500);
});