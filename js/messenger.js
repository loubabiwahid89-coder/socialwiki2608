
// =========================================================
// SOCIALWIKI MESSENGER
// MESSENGER.JS
// REAL-TIME VERSION
// + UNREAD MESSAGES BADGES
// + AUTO OPEN USER FROM ?user_id=UUID
// =========================================================

console.log("💬 messenger.js loaded");


// =========================================================
// SUPABASE
// =========================================================

let messengerSupabase =
    window.supabaseClient || null;

if (!messengerSupabase) {

    if (!window.supabase) {

        console.error(
            "❌ Supabase library not found"
        );

    } else {

        const SUPABASE_URL =
            "https://hvslktufqrgdgrgxmvcm.supabase.co";

        const SUPABASE_KEY =
            "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

        messengerSupabase =
            window.supabase.createClient(
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

        console.log(
            "✅ Messenger Supabase client created"
        );

    }

}


// =========================================================
// DOM ELEMENTS
// =========================================================

const messengerSearch =
    document.getElementById(
        "messengerSearch"
    );

const messengerFriends =
    document.getElementById(
        "messengerFriends"
    );

const chatUserAvatar =
    document.getElementById(
        "chatUserAvatar"
    );

const chatUserName =
    document.getElementById(
        "chatUserName"
    );

const chatUserStatus =
    document.getElementById(
        "chatUserStatus"
    );

const messagesContainer =
    document.getElementById(
        "messagesContainer"
    );

const messageForm =
    document.getElementById(
        "messageForm"
    );

const messageInput =
    document.getElementById(
        "messageInput"
    );

const sendMessageButton =
    document.getElementById(
        "sendMessageButton"
    );


// =========================================================
// GLOBAL STATE
// =========================================================

let currentUser =
    null;

let friends =
    [];

let selectedFriend =
    null;

let realtimeChannel =
    null;


// =========================================================
// UNREAD STATE
// =========================================================

let unreadMessages =
    {};


// =========================================================
// DEFAULT AVATAR
// =========================================================

const DEFAULT_AVATAR =
    "images/iconprofile.png";


// =========================================================
// GET USER ID FROM URL
// Contact Seller sends:
// messenger.html?user_id=SELLER_UUID
// =========================================================

function getTargetUserIdFromUrl() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const userId =
            params.get(
                "user_id"
            );

        if (!userId) {
            return null;
        }

        return userId.trim();

    } catch (error) {

        console.error(
            "❌ Error reading user_id from URL:",
            error
        );

        return null;
    }

}


// =========================================================
// GET CURRENT USER
// =========================================================

async function getCurrentUser() {

    if (!messengerSupabase) {
        return null;
    }

    try {

        const {
            data,
            error
        } =
            await messengerSupabase.auth.getUser();

        if (error) {

            console.error(
                "❌ Error getting current user:",
                error
            );

            return null;
        }

        return data?.user || null;

    } catch (error) {

        console.error(
            "❌ getCurrentUser error:",
            error
        );

        return null;
    }

}


// =========================================================
// LOAD FRIENDS
// =========================================================

async function loadMessengerFriends() {

    if (!messengerFriends) {
        return;
    }

    if (!currentUser) {

        messengerFriends.innerHTML = `
            <div class="messenger-empty">
                Please log in to use Messenger.
            </div>
        `;

        return;
    }

    messengerFriends.innerHTML = `
        <div class="messenger-empty">
            Loading friends...
        </div>
    `;

    try {

        const {
            data,
            error
        } =
            await messengerSupabase
                .from("friends")
                .select("friend_id")
                .eq(
                    "user_id",
                    currentUser.id
                );

        if (error) {

            console.error(
                "❌ Error loading friends:",
                error
            );

            messengerFriends.innerHTML = `
                <div class="messenger-empty">
                    Unable to load friends.
                </div>
            `;

            return;
        }

        if (!data || data.length === 0) {

            friends =
                [];

            unreadMessages =
                {};

            messengerFriends.innerHTML = `
                <div class="messenger-empty">
                    You don't have any friends yet.
                </div>
            `;

            updateMessengerGlobalBadge();

            return;
        }

        const friendIds =
            data
                .map(
                    row =>
                        row.friend_id
                )
                .filter(Boolean);

        if (friendIds.length === 0) {

            friends =
                [];

            renderFriends(
                []
            );

            return;
        }

        const {
            data: profiles,
            error: profilesError
        } =
            await messengerSupabase
                .from("profiles")
                .select(`
                    id,
                    username,
                    full_name,
                    avatar_url
                `)
                .in(
                    "id",
                    friendIds
                );

        if (profilesError) {

            console.error(
                "❌ Error loading friend profiles:",
                profilesError
            );

            messengerFriends.innerHTML = `
                <div class="messenger-empty">
                    Unable to load friend profiles.
                </div>
            `;

            return;
        }

        friends =
            profiles || [];

        await loadUnreadMessages();

        renderFriends(
            friends
        );

    } catch (error) {

        console.error(
            "❌ loadMessengerFriends error:",
            error
        );

        messengerFriends.innerHTML = `
            <div class="messenger-empty">
                Something went wrong.
            </div>
        `;

    }

}


