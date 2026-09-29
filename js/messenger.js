// =========================================================
// SOCIALWIKI MESSENGER
// MESSENGER.JS
// =========================================================

console.log("💬 messenger.js loaded");

// =========================================================
// SUPABASE
// =========================================================
let messengerSupabase = window.supabaseClient || null;

if (!messengerSupabase) {
    if (!window.supabase) {
        console.error("❌ Supabase library not found");
    } else {
        const SUPABASE_URL = "https://zcffrkvxmxvojkbmtufe.supabase.co";
        const SUPABASE_KEY = "sb_publishable_lgKbPrSB163cJn-jNWAQCw_QdtqBvrG";
        messengerSupabase = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );
        console.log("✅ Messenger Supabase client created");
    }
}

// =========================================================
// DOM ELEMENTS
// =========================================================
const messengerSearch      = document.getElementById("messengerSearch");
const messengerFriends     = document.getElementById("messengerFriends");
const chatUserAvatar       = document.getElementById("chatUserAvatar");
const chatUserName         = document.getElementById("chatUserName");
const chatUserStatus       = document.getElementById("chatUserStatus");
const messagesContainer    = document.getElementById("messagesContainer");
const messageForm          = document.getElementById("messageForm");
const messageInput         = document.getElementById("messageInput");
const sendMessageButton    = document.getElementById("sendMessageButton");

// =========================================================
// GLOBAL STATE
// =========================================================
let currentUser      = null;
let friends          = [];
let selectedFriend   = null;
let realtimeChannel  = null;
let unreadMessages   = {};

const DEFAULT_AVATAR = "images/iconprofile.png";

// =========================================================
// GET USER ID FROM URL
// =========================================================
function getTargetUserIdFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get("user_id");
        if (!userId) return null;
        return userId.trim();
    } catch (error) {
        console.error("❌ Error reading user_id:", error);
        return null;
    }
}

// =========================================================
// GET CURRENT USER
// =========================================================
async function getCurrentUser() {
    if (!messengerSupabase) return null;
    try {
        const { data, error } = await messengerSupabase.auth.getUser();
        if (error) {
            console.error("❌ getCurrentUser error:", error);
            return null;
        }
        return data?.user || null;
    } catch (error) {
        console.error("❌ getCurrentUser error:", error);
        return null;
    }
}

// =========================================================
// LOAD FRIENDS
// =========================================================
async function loadMessengerFriends() {
    if (!messengerFriends) return;
    if (!currentUser) {
        messengerFriends.innerHTML = `<div class="messenger-empty">Please log in.</div>`;
        return;
    }
    messengerFriends.innerHTML = `<div class="messenger-empty">Loading friends...</div>`;
    try {
        const { data, error } = await messengerSupabase
            .from("friends")
            .select("friend_id")
            .eq("user_id", currentUser.id);

        if (error) {
            console.error("❌ Error loading friends:", error);
            messengerFriends.innerHTML = `<div class="messenger-empty">Unable to load friends.</div>`;
            return;
        }

        if (!data || data.length === 0) {
            friends = [];
            unreadMessages = {};
            messengerFriends.innerHTML = `<div class="messenger-empty">You don't have any friends yet.</div>`;
            updateMessengerGlobalBadge();
            return;
        }

        let friendIds = data.map(row => row.friend_id).filter(Boolean);

        // استبعد المحظورين
        try {
            const { data: blocked } = await messengerSupabase
                .from("blocked_users")
                .select("blocked_id")
                .eq("blocker_id", currentUser.id);

            const blockedIds = (blocked || []).map(b => b.blocked_id);
            friendIds = friendIds.filter(id => !blockedIds.includes(id));
        } catch (e) {
            console.warn("Blocked users table not found, skipping filter");
        }

        if (friendIds.length === 0) {
            friends = [];
            renderFriends([]);
            return;
        }

        const { data: profiles, error: profilesError } = await messengerSupabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", friendIds);

        if (profilesError) {
            console.error("❌ profiles error:", profilesError);
            messengerFriends.innerHTML = `<div class="messenger-empty">Unable to load profiles.</div>`;
            return;
        }

        friends = profiles || [];
        await loadUnreadMessages();
        renderFriends(friends);
    } catch (error) {
        console.error("❌ loadMessengerFriends error:", error);
        messengerFriends.innerHTML = `<div class="messenger-empty">Something went wrong.</div>`;
    }
}

// =========================================================
// LOAD TARGET USER FROM URL
// =========================================================
async function openTargetUserFromUrl() {
    const targetUserId = getTargetUserIdFromUrl();
    if (!targetUserId) return;
    console.log("🎯 Target user:", targetUserId);

    if (currentUser && targetUserId === currentUser.id) return;

    const existingFriend = friends.find(f => String(f.id) === String(targetUserId));
    if (existingFriend) {
        await selectFriend(existingFriend);
        return;
    }

    try {
        const { data: profile, error } = await messengerSupabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .eq("id", targetUserId)
            .maybeSingle();

        if (error || !profile) return;

        const alreadyExists = friends.some(f => String(f.id) === String(profile.id));
        if (!alreadyExists) friends = [profile, ...friends];

        renderFriends(getCurrentDisplayedFriends());
        await selectFriend(profile);
    } catch (error) {
        console.error("❌ openTargetUserFromUrl error:", error);
    }
}

