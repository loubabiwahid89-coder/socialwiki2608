https://socialwiki-wiki2608.loubabiwahid89.workers.dev/js/messages.js
/* =========================================================
   SOCIALWIKI - MESSAGES PAGE (REAL Supabase)
   ========================================================= */

// ========== SUPABASE ==========
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(
        "https://hvslktufqrgdgrgxmvcm.supabase.co",
        "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT"
    );
}
const sb = window.supabaseClient;

// ========== STATE ==========
let conversations = [];       // قائمة المحادثات
let currentChatId = null;     // userId الحالي
let currentUserId = null;     // أنا
let currentTab = "inbox";
let realtimeChannel = null;

// ========== DOM ==========
const conversationsList = document.getElementById("conversationsList");
const chatEmpty         = document.getElementById("chatEmpty");
const chatActive        = document.getElementById("chatActive");
const chatBody          = document.getElementById("chatBody");
const chatUserName      = document.getElementById("chatUserName");
const chatUserStatus    = document.getElementById("chatUserStatus");
const messageInput      = document.getElementById("messageInput");
const btnSend           = document.getElementById("btnSend");
const btnEmoji          = document.getElementById("btnEmoji");
const btnAttach         = document.getElementById("btnAttach");
const emojiPicker       = document.getElementById("emojiPicker");
const searchInput       = document.getElementById("searchConversations");
const btnArchive        = document.getElementById("btnArchive");
const btnMute           = document.getElementById("btnMute");
const btnBlock          = document.getElementById("btnBlock");
const btnDelete         = document.getElementById("btnDelete");
const newMessageBtn     = document.getElementById("newMessageBtn");

// ========== HELPER ==========
function tr(key) {
    return (typeof window.t === "function") ? window.t(key) : key;
}

function esc(text) {
    if (!text) return "";
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
}

function fmtTime(ts) {
    const d = new Date(ts);
    return d.getHours().toString().padStart(2, "0") + ":" +
           d.getMinutes().toString().padStart(2, "0");
}

function fmtDateLabel(ts) {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return tr("today_date");
    if (d.toDateString() === yesterday.toDateString()) return tr("yesterday");
    return d.toLocaleDateString();
}

// =========================================================
// جلب الأصدقاء (friends table)
// =========================================================
async function loadFriends() {
    const { data: friends, error } = await sb
        .from("friends")
        .select("friend_id")
        .eq("user_id", currentUserId);

    if (error) {
        console.error("❌ loadFriends:", error);
        return [];
    }
    if (!friends || friends.length === 0) return [];

    const friendIds = friends.map(f => f.friend_id);
    const { data: profiles } = await sb
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", friendIds);

    return profiles || [];
}

// =========================================================
// جلب كل الرسائل بيني وبين شخص
// =========================================================
async function loadMessagesWith(otherUserId) {
    const { data, error } = await sb
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("❌ loadMessagesWith:", error);
        return [];
    }
    return data || [];
}