// =========================================================
// LOAD TARGET USER FROM URL
// Used by Contact Seller
// =========================================================

async function openTargetUserFromUrl() {

    const targetUserId =
        getTargetUserIdFromUrl();

    if (!targetUserId) {

        console.log(
            "ℹ️ No target user in URL."
        );

        return;

    }

    console.log(
        "🎯 Target user from URL:",
        targetUserId
    );


    // ---------------------------------------------
    // Prevent opening our own profile
    // ---------------------------------------------

    if (
        currentUser &&
        targetUserId === currentUser.id
    ) {

        console.warn(
            "⚠️ Target user is the current user."
        );

        return;

    }


    // ---------------------------------------------
    // First check loaded friends
    // ---------------------------------------------

    const existingFriend =
        friends.find(
            friend =>
                String(friend.id) ===
                String(targetUserId)
        );

    if (existingFriend) {

        console.log(
            "✅ Target user found in friends list."
        );

        await selectFriend(
            existingFriend
        );

        return;

    }


    // ---------------------------------------------
    // If not a friend, load profile directly
    // ---------------------------------------------

    console.log(
        "🔎 Target user is not in friends list. Loading profile..."
    );

    try {

        const {
            data: profile,
            error
        } =
            await messengerSupabase
                .from("profiles")
                .select(`
                    id,
                    username,
                    full_name,
                    avatar_url
                `)
                .eq(
                    "id",
                    targetUserId
                )
                .maybeSingle();

        if (error) {

            console.error(
                "❌ Error loading target profile:",
                error
            );

            return;

        }

        if (!profile) {

            console.warn(
                "⚠️ Target profile not found:",
                targetUserId
            );

            return;

        }


        // ---------------------------------------------
        // Add temporary target to current list
        // ---------------------------------------------

        const alreadyExists =
            friends.some(
                friend =>
                    String(friend.id) ===
                    String(profile.id)
            );

        if (!alreadyExists) {

            friends = [
                profile,
                ...friends
            ];

        }


        console.log(
            "✅ Target seller profile loaded:",
            profile
        );


        // ---------------------------------------------
        // Render and automatically select
        // ---------------------------------------------

        renderFriends(
            getCurrentDisplayedFriends()
        );

        await selectFriend(
            profile
        );


    } catch (error) {

        console.error(
            "❌ openTargetUserFromUrl error:",
            error
        );

    }

}


// =========================================================
// LOAD UNREAD MESSAGES
// =========================================================

async function loadUnreadMessages() {

    if (!currentUser) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await messengerSupabase
                .from("messages")
                .select(`
                    id,
                    sender_id
                `)
                .eq(
                    "receiver_id",
                    currentUser.id
                )
                .eq(
                    "is_read",
                    false
                );

        if (error) {

            console.error(
                "❌ Error loading unread messages:",
                error
            );

            return;
        }

        unreadMessages =
            {};

        (data || []).forEach(
            message => {

                const senderId =
                    message.sender_id;

                if (!senderId) {
                    return;
                }

                if (
                    !unreadMessages[
                        senderId
                    ]
                ) {

                    unreadMessages[
                        senderId
                    ] = 0;

                }

                unreadMessages[
                    senderId
                ]++;

            }
        );

        console.log(
            "🔴 Unread messages:",
            unreadMessages
        );

        updateMessengerGlobalBadge();

    } catch (error) {

        console.error(
            "❌ loadUnreadMessages error:",
            error
        );

    }

}