// =========================================================
// LOAD UNREAD MESSAGES
// =========================================================
async function loadUnreadMessages() {
    if (!currentUser) return;
    try {
        const { data, error } = await messengerSupabase
            .from("chat_messages")
            .select("id, sender_id")
            .eq("receiver_id", currentUser.id)
            .eq("is_read", false);

        if (error) {
            console.error("❌ unread error:", error);
            return;
        }

        unreadMessages = {};
        (data || []).forEach(m => {
            const sid = m.sender_id;
            if (!sid) return;
            unreadMessages[sid] = (unreadMessages[sid] || 0) + 1;
        });

        updateMessengerGlobalBadge();
    } catch (error) {
        console.error("❌ loadUnreadMessages error:", error);
    }
}

// =========================================================
// GET TOTAL UNREAD
// =========================================================
function getTotalUnreadMessages() {
    return Object.values(unreadMessages).reduce((t, c) => t + Number(c || 0), 0);
}

// =========================================================
// UPDATE GLOBAL BADGE
// =========================================================
function updateMessengerGlobalBadge() {
    const totalUnread = getTotalUnreadMessages();
    const links = document.querySelectorAll('a[href*="messenger.html"], a[href*="messenger"]');
    links.forEach(link => {
        let badge = link.querySelector(".messenger-unread-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "messenger-unread-badge";
            badge.hidden = true;
            link.appendChild(badge);
        }
        if (totalUnread > 0) {
            badge.textContent = totalUnread > 99 ? "99+" : String(totalUnread);
            badge.hidden = false;
        } else {
            badge.textContent = "";
            badge.hidden = true;
        }
    });
}

// =========================================================
// RENDER FRIENDS
// =========================================================
function renderFriends(list) {
    if (!messengerFriends) return;

    if (!list || list.length === 0) {
        messengerFriends.innerHTML = `<div class="messenger-empty">No friends found.</div>`;
        return;
    }

    messengerFriends.innerHTML = "";

    list.forEach(friend => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "messenger-friend";

        if (selectedFriend && selectedFriend.id === friend.id) {
            button.classList.add("active");
        }

        const avatar      = friend.avatar_url || DEFAULT_AVATAR;
        const displayName = friend.full_name || friend.username || "User";
        const username    = friend.username ? "@" + friend.username : "";
        const unreadCount = Number(unreadMessages[friend.id] || 0);

        button.innerHTML = `
            <img class="messenger-friend-avatar" src="${escapeHtml(avatar)}" alt="User">
            <div class="messenger-friend-info">
                <p class="messenger-friend-name">${escapeHtml(displayName)}</p>
                <p class="messenger-friend-username">${escapeHtml(username)}</p>
            </div>
            <span class="messenger-friend-unread" ${unreadCount === 0 ? "hidden" : ""}>
                ${unreadCount > 99 ? "99+" : unreadCount}
            </span>
        `;

        const image = button.querySelector(".messenger-friend-avatar");
        if (image) {
            image.addEventListener("error", function() {
                this.src = DEFAULT_AVATAR;
            });
        }

                // زر حذف الصديق
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.title = "Delete friend";
        deleteBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 4px 8px;
            border-radius: 6px;
            opacity: 0.6;
            margin-left: 4px;
        `;
        deleteBtn.onmouseover = () => deleteBtn.style.opacity = "1";
        deleteBtn.onmouseout = () => deleteBtn.style.opacity = "0.6";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteFriend(friend);
        };
        button.appendChild(deleteBtn);

        // زر الحظر
        const blockBtn = document.createElement("button");
        blockBtn.innerHTML = "🚫";
        blockBtn.title = "Block user";
        blockBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 4px 8px;
            border-radius: 6px;
            opacity: 0.6;
            margin-left: 4px;
        `;
        blockBtn.onmouseover = () => blockBtn.style.opacity = "1";
        blockBtn.onmouseout = () => blockBtn.style.opacity = "0.6";
        blockBtn.onclick = (e) => {
            e.stopPropagation();
            blockUser(friend);
        };
        button.appendChild(blockBtn);

        // ✅ زر البروفايل
        const profileBtn = document.createElement("button");
        profileBtn.innerHTML = "👤";
        profileBtn.title = "View profile";
        profileBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 4px 8px;
            border-radius: 6px;
            opacity: 0.6;
            margin-left: 4px;
        `;
        profileBtn.onmouseover = () => profileBtn.style.opacity = "1";
        profileBtn.onmouseout = () => profileBtn.style.opacity = "0.6";
        profileBtn.onclick = (e) => {
            e.stopPropagation();
            window.location.href = `profile.html?id=${friend.id}`;
        };
        button.appendChild(profileBtn);

        // زر التبليغ
        const reportBtn = document.createElement("button");
        reportBtn.innerHTML = "⚠️";
        reportBtn.title = "Report user";
        reportBtn.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            padding: 4px 6px;
            border-radius: 6px;
            opacity: 0.6;
            margin-left: 2px;
        `;
        reportBtn.onmouseover = () => reportBtn.style.opacity = "1";
        reportBtn.onmouseout = () => reportBtn.style.opacity = "0.6";
        reportBtn.onclick = (e) => {
            e.stopPropagation();
            reportUser(friend);
        };
        button.appendChild(reportBtn);

          button.addEventListener("click", (e) => {
            if (e.target === deleteBtn || e.target === blockBtn || e.target === profileBtn || e.target === reportBtn) return;
            selectFriend(friend);
        });
          
        messengerFriends.appendChild(button);
    });

    updateMessengerGlobalBadge();
}