// =========================================================
// بناء قائمة المحادثات من الرسائل + الأصدقاء
// =========================================================
async function buildConversations() {
    const friends = await loadFriends();
    const list = [];

    for (const f of friends) {
        const msgs = await loadMessagesWith(f.id);
        const last = msgs[msgs.length - 1];
        const unread = msgs.filter(m => m.receiver_id === currentUserId && !m.is_read).length;

        list.push({
            id: f.id,             // user_id للطرف الآخر
            userId: f.id,
            name: f.full_name || f.username || "User",
            avatar: f.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(f.username || 'U')}&background=1877f2&color=fff`,
            online: false,
            archived: false,
            unread: unread,
            messages: msgs.map(m => ({
                from: m.sender_id === currentUserId ? "me" : "them",
                text: m.message,
                time: fmtTime(m.created_at),
                created_at: m.created_at
            }))
        });
    }

    // رتّب: الأحاديث الأخيرة أولاً
    list.sort((a, b) => {
        const ta = a.messages[a.messages.length - 1]?.created_at || 0;
        const tb = b.messages[b.messages.length - 1]?.created_at || 0;
        return new Date(tb) - new Date(ta);
    });

    conversations = list;
}

// =========================================================
// عرض قائمة المحادثات
// =========================================================
function renderConversations() {
    if (!conversationsList) return;

    const searchTerm = (searchInput?.value || "").toLowerCase();
    const list = conversations.filter(c => {
        const okSearch = c.name.toLowerCase().includes(searchTerm);
        if (currentTab === "inbox")    return !c.archived && okSearch;
        if (currentTab === "sent")     return !c.archived && okSearch;
        if (currentTab === "archived") return c.archived && okSearch;
        return okSearch;
    });

    conversationsList.innerHTML = "";

    if (list.length === 0) {
        const li = document.createElement("li");
        li.style.cssText = "padding:20px;text-align:center;color:#999;font-size:13px;";
        li.textContent = tr("no_messages");
        conversationsList.appendChild(li);
        return;
    }

    list.forEach(conv => {
        const last = conv.messages[conv.messages.length - 1];
        const li = document.createElement("li");
        li.className = "conv-item" + (conv.id === currentChatId ? " active" : "");
        li.onclick = () => openChat(conv.id);

        li.innerHTML = `
            <img src="${conv.avatar}" class="conv-avatar" alt="">
            <div class="conv-info">
                <div class="conv-name">${esc(conv.name)}</div>
                <div class="conv-last">${last ? esc(last.text) : tr("no_messages")}</div>
            </div>
            <div class="conv-meta">
                <div class="conv-time">${last ? last.time : ""}</div>
                ${conv.unread > 0 ? `<div class="conv-unread">${conv.unread}</div>` : ""}
            </div>
        `;
        conversationsList.appendChild(li);
    });
}

// =========================================================
// فتح محادثة
// =========================================================
async function openChat(userId) {
    currentChatId = userId;
    const conv = conversations.find(c => c.id === userId);
    if (!conv) return;

    chatEmpty.style.display  = "none";
    chatActive.style.display = "flex";

    chatUserName.textContent = conv.name;
    chatUserStatus.textContent = tr("offline");
    chatUserStatus.className = "chat-user-status";

    // علّم الرسائل كمقروءة
    await sb.from("messages")
        .update({ is_read: true })
        .eq("sender_id", userId)
        .eq("receiver_id", currentUserId)
        .eq("is_read", false);

    // أعد تحميل الرسائل
    const msgs = await loadMessagesWith(userId);
    conv.messages = msgs.map(m => ({
        from: m.sender_id === currentUserId ? "me" : "them",
        text: m.message,
        time: fmtTime(m.created_at),
        created_at: m.created_at
    }));
    conv.unread = 0;

    renderMessages();
    renderConversations();
}

// =========================================================
// عرض الرسائل
// =========================================================
function renderMessages() {
    if (!currentChatId) return;
    const conv = conversations.find(c => c.id === currentChatId);
    if (!conv) return;

    chatBody.innerHTML = "";
    let lastDate = "";

    conv.messages.forEach(msg => {
        const dLabel = fmtDateLabel(msg.created_at);
        if (dLabel !== lastDate) {
            const sep = document.createElement("div");
            sep.style.cssText = "text-align:center;color:#999;font-size:12px;margin:12px 0;";
            sep.textContent = dLabel;
            chatBody.appendChild(sep);
            lastDate = dLabel;
        }

        const div = document.createElement("div");
        div.className = "chat-msg " + (msg.from === "me" ? "me" : "them");
        div.innerHTML = `
            ${esc(msg.text)}
            <span class="chat-msg-time">${msg.time}</span>
        `;
        chatBody.appendChild(div);
    });

    chatBody.scrollTop = chatBody.scrollHeight;
}

// =========================================================
// إرسال رسالة
// =========================================================
async function sendMessage() {
    const text = (messageInput.value || "").trim();
    if (!text || !currentChatId) return;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        alert("Please login first");
        return;
    }

    const { error } = await sb.from("messages").insert({
        sender_id: user.id,
        receiver_id: currentChatId,
        message: text,
        is_read: false
    });

    if (error) {
        console.error("❌ send error:", error);
        alert("Error: " + error.message);
        return;
    }

    messageInput.value = "";

    // حدّث الرؤية
    const conv = conversations.find(c => c.id === currentChatId);
    if (conv) {
        const now = new Date();
        conv.messages.push({
            from: "me",
            text: text,
            time: fmtTime(now),
            created_at: now.toISOString()
        });
    }

    renderMessages();
    renderConversations();
}

// =========================================================
// Realtime — استقبال رسائل جديدة
// =========================================================
function setupRealtime() {
    if (realtimeChannel) sb.removeChannel(realtimeChannel);

    realtimeChannel = sb
        .channel("messages-realtime")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `receiver_id=eq.${currentUserId}`
            },
            async (payload) => {
                const m = payload.new;
                const senderId = m.sender_id;

                let conv = conversations.find(c => c.id === senderId);
                if (!conv) {
                    // أضف المحادثة إن لم تكن موجودة
                    const { data: p } = await sb.from("profiles")
                        .select("id, username, full_name, avatar_url")
                        .eq("id", senderId)
                        .single();
                    if (p) {
                        conv = {
                            id: p.id,
                            userId: p.id,
                            name: p.full_name || p.username,
                            avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${p.username}&background=1877f2&color=fff`,
                            online: false, archived: false, unread: 0, messages: []
                        };
                        conversations.unshift(conv);
                    }
                }

                if (conv) {
                    conv.messages.push({
                        from: "them",
                        text: m.message,
                        time: fmtTime(m.created_at),
                        created_at: m.created_at
                    });
                    if (currentChatId !== senderId) conv.unread++;
                    if (currentChatId === senderId) {
                        renderMessages();
                        await sb.from("messages").update({ is_read: true }).eq("id", m.id);
                    }
                }
                renderConversations();
            }
        )
        .subscribe();
}