// =========================================================
// GET TOTAL UNREAD
// =========================================================

function getTotalUnreadMessages() {

    return Object.values(
        unreadMessages
    ).reduce(
        (
            total,
            count
        ) =>
            total +
            Number(
                count || 0
            ),
        0
    );

}


// =========================================================
// UPDATE GLOBAL MESSENGER BADGE
// =========================================================

function updateMessengerGlobalBadge() {

    const totalUnread =
        getTotalUnreadMessages();

    const messengerLinks =
        document.querySelectorAll(
            'a[href*="messenger.html"], a[href*="messenger"]'
        );

    messengerLinks.forEach(
        link => {

            let badge =
                link.querySelector(
                    ".messenger-unread-badge"
                );

            if (!badge) {

                badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "messenger-unread-badge";

                badge.hidden =
                    true;

                link.appendChild(
                    badge
                );

            }

            if (totalUnread > 0) {

                badge.textContent =
                    totalUnread > 99
                        ? "99+"
                        : String(
                            totalUnread
                        );

                badge.hidden =
                    false;

            } else {

                badge.textContent =
                    "";

                badge.hidden =
                    true;

            }

        }
    );

    console.log(
        "🔴 Total unread:",
        totalUnread
    );

}


// =========================================================
// RENDER FRIENDS
// =========================================================

function renderFriends(list) {

    if (!messengerFriends) {
        return;
    }

    if (
        !list ||
        list.length === 0
    ) {

        messengerFriends.innerHTML = `
            <div class="messenger-empty">
                No friends found.
            </div>
        `;

        return;
    }

    messengerFriends.innerHTML =
        "";

    list.forEach(
        friend => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "messenger-friend";

            if (
                selectedFriend &&
                selectedFriend.id ===
                    friend.id
            ) {

                button.classList.add(
                    "active"
                );

            }

            const avatar =
                friend.avatar_url ||
                DEFAULT_AVATAR;

            const displayName =
                friend.full_name ||
                friend.username ||
                "User";

            const username =
                friend.username
                    ? "@" +
                      friend.username
                    : "";

            const unreadCount =
                Number(
                    unreadMessages[
                        friend.id
                    ] || 0
                );

            button.innerHTML = `

                <img
                    class="messenger-friend-avatar"
                    src="${escapeHtml(
                        avatar
                    )}"
                    alt="User"
                >

                <div class="messenger-friend-info">

                    <p class="messenger-friend-name">
                        ${escapeHtml(
                            displayName
                        )}
                    </p>

                    <p class="messenger-friend-username">
                        ${escapeHtml(
                            username
                        )}
                    </p>

                </div>

                <span
                    class="messenger-friend-unread"
                    ${
                        unreadCount === 0
                            ? "hidden"
                            : ""
                    }
                >
                    ${
                        unreadCount > 99
                            ? "99+"
                            : unreadCount
                    }
                </span>

            `;

            const image =
                button.querySelector(
                    ".messenger-friend-avatar"
                );

            if (image) {

                image.addEventListener(
                    "error",
                    function () {

                        this.src =
                            DEFAULT_AVATAR;

                    }
                );

            }

            button.addEventListener(
                "click",
                () => {

                    selectFriend(
                        friend
                    );

                }
            );

            messengerFriends.appendChild(
                button
            );

        }
    );

    updateMessengerGlobalBadge();

}


// =========================================================
// SEARCH FRIENDS
// =========================================================

function searchMessengerFriends() {

    const searchText =
        messengerSearch
            ?.value
            ?.trim()
            .toLowerCase() || "";

    if (!searchText) {

        renderFriends(
            friends
        );

        return;
    }

    const filtered =
        friends.filter(
            friend => {

                const username =
                    (
                        friend.username ||
                        ""
                    ).toLowerCase();

                const fullName =
                    (
                        friend.full_name ||
                        ""
                    ).toLowerCase();

                return (
                    username.includes(
                        searchText
                    ) ||
                    fullName.includes(
                        searchText
                    )
                );

            }
        );

    renderFriends(
        filtered
    );

}