// =========================================================
// SEARCH FRIENDS
// =========================================================
function searchMessengerFriends() {
    const searchText = messengerSearch?.value?.trim().toLowerCase() || "";
    if (!searchText) {
        renderFriends(friends);
        return;
    }
    const filtered = friends.filter(friend => {
        const username = (friend.username || "").toLowerCase();
        const fullName = (friend.full_name || "").toLowerCase();
        return username.includes(searchText) || fullName.includes(searchText);
    });
    renderFriends(filtered);
}

// =========================================================
// BLOCK USER
// =========================================================
async function blockUser(friend) {
    const name = friend.full_name || friend.username || "this user";
    if (!confirm(`Block ${name}?\n\nThey won't be able to message you.`)) return;

    try {
        const { error } = await messengerSupabase
            .from("blocked_users")
            .insert({
                blocker_id: currentUser.id,
                blocked_id: friend.id
            });

        if (error) {
            if (error.code === "23505") {
                alert("Already blocked");
                return;
            }
            throw error;
        }

        // حذف الصداقة من الاتجاهين
        await messengerSupabase
            .from("friends")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("friend_id", friend.id);

        await messengerSupabase
            .from("friends")
            .delete()
            .eq("user_id", friend.id)
            .eq("friend_id", currentUser.id);

        // إزالة من القايمة
        friends = friends.filter(f => f.id !== friend.id);

        if (selectedFriend && selectedFriend.id === friend.id) {
            selectedFriend = null;
            if (messagesContainer) messagesContainer.innerHTML = "";
            if (chatUserName) chatUserName.textContent = "Select a conversation";
            if (chatUserStatus) chatUserStatus.textContent = "Choose a friend to start chatting";
            if (messageInput) messageInput.disabled = true;
            if (sendMessageButton) sendMessageButton.disabled = true;
        }

        renderFriends(friends);
        alert(`🚫 ${name} has been blocked`);
    } catch (err) {
        console.error("❌ blockUser error:", err);
        alert("Error: " + err.message);
    }
}
// =========================================================
// DELETE FRIEND
// =========================================================
async function deleteFriend(friend) {
    const name = friend.full_name || friend.username || "this friend";
    if (!confirm(`Remove ${name} from your friends?`)) return;

    try {
        // احذف من الاتجاهين
        await messengerSupabase
            .from("friends")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("friend_id", friend.id);

        await messengerSupabase
            .from("friends")
            .delete()
            .eq("user_id", friend.id)
            .eq("friend_id", currentUser.id);

        // تحديث القايمة
        friends = friends.filter(f => f.id !== friend.id);
        
        if (selectedFriend && selectedFriend.id === friend.id) {
            selectedFriend = null;
            if (messagesContainer) messagesContainer.innerHTML = "";
            if (chatUserName) chatUserName.textContent = "Select a conversation";
            if (chatUserStatus) chatUserStatus.textContent = "Choose a friend to start chatting";
            if (messageInput) messageInput.disabled = true;
            if (sendMessageButton) sendMessageButton.disabled = true;
        }
        
        renderFriends(friends);
        alert(`✅ ${name} removed`);
    } catch (err) {
        console.error("❌ deleteFriend error:", err);
        alert("Error: " + err.message);
    }
}

// =========================================================
// SELECT FRIEND
// =========================================================
async function selectFriend(friend) {
    if (!friend) return;

    selectedFriend = friend;
    unreadMessages[friend.id] = 0;
    updateMessengerGlobalBadge();
    renderFriends(getCurrentDisplayedFriends());

    const avatar = friend.avatar_url || DEFAULT_AVATAR;
    const displayName = friend.full_name || friend.username || "User";

    if (chatUserAvatar) {
        chatUserAvatar.src = avatar;
        chatUserAvatar.onerror = function() { this.src = DEFAULT_AVATAR; };
    }

    if (chatUserName) chatUserName.textContent = displayName;
    if (chatUserStatus) {
        chatUserStatus.textContent = friend.username ? "@" + friend.username : "Friend";
        chatUserStatus.style.color = "";
        chatUserStatus.style.fontStyle = "";
    }

    if (messageInput) {
        messageInput.disabled = false;
        messageInput.focus();
    }


    if (sendMessageButton) sendMessageButton.disabled = false;

    // ✅ تفعيل أزرار الإيموجي والصورة والصوت
    ['emojiBtn', 'imageBtn', 'voiceBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = false;
    });

    await loadMessages();
    setupRealtimeMessages();
}

