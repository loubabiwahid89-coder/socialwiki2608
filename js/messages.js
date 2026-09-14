/* =========================================================
   SOCIALWIKI - MESSAGES PAGE LOGIC
   ========================================================= */

// بيانات تجريبية
let conversations = [
    {
        id: 1,
        name: "Ahmed Hassan",
        avatar: "https://ui-avatars.com/api/?name=Ahmed&background=1877f2&color=fff",
        online: true, archived: false, unread: 2,
        messages: [
            { from: "them", text: "مرحباً! كيف حالك؟", time: "10:20" },
            { from: "me",   text: "بخير الحمد لله، وأنت؟", time: "10:22" },
            { from: "them", text: "تمام! هل رأيت التحديث الجديد؟", time: "10:23" }
        ]
    },
    {
        id: 2,
        name: "Sara Ali",
        avatar: "https://ui-avatars.com/api/?name=Sara&background=e91e63&color=fff",
        online: false, archived: false, unread: 0,
        messages: [
            { from: "them", text: "أرسلت لك الملف الآن", time: "09:10" },
            { from: "me",   text: "شكراً جزيلاً!", time: "09:12" }
        ]
    },
    {
        id: 3,
        name: "Youssef Mohamed",
        avatar: "https://ui-avatars.com/api/?name=Youssef&background=4caf50&color=fff",
        online: true, archived: false, unread: 5,
        messages: [
            { from: "them", text: "هل نلتقي غداً؟", time: "08:00" }
        ]
    },
    {
        id: 4,
        name: "Layla Ibrahim",
        avatar: "https://ui-avatars.com/api/?name=Layla&background=9c27b0&color=fff",
        online: false, archived: true, unread: 0,
        messages: [
            { from: "me", text: "سنتكلم لاحقاً", time: "أمس" }
        ]
    }
];

let currentChatId = null;
let currentTab = "inbox";

// ========== عناصر DOM ==========
const conversationsList = document.getElementById("conversationsList");
const chatEmpty        = document.getElementById("chatEmpty");
const chatActive       = document.getElementById("chatActive");
const chatBody         = document.getElementById("chatBody");
const chatUserName     = document.getElementById("chatUserName");
const chatUserStatus   = document.getElementById("chatUserStatus");
const messageInput     = document.getElementById("messageInput");
const btnSend          = document.getElementById("btnSend");
const btnEmoji         = document.getElementById("btnEmoji");
const btnAttach        = document.getElementById("btnAttach");
const emojiPicker      = document.getElementById("emojiPicker");
const searchInput      = document.getElementById("searchConversations");
const btnArchive       = document.getElementById("btnArchive");
const btnMute          = document.getElementById("btnMute");
const btnBlock         = document.getElementById("btnBlock");
const btnDelete        = document.getElementById("btnDelete");
const newMessageBtn    = document.getElementById("newMessageBtn");

// ========== Helper: t() ==========
function tr(key) {
    if (typeof window.t === "function") return window.t(key);
    return key;
}

// ========== عرض قائمة المحادثات ==========
function renderConversations() {
    if (!conversationsList) return;

    const searchTerm = (searchInput?.value || "").toLowerCase();
    const list = conversations.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm);
        if (currentTab === "inbox")    return !c.archived && matchesSearch;
        if (currentTab === "sent")     return !c.archived && matchesSearch;
        if (currentTab === "archived") return c.archived && matchesSearch;
        return true;
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
        const lastMsg = conv.messages[conv.messages.length - 1];
        const li = document.createElement("li");
        li.className = "conv-item" + (conv.id === currentChatId ? " active" : "");
        li.onclick = () => openChat(conv.id);

        li.innerHTML = `
            <img src="${conv.avatar}" class="conv-avatar" alt="">
            <div class="conv-info">
                <div class="conv-name">${conv.name}</div>
                <div class="conv-last">${lastMsg ? lastMsg.text : tr("no_messages")}</div>
            </div>
            <div class="conv-meta">
                <div class="conv-time">${lastMsg ? lastMsg.time : ""}</div>
                ${conv.unread > 0 ? `<div class="conv-unread">${conv.unread}</div>` : ""}
            </div>
        `;
        conversationsList.appendChild(li);
    });
}