// =========================================================
// فتح محادثة من ?to=USER_ID
// =========================================================
async function openChatFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("to");
    if (!targetId) return;

    const { data: profile } = await sb.from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", targetId)
        .single();

    if (!profile) return;

    let conv = conversations.find(c => c.id === targetId);
    if (!conv) {
        conv = {
            id: profile.id,
            userId: profile.id,
            name: profile.full_name || profile.username,
            avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=1877f2&color=fff`,
            online: false, archived: false, unread: 0, messages: []
        };
        conversations.unshift(conv);
        renderConversations();
    }
    openChat(conv.id);
}

// =========================================================
// الأحداث
// =========================================================
document.querySelectorAll(".msg-tab").forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll(".msg-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentTab = tab.dataset.tab;
        renderConversations();
    };
});

if (searchInput) searchInput.addEventListener("input", renderConversations);
if (btnSend) btnSend.onclick = sendMessage;
if (messageInput) {
    messageInput.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });
}

if (btnEmoji) {
    btnEmoji.onclick = (e) => {
        e.stopPropagation();
        emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
    };
}

document.querySelectorAll(".emoji-grid span").forEach(span => {
    span.onclick = () => {
        messageInput.value += span.textContent;
        messageInput.focus();
    };
});

document.addEventListener("click", (e) => {
    if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== btnEmoji) {
        emojiPicker.style.display = "none";
    }
});

if (btnAttach) {
    btnAttach.onclick = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = () => {
            if (input.files.length > 0) alert("📎 " + input.files[0].name);
        };
        input.click();
    };
}

// New Message
if (newMessageBtn) {
    newMessageBtn.onclick = async () => {
        const friends = await loadFriends();
        if (friends.length === 0) {
            alert("لا يوجد أصدقاء بعد");
            return;
        }
        const options = friends.map((f, i) => `${i + 1}. ${f.full_name || f.username}`).join("\n");
        const pick = prompt("اختر صديقاً:\n" + options);
        const idx = parseInt(pick) - 1;
        if (isNaN(idx) || !friends[idx]) return;

        const f = friends[idx];
        let conv = conversations.find(c => c.id === f.id);
        if (!conv) {
            conv = {
                id: f.id, userId: f.id,
                name: f.full_name || f.username,
                avatar: f.avatar_url || `https://ui-avatars.com/api/?name=${f.username}&background=1877f2&color=fff`,
                online: false, archived: false, unread: 0, messages: []
            };
            conversations.unshift(conv);
            renderConversations();
        }
        openChat(conv.id);
    };
}

// =========================================================
// INITIALIZE
// =========================================================
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        console.warn("No user logged in");
        return;
    }
    currentUserId = user.id;

    await buildConversations();
    renderConversations();
    setupRealtime();
    await openChatFromUrl();
});