// =========================================================
// CURRENT DISPLAYED FRIENDS
// =========================================================
function getCurrentDisplayedFriends() {
    const searchText = messengerSearch?.value?.trim().toLowerCase() || "";
    if (!searchText) return friends;
    return friends.filter(friend => {
        const username = (friend.username || "").toLowerCase();
        const fullName = (friend.full_name || "").toLowerCase();
        return username.includes(searchText) || fullName.includes(searchText);
    });
}

// =========================================================
// LOAD MESSAGES
// =========================================================
async function loadMessages() {
    if (!currentUser) return;
    if (!selectedFriend) { showWelcome(); return; }
    if (!messagesContainer) return;

    try {
        const { data, error } = await messengerSupabase
            .from("chat_messages")
              .select("id, sender_id, receiver_id, message, is_read, seen_at, created_at")
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedFriend.id}),and(sender_id.eq.${selectedFriend.id},receiver_id.eq.${currentUser.id})`)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("❌ Error loading messages:", error);
            messagesContainer.innerHTML = `<div class="chat-welcome"><div class="chat-welcome-icon">⚠️</div><h2>Unable to load messages</h2></div>`;
            return;
        }

        renderMessages(data || []);
        await markMessagesAsRead();
        unreadMessages[selectedFriend.id] = 0;
        updateMessengerGlobalBadge();
        renderFriends(getCurrentDisplayedFriends());
    } catch (error) {
        console.error("❌ loadMessages error:", error);
    }
}

// =========================================================
// RENDER MESSAGES
// =========================================================
function renderMessages(messages) {
    if (!messagesContainer) return;

    if (!messages || messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="chat-welcome">
                <div class="chat-welcome-icon">💬</div>
                <h2>Start a conversation</h2>
                <p>Send your first message to ${escapeHtml(selectedFriend?.full_name || selectedFriend?.username || "your friend")}.</p>
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = "";

    messages.forEach(msg => {
        const isSent = msg.sender_id === currentUser.id;
        const row = document.createElement("div");
        row.className = "message-row " + (isSent ? "sent" : "received");

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";

        const messageText = document.createElement("div");
        const rawText = msg.message || "";

        // 🖼️ صورة
        if (rawText.startsWith('[IMAGE:')) {
            const url = rawText.slice(7, -1);
            messageText.innerHTML = `<img src="${url}" class="msg-image" onclick="window.open('${url}','_blank')">`;
        }
        // 🎤 صوت
        else if (rawText.startsWith('[VOICE:')) {
            const url = rawText.slice(7, -1);
            messageText.innerHTML = `<div class="voice-bubble">🎤 <audio controls src="${url}"></audio></div>`;
        }
        // نص عادي
        else {
            messageText.textContent = rawText;
        }
        // ⚠️ زر Report للرسائل المستقبَلة فقط
        if (!isSent) {
            const reportMsgBtn = document.createElement("button");
            reportMsgBtn.innerHTML = "⚠️";
            reportMsgBtn.title = "Report this message";
            reportMsgBtn.style.cssText = `
                background: none;
                border: none;
                cursor: pointer;
                font-size: 12px;
                padding: 2px 4px;
                opacity: 0;
                margin-left: 6px;
                transition: opacity 0.2s;
                vertical-align: middle;
            `;
            bubble.onmouseover = () => reportMsgBtn.style.opacity = "0.7";
            bubble.onmouseout = () => reportMsgBtn.style.opacity = "0";
            reportMsgBtn.onmouseover = () => reportMsgBtn.style.opacity = "1";
            reportMsgBtn.onclick = (e) => {
                e.stopPropagation();
                reportMessage(msg);
            };
            bubble.appendChild(reportMsgBtn);
        }
        const time = document.createElement("span");
        time.className = "message-time";
        
        // ✓✓ للرسائل المُرسلة
        let seenHtml = '';
        if (isSent) {
            if (msg.is_read) {
                seenHtml = ' <span style="color:#4fc3f7;font-weight:bold;">✓✓</span>';
            } else {
                seenHtml = ' <span style="opacity:0.7;">✓</span>';
            }
        }
        
        time.innerHTML = formatMessageTime(msg.created_at) + seenHtml;

        bubble.appendChild(messageText);
        bubble.appendChild(time);
        row.appendChild(bubble);
        messagesContainer.appendChild(row);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
// =========================================================
// EMOJI PICKER
// =========================================================
const EMOJIS = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰',
    '😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏',
    '😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡',
    '🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖',
    '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐️',
    '🎉','🎊','🎁','🎂','🍕','🍔','🍟','🌮','☕','🍺','🍻','⚽','🏀','🎮','🎬','🎵'
];

window.closeEmojiPicker = function() {
    const picker = document.getElementById('emojiPicker');
    if (picker) picker.style.display = 'none';
};

function setupEmojiPicker() {
    const emojiBtn = document.getElementById('emojiBtn');
    const picker = document.getElementById('emojiPicker');
    const grid = document.getElementById('emojiGrid');
    const input = document.getElementById('messageInput');

    if (!emojiBtn || !picker || !grid) return;

    grid.innerHTML = '';
    EMOJIS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = emoji;
        btn.onclick = () => {
            if (input) {
                input.value += emoji;
                input.focus();
            }
        };
        grid.appendChild(btn);
    });

    emojiBtn.onclick = (e) => {
        e.preventDefault();
        picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
    };

    document.addEventListener('click', (e) => {
        if (!picker.contains(e.target) && e.target !== emojiBtn) {
            picker.style.display = 'none';
        }
    });
}

// =========================================================
// IMAGE UPLOAD
// =========================================================
function setupImageUpload() {
    const imageBtn = document.getElementById('imageBtn');
    const imageInput = document.getElementById('imageInput');
    
    if (!imageBtn || !imageInput) return;

    imageBtn.onclick = () => imageInput.click();

    imageInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('❌ Image too large. Max 5MB');
            return;
        }

        try {
            const fileName = `chat/${currentUser.id}/${Date.now()}_${file.name}`;
            const { error: upErr } = await messengerSupabase.storage
                .from('chat-images')
                .upload(fileName, file);

            if (upErr) {
                alert('Upload error: ' + upErr.message);
                return;
            }

            const { data: urlData } = messengerSupabase.storage
                .from('chat-images')
                .getPublicUrl(fileName);

            const { error } = await messengerSupabase
                .from('chat_messages')
                .insert({
                    sender_id: currentUser.id,
                    receiver_id: selectedFriend.id,
                    message: `[IMAGE:${urlData.publicUrl}]`,
                    is_read: false
                });

            if (error) {
                alert('Error: ' + error.message);
                return;
            }

            imageInput.value = '';
            await loadMessages();
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        }
    };
}

// =========================================================
// VOICE RECORDING
// =========================================================
let mediaRecorder = null;
let audioChunks = [];

function setupVoiceRecorder() {
    const voiceBtn = document.getElementById('voiceBtn');
    if (!voiceBtn) return;

    let isRecording = false;

    voiceBtn.onclick = async () => {
        if (!navigator.mediaDevices) {
            alert('❌ Recording not supported');
            return;
        }

        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

                mediaRecorder.onstop = async () => {
                    const blob = new Blob(audioChunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(t => t.stop());

                    try {
                        const fileName = `voice/${currentUser.id}/${Date.now()}.webm`;
                        const { error: upErr } = await messengerSupabase.storage
                            .from('chat-images')
                            .upload(fileName, blob);

                        if (upErr) {
                            alert('Upload error: ' + upErr.message);
                            return;
                        }

                        const { data: urlData } = messengerSupabase.storage
                            .from('chat-images')
                            .getPublicUrl(fileName);

                        await messengerSupabase.from('chat_messages').insert({
                            sender_id: currentUser.id,
                            receiver_id: selectedFriend.id,
                            message: `[VOICE:${urlData.publicUrl}]`,
                            is_read: false
                        });

                        await loadMessages();
                    } catch (err) {
                        alert('Error: ' + err.message);
                    }
                };

                mediaRecorder.start();
                isRecording = true;
                voiceBtn.classList.add('recording');
                voiceBtn.textContent = '⏹️';
            } catch (err) {
                alert('❌ Microphone access denied');
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
        }
    };
}
// =========================================================
// SEND MESSAGE
// =========================================================
async function sendMessage() {
    if (!currentUser) { alert("Please log in first."); return; }
    if (!selectedFriend) { alert("Please select a friend first."); return; }

    // تحقق من الحظر
    const { data: blocked } = await messengerSupabase
        .from("blocked_users")
        .select("id")
        .or(`and(blocker_id.eq.${currentUser.id},blocked_id.eq.${selectedFriend.id}),and(blocker_id.eq.${selectedFriend.id},blocked_id.eq.${currentUser.id})`)
        .maybeSingle();

    if (blocked) {
        alert("❌ Cannot send message. User is blocked.");
        return;
    }

    const text = messageInput?.value?.trim();
    if (!text) return;

    if (sendMessageButton) sendMessageButton.disabled = true;

    try {
        const { data, error } = await messengerSupabase
            .from("chat_messages")
            .insert({
                sender_id: currentUser.id,
                receiver_id: selectedFriend.id,
                message: text,
                is_read: false
            })
            .select()
            .single();

        if (error) {
            console.error("❌ send error:", error);
            alert("Unable to send message.");
            return;
        }

        console.log("✅ Message sent:", data);
        messageInput.value = "";
        messageInput.focus();
    } catch (error) {
        console.error("❌ sendMessage error:", error);
        alert("Something went wrong.");
    } finally {
        if (sendMessageButton) sendMessageButton.disabled = false;
    }
}

// =========================================================
// MARK MESSAGES AS READ
// =========================================================
   

        async function markMessagesAsRead() {
    if (!currentUser || !selectedFriend) return;
    try {
        const { error } = await messengerSupabase
            .from("chat_messages")
            .update({ 
                is_read: true,
                seen_at: new Date().toISOString()
            })
            .eq("sender_id", selectedFriend.id)
            .eq("receiver_id", currentUser.id)
            .eq("is_read", false);

        if (error) console.error("❌ mark read error:", error);
    } catch (error) {
        console.error("❌ markMessagesAsRead error:", error);
    }
}

// =========================================================
// REALTIME + TYPING
// =========================================================
function setupRealtimeMessages() {
    if (!messengerSupabase) return;
    if (!currentUser) return;
    if (!selectedFriend) return;

    if (realtimeChannel) {
        messengerSupabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }

    // قناة موحدة لكلا الطرفين
    const sortedIds = [currentUser.id, selectedFriend.id].sort();
    const channelName = "messenger-chat-" + sortedIds[0] + "-" + sortedIds[1];

    console.log("📡 Channel:", channelName);

    realtimeChannel = messengerSupabase
        .channel(channelName)
        // 1) رسائل جديدة
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "chat_messages"
            },
            async payload => {
                const newMessage = payload.new;
                if (!newMessage) return;

                const isIncoming = newMessage.receiver_id === currentUser.id;

                if (!isIncoming) {
                    const belongs = selectedFriend &&
                        ((newMessage.sender_id === currentUser.id && newMessage.receiver_id === selectedFriend.id) ||
                         (newMessage.sender_id === selectedFriend.id && newMessage.receiver_id === currentUser.id));
                    if (belongs) await loadMessages();
                    return;
                }

                if (selectedFriend && newMessage.sender_id === selectedFriend.id) {
                    await loadMessages();
                    return;
                }

                const senderId = newMessage.sender_id;
                if (!senderId) return;

                unreadMessages[senderId] = (unreadMessages[senderId] || 0) + 1;
                renderFriends(getCurrentDisplayedFriends());
                updateMessengerGlobalBadge();
            }
        )
        // 2) Typing
        .on(
            "broadcast",
            { event: "typing" },
            payload => {
                console.log("⌨️ Typing received:", payload);

                if (!payload || !payload.payload) return;
                if (selectedFriend && payload.payload.userId === selectedFriend.id) {
          
                    if (chatUserStatus) {
                        chatUserStatus.textContent = "typing...";
                        chatUserStatus.style.color = "#1877f2";
                        chatUserStatus.style.fontStyle = "italic";

                        clearTimeout(window._typingResetTimer);
                        window._typingResetTimer = setTimeout(() => {
                            if (chatUserStatus) {
                                chatUserStatus.textContent = selectedFriend.username
                                    ? "@" + selectedFriend.username
                                    : "Friend";
                                chatUserStatus.style.color = "";
                                chatUserStatus.style.fontStyle = "";
                            }
                        }, 2500);
                    }
                }
            }
        )
        .subscribe(status => {
            console.log("📡 Realtime status:", status);
        });
}

// =========================================================
// SHOW WELCOME
// =========================================================
function showWelcome() {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = `
        <div class="chat-welcome">
            <div class="chat-welcome-icon">💬</div>
            <h2>Welcome to Messenger</h2>
            <p>Select a friend to start a conversation.</p>
        </div>
    `;
}

// =========================================================
// FORMAT MESSAGE TIME
// =========================================================
function formatMessageTime(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// =========================================================
// ESCAPE HTML
// =========================================================
function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =========================================================
// SEARCH EVENT
// =========================================================
if (messengerSearch) {
    messengerSearch.addEventListener("input", searchMessengerFriends);
}

// =========================================================
// MESSAGE FORM
// =========================================================
if (messageForm) {
    messageForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        await sendMessage();
    });
}

// =========================================================
// ENTER TO SEND + TYPING BROADCAST
// =========================================================
if (messageInput) {

    messageInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (sendMessageButton && !sendMessageButton.disabled) {
                messageForm.requestSubmit();
            }
        }
    });

    let typingBroadcastTimeout = null;

    messageInput.addEventListener("input", () => {
        if (!realtimeChannel || !currentUser || !selectedFriend) return;

        if (!typingBroadcastTimeout) {
            try {
                realtimeChannel.send({
                    type: "broadcast",
                    event: "typing",
                    payload: { userId: currentUser.id }
                });
                console.log("⌨️ Typing sent");
            } catch (e) {
                console.warn("Typing send error:", e);
            }
            typingBroadcastTimeout = setTimeout(() => {
                typingBroadcastTimeout = null;
            }, 2000);
        }
    });
}

// =========================================================
// CLEANUP REALTIME
// =========================================================
window.addEventListener("beforeunload", () => {
    if (realtimeChannel && messengerSupabase) {
        messengerSupabase.removeChannel(realtimeChannel);
    }
});

// =========================================================
// ⚠️ REPORT SYSTEM (MODAL)
// =========================================================
let reportContext = null;

async function reportUser(friend) {
    reportContext = {
        type: 'user',
        reportedId: friend.id,
        name: friend.full_name || friend.username || "this user",
        messageId: null,
        messageContent: null
    };
    openReportModal(`Report ${reportContext.name}`);
}

async function reportMessage(msg) {
    if (!selectedFriend) return;
    reportContext = {
        type: 'message',
        reportedId: selectedFriend.id,
        name: selectedFriend.full_name || selectedFriend.username || "this user",
        messageId: msg.id,
        messageContent: msg.message
    };
    const preview = (msg.message || "").substring(0, 50);
    openReportModal(`Report message: "${preview}..."`);
}

function openReportModal(targetText) {
    const modal = document.getElementById("reportModal");
    const targetEl = document.getElementById("reportTarget");
    const screenshotInput = document.getElementById("reportScreenshot");
    const screenshotPreview = document.getElementById("reportScreenshotPreview");
    const screenshotImg = document.getElementById("reportScreenshotImg");

    if (!modal) { alert("Report modal not found"); return; }

    if (targetEl) targetEl.textContent = targetText;

    document.getElementById("reportReason").value = "Spam";
    document.getElementById("reportDetails").value = "";
    if (screenshotInput) screenshotInput.value = "";
    if (screenshotPreview) screenshotPreview.style.display = "none";

    if (screenshotInput) {
        screenshotInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file && file.size <= 5 * 1024 * 1024) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (screenshotImg) screenshotImg.src = ev.target.result;
                    if (screenshotPreview) screenshotPreview.style.display = "block";
                };
                reader.readAsDataURL(file);
            } else if (file) {
                alert("❌ Image too large. Max 5MB");
                screenshotInput.value = "";
            }
        };
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

window.closeReportModal = function() {
    const modal = document.getElementById("reportModal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
    reportContext = null;
};

   window.submitReport = async function() {
    if (!reportContext) return;

    // ✅ احفظ النسخة محلياً قبل أي عملية
    const ctx = { ...reportContext };

    const reason = document.getElementById("reportReason").value;
    const details = document.getElementById("reportDetails").value.trim();
    const fileInput = document.getElementById("reportScreenshot");
    const file = fileInput?.files[0];

    const btn = document.getElementById("reportSubmitBtn");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Sending..."; }

    try {
        let screenshotUrl = null;

        if (file) {
            const fileName = `reports/${currentUser.id}/${Date.now()}_${file.name}`;
            const { error: upErr } = await messengerSupabase.storage
                .from("report-screenshots")
                .upload(fileName, file);

            if (!upErr) {
                const { data: urlData } = messengerSupabase.storage
                    .from("report-screenshots")
                    .getPublicUrl(fileName);
                screenshotUrl = urlData.publicUrl;
            }
        }

        if (reportContext.type === 'user') {
            const { error } = await messengerSupabase
                .from("user_reports")
                .insert({
                    reporter_id: currentUser.id,
                    reported_id: reportContext.reportedId,
                    reason: reason,
                    details: details,
                    screenshot_url: screenshotUrl,
                    status: 'pending'
                });
            if (error) throw error;
        } else {
            const { error } = await messengerSupabase
                .from("message_reports")
                .insert({
                    reporter_id: currentUser.id,
                    reported_id: reportContext.reportedId,
                    message_id: reportContext.messageId,
                    message_content: reportContext.messageContent,
                    reason: reason,
                    details: details,
                    screenshot_url: screenshotUrl,
                    status: 'pending'
                });
            if (error) throw error;
        }

        const toast = document.createElement("div");
        toast.style.cssText = `
            position: fixed; top: 80px; right: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white; padding: 15px 25px; border-radius: 12px;
            font-weight: 700; z-index: 999999;
            box-shadow: 0 4px 15px rgba(40,167,69,0.4);
        `;
        const reportType = reportContext.type;

        toast.textContent = "✅ Report sent successfully";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);

        closeReportModal();
        console.log("✅ Report submitted:", reportType);
    } catch (err) {
        console.error("❌ submitReport error:", err);
        alert("Error: " + err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "🚨 Send Report"; }
    }
};

window.reportUser = reportUser;
window.reportMessage = reportMessage;

// =========================================================
// ⚠️ REPORT MESSAGE
// =========================================================
async function reportMessage(msg) {
    if (!selectedFriend) return;

    const reason = prompt(
        `Report this message\n\nMessage: "${(msg.message || "").substring(0, 60)}..."\n\nChoose a reason:\n1 - Spam\n2 - Harassment\n3 - Inappropriate content\n4 - Threat\n5 - Other\n\nEnter number (1-5):`
    );

    if (!reason) return;

    const reasons = {
        '1': 'Spam',
        '2': 'Harassment',
        '3': 'Inappropriate content',
        '4': 'Threat',
        '5': 'Other'
    };

    const selectedReason = reasons[reason.trim()];
    if (!selectedReason) {
        alert("❌ Invalid choice. Please enter 1-5.");
        return;
    }

    let details = "";
    if (selectedReason === 'Other' || confirm("Add more details?")) {
        details = prompt("Describe the issue (optional):") || "";
    }

    let screenshotUrl = null;
    if (confirm("📷 Attach a screenshot?")) {
        screenshotUrl = await pickReportScreenshot();
    }

    try {
        const { error } = await messengerSupabase
            .from("message_reports")
            .insert({
                reporter_id: currentUser.id,
                reported_id: selectedFriend.id,
                message_id: msg.id,
                message_content: msg.message,
                reason: selectedReason,
                details: details,
                screenshot_url: screenshotUrl,
                status: 'pending'
            });

        if (error) throw error;

        alert(`✅ Message reported${screenshotUrl ? " with screenshot" : ""}\n\nThank you!`);
        console.log("✅ Message reported:", msg.id);
    } catch (err) {
        console.error("❌ reportMessage error:", err);
        alert("Error: " + err.message);
    }
}

window.reportMessage = reportMessage;
 


// ✅ اختيار ورفع الصورة
async function pickReportScreenshot() {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) { resolve(null); return; }

            if (file.size > 5 * 1024 * 1024) {
                alert("❌ Image too large. Max 5MB");
                resolve(null);
                return;
            }

            try {
                const fileName = `reports/${currentUser.id}/${Date.now()}_${file.name}`;
                const { error: upErr } = await messengerSupabase.storage
                    .from("report-screenshots")
                    .upload(fileName, file);

                if (upErr) {
                    console.error("Screenshot upload error:", upErr);
                    alert("⚠️ Screenshot upload failed");
                    resolve(null);
                    return;
                }

                const { data: urlData } = messengerSupabase.storage
                    .from("report-screenshots")
                    .getPublicUrl(fileName);

                console.log("✅ Screenshot uploaded:", urlData.publicUrl);
                resolve(urlData.publicUrl);
            } catch (err) {
                console.error("pickReportScreenshot error:", err);
                resolve(null);
            }
        };

        input.click();
    });
}
// =========================================================
// 🚫 BLOCKED USERS LIST
// =========================================================
async function showBlockedUsers() {
    const list = document.getElementById("blockedList");
    if (!list) return;

    if (list.style.display === "block") {
        list.style.display = "none";
        return;
    }

    list.style.display = "block";
    list.innerHTML = '<div style="text-align:center;padding:10px;color:#65676b;">Loading...</div>';

    try {
        const { data: blocked } = await messengerSupabase
            .from("blocked_users")
            .select("blocked_id")
            .eq("blocker_id", currentUser.id);

        if (!blocked || blocked.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:15px;color:#65676b;font-size:13px;">✅ No blocked users</div>';
            return;
        }

        const blockedIds = blocked.map(b => b.blocked_id);
        const { data: profiles } = await messengerSupabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", blockedIds);

        list.innerHTML = "";

        (profiles || []).forEach(profile => {
            const avatar = profile.avatar_url || DEFAULT_AVATAR;
            const name = profile.full_name || profile.username || "User";

            const div = document.createElement("div");
            div.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: white;
                border-radius: 8px;
                margin-bottom: 6px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            `;
            div.innerHTML = `
                <img src="${avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(name)}</div>
                    <div style="font-size:11px;color:#65676b;">@${escapeHtml(profile.username || "user")}</div>
                </div>
                <button onclick="unblockUser('${profile.id}')" style="
                    padding: 6px 10px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                ">Unblock</button>
            `;
            list.appendChild(div);
        });

    } catch (err) {
        console.error("showBlockedUsers error:", err);
        list.innerHTML = '<div style="text-align:center;padding:15px;color:#f02849;font-size:13px;">Error</div>';
    }
}