// ========== فتح محادثة ==========
function openChat(id) {
    currentChatId = id;
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    conv.unread = 0;

    chatEmpty.style.display  = "none";
    chatActive.style.display = "flex";

    chatUserName.textContent = conv.name;

    const isOnline = conv.online;
    chatUserStatus.textContent = isOnline ? tr("online") : tr("offline");
    chatUserStatus.className = "chat-user-status " + (isOnline ? "online" : "offline");

    renderMessages();
    renderConversations();
}

// ========== عرض الرسائل ==========
function renderMessages() {
    if (!currentChatId) return;

    const conv = conversations.find(c => c.id === currentChatId);
    if (!conv) return;

    chatBody.innerHTML = "";

    conv.messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = "chat-msg " + (msg.from === "me" ? "me" : "them");
        div.innerHTML = `
            ${msg.text}
            <span class="chat-msg-time">${msg.time}</span>
        `;
        chatBody.appendChild(div);
    });

    chatBody.scrollTop = chatBody.scrollHeight;
}

// ========== إرسال رسالة ==========
function sendMessage() {
    const text = (messageInput.value || "").trim();
    if (!text || !currentChatId) return;

    const conv = conversations.find(c => c.id === currentChatId);
    if (!conv) return;

    const now = new Date();
    const time = now.getHours().toString().padStart(2, "0") + ":" +
                 now.getMinutes().toString().padStart(2, "0");

    conv.messages.push({ from: "me", text, time });
    messageInput.value = "";
    renderMessages();
    renderConversations();
}

// ========== التبويبات ==========
document.querySelectorAll(".msg-tab").forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll(".msg-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentTab = tab.dataset.tab;
        renderConversations();
    };
});

// ========== البحث ==========
if (searchInput) searchInput.addEventListener("input", renderConversations);

// ========== الإرسال ==========
if (btnSend) btnSend.onclick = sendMessage;
if (messageInput) {
    messageInput.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });
}

// ========== الإيموجي ==========
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

// ========== المرفقات ==========
if (btnAttach) {
    btnAttach.onclick = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = () => {
            if (input.files.length > 0) {
                alert("📎 " + input.files[0].name);
            }
        };
        input.click();
    };
}

// ========== أزرار المحادثة ==========
if (btnArchive) {
    btnArchive.onclick = () => {
        if (!currentChatId) return;
        const conv = conversations.find(c => c.id === currentChatId);
        if (conv) { conv.archived = !conv.archived; renderConversations(); }
    };
}

if (btnMute) {
    btnMute.onclick = () => {
        btnMute.textContent = btnMute.textContent === "🔕" ? "🔔" : "🔕";
    };
}

if (btnBlock) {
    btnBlock.onclick = () => {
        if (confirm(tr("are_you_sure"))) alert(tr("block"));
    };
}

if (btnDelete) {
    btnDelete.onclick = () => {
        if (!currentChatId) return;
        if (confirm(tr("are_you_sure"))) {
            conversations = conversations.filter(c => c.id !== currentChatId);
            currentChatId = null;
            chatActive.style.display = "none";
            chatEmpty.style.display = "flex";
            renderConversations();
        }
    };
}

// ========== رسالة جديدة ==========
if (newMessageBtn) {
    newMessageBtn.onclick = () => {
        const name = prompt(tr("new_message"));
        if (name && name.trim()) {
            const newId = Math.max(...conversations.map(c => c.id), 0) + 1;
            conversations.unshift({
                id: newId,
                name: name.trim(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=1877f2&color=fff`,
                online: false, archived: false, unread: 0, messages: []
            });
            renderConversations();
            openChat(newId);
        }
    };
}

// ========== إعادة الترجمة عند تغيير اللغة ==========
const originalApplyTranslations = window.applyTranslations;
window.applyTranslations = function() {
    if (originalApplyTranslations) originalApplyTranslations();
    if (currentChatId) {
        const conv = conversations.find(c => c.id === currentChatId);
        if (conv) {
            chatUserStatus.textContent = conv.online ? tr("online") : tr("offline");
        }
    }
    renderConversations();
};

// ========== التشغيل ==========
document.addEventListener("DOMContentLoaded", () => {
    renderConversations();
});