// =========================================================
// SELECT FRIEND
// =========================================================

async function selectFriend(
    friend
) {

    if (!friend) {
        return;
    }

    selectedFriend =
        friend;

    unreadMessages[
        friend.id
    ] = 0;

    updateMessengerGlobalBadge();

    renderFriends(
        getCurrentDisplayedFriends()
    );

    const avatar =
        friend.avatar_url ||
        DEFAULT_AVATAR;

    const displayName =
        friend.full_name ||
        friend.username ||
        "User";

    if (chatUserAvatar) {

        chatUserAvatar.src =
            avatar;

        chatUserAvatar.onerror =
            function () {

                this.src =
                    DEFAULT_AVATAR;

            };

    }

    if (chatUserName) {

        chatUserName.textContent =
            displayName;

    }

    if (chatUserStatus) {

        chatUserStatus.textContent =
            friend.username
                ? "@" +
                  friend.username
                : "Friend";

    }

    if (messageInput) {

        messageInput.disabled =
            false;

        messageInput.focus();

    }

    if (sendMessageButton) {

        sendMessageButton.disabled =
            false;

    }

    await loadMessages();

    setupRealtimeMessages();

}


// =========================================================
// CURRENT DISPLAYED FRIENDS
// =========================================================

function getCurrentDisplayedFriends() {

    const searchText =
        messengerSearch
            ?.value
            ?.trim()
            .toLowerCase() || "";

    if (!searchText) {

        return friends;

    }

    return friends.filter(
        friend => {

            const username =
                (
                    friend.username ||
                    ""
                ).toLowerCase();

            const fullName =
                (
                    friend.full_name ||
                    ""
                ).toLowerCase();

            return (
                username.includes(
                    searchText
                ) ||
                fullName.includes(
                    searchText
                )
            );

        }
    );

}


// =========================================================
// LOAD MESSAGES
// =========================================================