async function unblockUser(userId) {
    if (!confirm("Unblock this user?")) return;

    try {
        const { error } = await messengerSupabase
            .from("blocked_users")
            .delete()
            .eq("blocker_id", currentUser.id)
            .eq("blocked_id", userId);

        if (error) throw error;

        alert("✅ User unblocked");

        // تحديث العدد
        await updateBlockedCount();

        // إعادة تحميل القائمة والصديق
        await showBlockedUsers();
        await loadMessengerFriends();
    } catch (err) {
        console.error("unblockUser error:", err);
        alert("Error: " + err.message);
    }
}

async function updateBlockedCount() {
    try {
        const { data } = await messengerSupabase
            .from("blocked_users")
            .select("id")
            .eq("blocker_id", currentUser.id);

        const countEl = document.getElementById("blockedCount");
        if (countEl) countEl.textContent = (data || []).length;
    } catch (e) {
        console.warn("updateBlockedCount error:", e);
    }
}

window.showBlockedUsers = showBlockedUsers;
window.unblockUser = unblockUser;
window.updateBlockedCount = updateBlockedCount;
// =========================================================
// INITIALIZE
// =========================================================
async function initializeMessenger() {
    console.log("🚀 Initializing Messenger...");

    if (!messengerSupabase) {
        console.error("❌ Messenger Supabase is not available");
        return;
    }

    currentUser = await getCurrentUser();

    if (!currentUser) {
        console.warn("⚠️ No logged-in user");
        if (messengerFriends) {
            messengerFriends.innerHTML = `<div class="messenger-empty">Please log in to use Messenger.</div>`;
        }
        return;
    }

    console.log("👤 User:", currentUser.id);

    // ✅ دلوقتي currentUser موجود
    await updateBlockedCount();

    await loadMessengerFriends();
    await openTargetUserFromUrl();
    setupEmojiPicker();
setupImageUpload();
setupVoiceRecorder();

    console.log("⚡ Messenger initialized");
}

// =========================================================
// START
// =========================================================
initializeMessenger();

console.log("✅ MESSENGER READY");

window.blockUser = blockUser;
window.deleteFriend = deleteFriend;
window.goToChatProfile = function() {
    if (selectedFriend) {
        window.location.href = `profile.html?id=${selectedFriend.id}`;
    }
};

window.reportUser = reportUser;