async function loadMessages() {

    if (!currentUser) {
        return;
    }

    if (!selectedFriend) {

        showWelcome();

        return;
    }

    if (!messagesContainer) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await messengerSupabase
                .from("messages")
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    message,
                    is_read,
                    created_at
                `)
                .or(
                    `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedFriend.id}),and(sender_id.eq.${selectedFriend.id},receiver_id.eq.${currentUser.id})`
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "❌ Error loading messages:",
                error
            );

            messagesContainer.innerHTML = `

                <div class="chat-welcome">

                    <div class="chat-welcome-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load messages
                    </h2>

                    <p>
                        Please check the messages table in Supabase.
                    </p>

                </div>

            `;

            return;
        }

        renderMessages(
            data || []
        );

        await markMessagesAsRead();

        unreadMessages[
            selectedFriend.id
        ] = 0;

        updateMessengerGlobalBadge();

        renderFriends(
            getCurrentDisplayedFriends()
        );

    } catch (error) {

        console.error(
            "❌ loadMessages error:",
            error
        );

    }

}


// =========================================================
// RENDER MESSAGES
// =========================================================

function renderMessages(
    messages
) {

    if (!messagesContainer) {
        return;
    }

    if (
        !messages ||
        messages.length === 0
    ) {

        messagesContainer.innerHTML = `

            <div class="chat-welcome">

                <div class="chat-welcome-icon">
                    💬
                </div>

                <h2>
                    Start a conversation
                </h2>

                <p>
                    Send your first message to
                    ${escapeHtml(
                        selectedFriend?.full_name ||
                        selectedFriend?.username ||
                        "your friend"
                    )}.
                </p>

            </div>

        `;

        return;
    }

    messagesContainer.innerHTML =
        "";

    messages.forEach(
        msg => {

            const isSent =
                msg.sender_id ===
                currentUser.id;

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "message-row " +
                (
                    isSent
                        ? "sent"
                        : "received"
                );

            const bubble =
                document.createElement(
                    "div"
                );

            bubble.className =
                "message-bubble";

            const messageText =
                document.createElement(
                    "div"
                );

            messageText.textContent =
                msg.message || "";

            const time =
                document.createElement(
                    "span"
                );

            time.className =
                "message-time";

            time.textContent =
                formatMessageTime(
                    msg.created_at
                );

            bubble.appendChild(
                messageText
            );

            bubble.appendChild(
                time
            );

            row.appendChild(
                bubble
            );

            messagesContainer.appendChild(
                row
            );

        }
    );

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

}


// =========================================================
// SEND MESSAGE
// =========================================================

async function sendMessage() {

    if (!currentUser) {

        alert(
            "Please log in first."
        );

        return;
    }

    if (!selectedFriend) {

        alert(
            "Please select a friend first."
        );

        return;
    }

    const text =
        messageInput
            ?.value
            ?.trim();

    if (!text) {
        return;
    }

    if (sendMessageButton) {

        sendMessageButton.disabled =
            true;

    }

    try {

        const {
            data,
            error
        } =
            await messengerSupabase
                .from("messages")
                .insert({

                    sender_id:
                        currentUser.id,

                    receiver_id:
                        selectedFriend.id,

                    message:
                        text,

                    is_read:
                        false

                })
                .select()
                .single();

        if (error) {

            console.error(
                "❌ Error sending message:",
                error
            );

            alert(
                "Unable to send message."
            );

            return;
        }

        console.log(
            "✅ Message sent:",
            data
        );

        messageInput.value =
            "";

        messageInput.focus();

    } catch (error) {

        console.error(
            "❌ sendMessage error:",
            error
        );

        alert(
            "Something went wrong while sending the message."
        );

    } finally {

        if (sendMessageButton) {

            sendMessageButton.disabled =
                false;

        }

    }

}


// =========================================================
// MARK MESSAGES AS READ
// =========================================================

async function markMessagesAsRead() {

    if (!currentUser) {
        return;
    }

    if (!selectedFriend) {
        return;
    }

    try {

        const {
            error
        } =
            await messengerSupabase
                .from("messages")
                .update({
                    is_read: true
                })
                .eq(
                    "sender_id",
                    selectedFriend.id
                )
                .eq(
                    "receiver_id",
                    currentUser.id
                )
                .eq(
                    "is_read",
                    false
                );

        if (error) {

            console.error(
                "❌ Error marking messages as read:",
                error
            );

        }

    } catch (error) {

        console.error(
            "❌ markMessagesAsRead error:",
            error
        );

    }

}


// =========================================================
// REALTIME MESSAGES
// =========================================================

function setupRealtimeMessages() {

    if (!messengerSupabase) {

        console.error(
            "❌ Supabase is not available for Realtime"
        );

        return;
    }

    if (!currentUser) {
        return;
    }

    if (!selectedFriend) {
        return;
    }

    if (realtimeChannel) {

        messengerSupabase.removeChannel(
            realtimeChannel
        );

        realtimeChannel =
            null;

    }

    console.log(
        "⚡ Starting Realtime for:",
        selectedFriend.id
    );

    realtimeChannel =
        messengerSupabase
            .channel(
                "messenger-" +
                currentUser.id +
                "-" +
                selectedFriend.id +
                "-" +
                Date.now()
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages"
                },
                async payload => {

                    console.log(
                        "⚡ REALTIME MESSAGE:",
                        payload.new
                    );

                    const newMessage =
                        payload.new;

                    if (!newMessage) {
                        return;
                    }

                    const isIncoming =
                        newMessage.receiver_id ===
                        currentUser.id;


                    // ---------------------------------------------
                    // OUR OWN MESSAGE
                    // ---------------------------------------------

                    if (!isIncoming) {

                        const belongsToCurrentChat =
                            selectedFriend &&
                            (
                                (
                                    newMessage.sender_id ===
                                    currentUser.id &&
                                    newMessage.receiver_id ===
                                    selectedFriend.id
                                )
                                ||
                                (
                                    newMessage.sender_id ===
                                    selectedFriend.id &&
                                    newMessage.receiver_id ===
                                    currentUser.id
                                )
                            );

                        if (
                            belongsToCurrentChat
                        ) {

                            await loadMessages();

                        }

                        return;
                    }


                    // ---------------------------------------------
                    // INCOMING MESSAGE FROM CURRENT CHAT
                    // ---------------------------------------------

                    if (
                        selectedFriend &&
                        newMessage.sender_id ===
                        selectedFriend.id
                    ) {

                        console.log(
                            "💬 Incoming message belongs to current chat"
                        );

                        await loadMessages();

                        return;

                    }


                    // ---------------------------------------------
                    // INCOMING MESSAGE FROM ANOTHER FRIEND
                    // ---------------------------------------------

                    const senderId =
                        newMessage.sender_id;

                    if (!senderId) {
                        return;
                    }

                    if (
                        !unreadMessages[
                            senderId
                        ]
                    ) {

                        unreadMessages[
                            senderId
                        ] = 0;

                    }

                    unreadMessages[
                        senderId
                    ]++;

                    console.log(
                        "🔴 New unread message from:",
                        senderId,
                        "Count:",
                        unreadMessages[
                            senderId
                        ]
                    );

                    renderFriends(
                        getCurrentDisplayedFriends()
                    );

                    updateMessengerGlobalBadge();

                }
            )
            .subscribe(
                status => {

                    console.log(
                        "📡 Messenger Realtime status:",
                        status
                    );

                    if (
                        status ===
                        "SUBSCRIBED"
                    ) {

                        console.log(
                            "✅ Messenger Realtime connected"
                        );

                    }

                }
            );

}


// =========================================================
// SHOW WELCOME
// =========================================================

function showWelcome() {

    if (!messagesContainer) {
        return;
    }

    messagesContainer.innerHTML = `

        <div class="chat-welcome">

            <div class="chat-welcome-icon">
                💬
            </div>

            <h2>
                Welcome to Messenger
            </h2>

            <p>
                Select a friend to start a conversation.
            </p>

        </div>

    `;

}


// =========================================================
// FORMAT MESSAGE TIME
// =========================================================

function formatMessageTime(
    dateString
) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            dateString
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// =========================================================
// SEARCH EVENT
// =========================================================

if (messengerSearch) {

    messengerSearch.addEventListener(
        "input",
        searchMessengerFriends
    );

}


// =========================================================
// MESSAGE FORM
// =========================================================

if (messageForm) {

    messageForm.addEventListener(
        "submit",
        async function (
            event
        ) {

            event.preventDefault();

            await sendMessage();

        }
    );

}


// =========================================================
// ENTER TO SEND
// =========================================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (
            event
        ) {

            if (
                event.key ===
                    "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (
                    sendMessageButton &&
                    !sendMessageButton.disabled
                ) {

                    messageForm.requestSubmit();

                }

            }

        }
    );

}


// =========================================================
// CLEANUP REALTIME
// =========================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (
            realtimeChannel &&
            messengerSupabase
        ) {

            messengerSupabase.removeChannel(
                realtimeChannel
            );

        }

    }
);


// =========================================================
// INITIALIZE MESSENGER
// =========================================================

async function initializeMessenger() {

    console.log(
        "🚀 Initializing Messenger..."
    );

    if (!messengerSupabase) {

        console.error(
            "❌ Messenger Supabase is not available"
        );

        return;
    }

    currentUser =
        await getCurrentUser();

    if (!currentUser) {

        console.warn(
            "⚠️ No logged-in user"
        );

        if (messengerFriends) {

            messengerFriends.innerHTML = `
                <div class="messenger-empty">
                    Please log in to use Messenger.
                </div>
            `;

        }

        return;
    }

    console.log(
        "👤 Messenger user:",
        currentUser.id
    );

    // ---------------------------------------------
    // LOAD NORMAL FRIENDS
    // ---------------------------------------------

    await loadMessengerFriends();


    // ---------------------------------------------
    // AUTO OPEN CONTACT SELLER
    // ---------------------------------------------

    await openTargetUserFromUrl();


    console.log(
        "⚡ Messenger unread system ready"
    );

    console.log(
        "⚡ Messenger initialized"
    );

}


// =========================================================
// START
// =========================================================

initializeMessenger();

console.log(
    "✅ MESSENGER REALTIME + UNREAD SYSTEM READY"
);

