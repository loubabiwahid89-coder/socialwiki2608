
// =========================================================
// SOCIALWIKI 2608
// NOTIFICATIONS.JS
// =========================================================

console.log("🔔 NOTIFICATIONS.JS START");


// =========================================================
// SUPABASE CONFIG
// =========================================================

const NOTIFICATIONS_SUPABASE_URL =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const NOTIFICATIONS_SUPABASE_KEY =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";


// =========================================================
// CREATE SUPABASE CLIENT
// =========================================================

let notificationsSupabase = null;

if (window.supabase) {

    notificationsSupabase =
        window.supabase.createClient(
            NOTIFICATIONS_SUPABASE_URL,
            NOTIFICATIONS_SUPABASE_KEY
        );

    console.log(
        "✅ Notifications Supabase client created"
    );

} else {

    console.error(
        "❌ Supabase library NOT loaded"
    );

}


// =========================================================
// DOM ELEMENTS
// =========================================================

const notificationsList =
    document.getElementById(
        "notificationsList"
    );

const markAllButton =
    document.getElementById(
        "markAllNotificationsRead"
    );


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeNotificationHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================================
// FORMAT TIME
// =========================================================

function formatNotificationTime(dateValue) {

    if (!dateValue) {

        return "";

    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }

    const now =
        new Date();

    const difference =
        now.getTime() -
        date.getTime();

    const seconds =
        Math.floor(
            difference / 1000
        );

    const minutes =
        Math.floor(
            seconds / 60
        );

    const hours =
        Math.floor(
            minutes / 60
        );

    const days =
        Math.floor(
            hours / 24
        );


    if (seconds < 60) {

        return "Just now";

    }


    if (minutes < 60) {

        return (
            minutes +
            (
                minutes === 1
                    ? " minute ago"
                    : " minutes ago"
            )
        );

    }


    if (hours < 24) {

        return (
            hours +
            (
                hours === 1
                    ? " hour ago"
                    : " hours ago"
            )
        );

    }


    if (days < 7) {

        return (
            days +
            (
                days === 1
                    ? " day ago"
                    : " days ago"
            )
        );

    }


    return date.toLocaleDateString();

}


// =========================================================
// GET CURRENT USER
// =========================================================

async function getNotificationCurrentUser() {

    if (!notificationsSupabase) {

        console.error(
            "❌ Supabase client missing"
        );

        return null;

    }


    try {

        const {
            data,
            error
        } =
            await notificationsSupabase
                .auth
                .getSession();


        if (error) {

            console.error(
                "❌ Session error:",
                error
            );

            return null;

        }


        const session =
            data?.session;


        if (!session) {

            console.warn(
                "⚠️ No active session"
            );

            return null;

        }


        console.log(
            "👤 Current notification user:",
            session.user.id
        );


        return session.user;

    } catch (error) {

        console.error(
            "❌ Session exception:",
            error
        );

        return null;

    }

}


// =========================================================
// GET SENDER PROFILES
// NO AVATAR
// =========================================================

async function getNotificationSenders(
    notifications
) {

    if (
        !notificationsSupabase ||
        !notifications ||
        notifications.length === 0
    ) {

        return {};

    }


    const senderIds = [
        ...new Set(
            notifications
                .map(
                    notification =>
                        notification.sender_id
                )
                .filter(Boolean)
        )
    ];


    if (senderIds.length === 0) {

        return {};

    }


    console.log(
        "👥 Sender IDs:",
        senderIds
    );


    try {

        const {
            data: profiles,
            error
        } =
            await notificationsSupabase
                .from("profiles")
                .select(
                    "id, username, full_name"
                )
                .in(
                    "id",
                    senderIds
                );


        if (error) {

            console.error(
                "❌ Profiles query error:",
                error
            );

            return {};

        }


        console.log(
            "✅ Notification sender profiles:",
            profiles
        );


        const profileMap = {};


        (profiles || []).forEach(
            profile => {

                profileMap[
                    profile.id
                ] = profile;

            }
        );


        return profileMap;

    } catch (error) {

        console.error(
            "❌ Sender profiles exception:",
            error
        );

        return {};

    }

}


// =========================================================
// LOAD NOTIFICATIONS
// =========================================================

async function loadNotifications() {

    console.log(
        "🔔 Loading notifications..."
    );


    if (!notificationsList) {

        console.error(
            "❌ notificationsList NOT FOUND"
        );

        return;

    }


    if (!notificationsSupabase) {

        showNotificationsError(
            "Supabase is not available."
        );

        return;

    }


    // =====================================================
    // LOADING
    // =====================================================

    notificationsList.innerHTML = `

        <div class="notifications-state">

            <div class="loading-spinner"></div>

            <p>
                Loading notifications...
            </p>

        </div>

    `;


    // =====================================================
    // CURRENT USER
    // =====================================================

    const currentUser =
        await getNotificationCurrentUser();


    if (!currentUser) {

        notificationsList.innerHTML = `

            <div class="notifications-state">

                <div class="empty-icon">
                    🔐
                </div>

                <h2>
                    Please log in
                </h2>

                <p>
                    Please log in to see your notifications.
                </p>

            </div>

        `;

        return;

    }


    // =====================================================
    // GET NOTIFICATIONS
    // =====================================================

    try {

        const {
            data: notifications,
            error
        } =
            await notificationsSupabase

                .from("notifications")

                .select("*")

                .eq(
                    "receiver_id",
                    currentUser.id
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "❌ Notifications query error:",
                error
            );

            showNotificationsError(
                error.message ||
                "Unable to load notifications."
            );

            return;

        }


        console.log(
            "✅ Notifications loaded:",
            notifications
        );


        // =================================================
        // EMPTY
        // =================================================

        if (
            !notifications ||
            notifications.length === 0
        ) {

            showEmptyNotifications();

            updateMarkAllButton();

            return;

        }


        // =================================================
        // GET SENDERS
        // =================================================

        const senderProfiles =
            await getNotificationSenders(
                notifications
            );


        // =================================================
        // RENDER
        // =================================================

        renderNotifications(
            notifications,
            senderProfiles
        );


        // =================================================
        // UPDATE MARK ALL BUTTON
        // =================================================

        updateMarkAllButton(
            notifications
        );


        console.log(
            "✅ Notifications page ready"
        );

    } catch (error) {

        console.error(
            "❌ Notifications exception:",
            error
        );

        showNotificationsError(
            "An unexpected error occurred."
        );

    }

}


// =========================================================
// RENDER NOTIFICATIONS
// NO IMAGES
// =========================================================

function renderNotifications(
    notifications,
    senderProfiles
) {

    if (!notificationsList) {

        return;

    }


    notificationsList.innerHTML = "";


    notifications.forEach(
        function(notification) {


            // =================================================
            // GET SENDER PROFILE
            // =================================================

            const sender =
                senderProfiles[
                    notification.sender_id
                ] || {};


            const senderName =
                sender.full_name ||
                sender.username ||
                "Someone";


            // =================================================
            // CHECK UNREAD
            // =================================================

            const isUnread =
                notification.is_read === false ||
                notification.is_read === 0 ||
                notification.is_read === null;


            // =================================================
            // MAIN ITEM
            // =================================================

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "notification-item";


            if (isUnread) {

                item.classList.add(
                    "unread"
                );

            } else {

                item.classList.add(
                    "read"
                );

            }


            // =================================================
            // TYPE ICON
            // =================================================

            const typeIcon =
                document.createElement(
                    "div"
                );


            typeIcon.className =
                "notification-type-icon";


            typeIcon.textContent =
                getNotificationTypeIcon(
                    notification.type
                );


            // =================================================
            // CONTENT
            // =================================================

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "notification-content";


            // =================================================
            // MESSAGE
            // =================================================

            const message =
                document.createElement(
                    "div"
                );


            message.className =
                "notification-message";


            message.innerHTML =
                createNotificationMessage(
                    notification,
                    senderName
                );


            // =================================================
            // TIME
            // =================================================

            const time =
                document.createElement(
                    "div"
                );


            time.className =
                "notification-time";


            time.textContent =
                formatNotificationTime(
                    notification.created_at
                );


            // =================================================
            // UNREAD DOT
            // =================================================

            let dot = null;


            if (isUnread) {

                dot =
                    document.createElement(
                        "div"
                    );


                dot.className =
                    "notification-unread-dot";

            }


            // =================================================
            // APPEND CONTENT
            // =================================================

            item.appendChild(
                typeIcon
            );


            item.appendChild(
                content
            );


            if (dot) {

                item.appendChild(
                    dot
                );

            }


            content.appendChild(
                message
            );


            content.appendChild(
                time
            );


            // =================================================
            // CLICK NOTIFICATION
            // =================================================

            item.addEventListener(
                "click",
                async function() {

                    console.log(
                        "🔔 Notification clicked:",
                        notification.id
                    );


                    // -----------------------------------------
                    // MARK AS READ
                    // -----------------------------------------

                    if (isUnread) {

                        await markNotificationAsRead(
                            notification.id
                        );


                        item.classList.remove(
                            "unread"
                        );


                        item.classList.add(
                            "read"
                        );


                        const unreadDot =
                            item.querySelector(
                                ".notification-unread-dot"
                            );


                        if (unreadDot) {

                            unreadDot.remove();

                        }

                    }


                    // -----------------------------------------
                    // OPEN LINK IF AVAILABLE
                    // -----------------------------------------

                    if (
                        notification.link
                    ) {

                        console.log(
                            "🔗 Opening notification link:",
                            notification.link
                        );


                        window.location.href =
                            notification.link;


                        return;

                    }


                    // -----------------------------------------
                    // OPEN POST
                    // -----------------------------------------

                    if (
                        notification.post_id
                    ) {

                        console.log(
                            "📝 Opening post:",
                            notification.post_id
                        );


                        sessionStorage.setItem(
                            "viewPostId",
                            notification.post_id
                        );


                        window.location.href =
                            "index.html";


                        return;

                    }


                    // -----------------------------------------
                    // NO LINK
                    // -----------------------------------------

                    console.log(
                        "ℹ️ This notification has no link or post_id"
                    );

                }
            );


            notificationsList.appendChild(
                item
            );

        }
    );


    console.log(
        "✅ Notifications rendered:",
        notifications.length
    );

}


// =========================================================
// CREATE NOTIFICATION MESSAGE
// =========================================================

function createNotificationMessage(
    notification,
    senderName
) {

    const actor =
        escapeNotificationHTML(
            senderName ||
            "Someone"
        );


    const type =
        String(
            notification.type ||
            ""
        )
        .toLowerCase()
        .trim();


    // =====================================================
    // LIKE
    // =====================================================

    if (
        type === "like" ||
        type === "liked" ||
        type === "post_like"
    ) {

        return `
            <strong>${actor}</strong>
            liked your post 👍
        `;

    }


    // =====================================================
    // COMMENT
    // =====================================================

    if (
        type === "comment" ||
        type === "commented" ||
        type === "post_comment"
    ) {

        return `
            <strong>${actor}</strong>
            commented on your post 💬
        `;

    }


    // =====================================================
    // SHARE
    // =====================================================

    if (
        type === "share" ||
        type === "shared" ||
        type === "post_share"
    ) {

        return `
            <strong>${actor}</strong>
            shared your post 🔄
        `;

    }


    // =====================================================
    // FRIEND REQUEST
    // =====================================================

    if (
        type === "friend_request" ||
        type === "friendrequest"
    ) {

        return `
            <strong>${actor}</strong>
            sent you a friend request 👤
        `;

    }


    // =====================================================
    // FRIEND ACCEPTED
    // =====================================================

    if (
        type === "friend_accepted" ||
        type === "friend_accept"
    ) {

        return `
            <strong>${actor}</strong>
            accepted your friend request 🤝
        `;

    }


    // =====================================================
    // FOLLOW
    // =====================================================

    if (
        type === "follow" ||
        type === "followed"
    ) {

        return `
            <strong>${actor}</strong>
            followed you 👤
        `;

    }


    // =====================================================
    // GROUP
    // =====================================================

    if (
        type === "group" ||
        type === "group_invite" ||
        type === "group_invitation" ||
        type === "group_post" ||
        type === "group_comment"
    ) {

        if (notification.message) {

            return `
                <strong>${actor}</strong>
                ${escapeNotificationHTML(
                    notification.message
                )}
            `;

        }


        return `
            <strong>${actor}</strong>
            sent you a group notification 👥
        `;

    }


    // =====================================================
    // CUSTOM MESSAGE
    // =====================================================

    if (
        notification.message
    ) {

        return `
            <strong>${actor}</strong>
            ${escapeNotificationHTML(
                notification.message
            )}
        `;

    }


    // =====================================================
    // DEFAULT
    // =====================================================

    return `
        <strong>${actor}</strong>
        sent you a notification 🔔
    `;

}


// =========================================================
// NOTIFICATION TYPE ICON
// =========================================================

function getNotificationTypeIcon(
    type
) {

    const notificationType =
        String(
            type || ""
        )
        .toLowerCase()
        .trim();


    if (
        notificationType === "like" ||
        notificationType === "liked" ||
        notificationType === "post_like"
    ) {

        return "❤️";

    }


    if (
        notificationType === "comment" ||
        notificationType === "commented" ||
        notificationType === "post_comment"
    ) {

        return "💬";

    }


    if (
        notificationType === "share" ||
        notificationType === "shared" ||
        notificationType === "post_share"
    ) {

        return "🔄";

    }


    if (
        notificationType === "friend_request" ||
        notificationType === "friendrequest"
    ) {

        return "👤";

    }


    if (
        notificationType === "friend_accepted" ||
        notificationType === "friend_accept"
    ) {

        return "🤝";

    }


    if (
        notificationType === "follow" ||
        notificationType === "followed"
    ) {

        return "👤";

    }


    if (
        notificationType.includes("group")
    ) {

        return "👥";

    }


    return "🔔";

}


// =========================================================
// SHOW EMPTY NOTIFICATIONS
// =========================================================

function showEmptyNotifications() {

    if (!notificationsList) {

        return;

    }


    notificationsList.innerHTML = `

        <div class="notifications-state">

            <div class="empty-icon">
                🔔
            </div>

            <h2>
                No notifications yet
            </h2>

            <p>
                When someone likes, comments on,
                or shares your posts, you will see
                the notifications here.
            </p>

        </div>

    `;


    console.log(
        "ℹ️ No notifications"
    );

}


// =========================================================
// SHOW ERROR
// =========================================================

function showNotificationsError(
    message
) {

    if (!notificationsList) {

        return;

    }


    notificationsList.innerHTML = `

        <div class="notifications-error">

            ❌ ${escapeNotificationHTML(
                message
            )}

        </div>

    `;

}


// =========================================================
// MARK ONE NOTIFICATION AS READ
// =========================================================

async function markNotificationAsRead(
    notificationId
) {

    if (
        !notificationId ||
        !notificationsSupabase
    ) {

        return;

    }


    try {

        const currentUser =
            await getNotificationCurrentUser();


        if (!currentUser) {

            return;

        }


        const {
            error
        } =
            await notificationsSupabase

                .from("notifications")

                .update({
                    is_read: true
                })

                .eq(
                    "id",
                    notificationId
                )

                .eq(
                    "receiver_id",
                    currentUser.id
                );


        if (error) {

            console.error(
                "❌ Mark notification read error:",
                error
            );

            return;

        }


        console.log(
            "✅ Notification marked as read:",
            notificationId
        );


    } catch (error) {

        console.error(
            "❌ Mark read exception:",
            error
        );

    }

}


// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

async function markAllNotificationsAsRead() {

    console.log(
        "📖 Marking all notifications as read..."
    );


    if (!notificationsSupabase) {

        return;

    }


    const currentUser =
        await getNotificationCurrentUser();


    if (!currentUser) {

        console.warn(
            "⚠️ No current user"
        );

        return;

    }


    if (markAllButton) {

        markAllButton.disabled = true;

        markAllButton.textContent =
            "Marking...";

    }


    try {

        const {
            error
        } =
            await notificationsSupabase

                .from("notifications")

                .update({
                    is_read: true
                })

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
                "❌ Mark all read error:",
                error
            );


            if (markAllButton) {

                markAllButton.disabled =
                    false;

                markAllButton.textContent =
                    "Mark all as read";

            }


            return;

        }


        console.log(
            "✅ All notifications marked as read"
        );


        // -----------------------------------------------------
        // UPDATE UI
        // -----------------------------------------------------

        document
            .querySelectorAll(
                ".notification-item.unread"
            )
            .forEach(
                function(item) {

                    item.classList.remove(
                        "unread"
                    );


                    item.classList.add(
                        "read"
                    );


                    const dot =
                        item.querySelector(
                            ".notification-unread-dot"
                        );


                    if (dot) {

                        dot.remove();

                    }

                }
            );


        if (markAllButton) {

            markAllButton.disabled =
                true;

            markAllButton.textContent =
                "All notifications read";

        }

    } catch (error) {

        console.error(
            "❌ Mark all exception:",
            error
        );


        if (markAllButton) {

            markAllButton.disabled =
                false;

            markAllButton.textContent =
                "Mark all as read";

        }

    }

}


// =========================================================
// UPDATE MARK ALL BUTTON
// =========================================================

function updateMarkAllButton(
    notifications = []
) {

    if (!markAllButton) {

        return;

    }


    const hasUnread =
        notifications.some(
            notification =>
                notification.is_read === false ||
                notification.is_read === 0 ||
                notification.is_read === null
        );


    if (hasUnread) {

        markAllButton.disabled =
            false;

        markAllButton.textContent =
            "Mark all as read";

    } else {

        markAllButton.disabled =
            true;

        markAllButton.textContent =
            "All notifications read";

    }

}


// =========================================================
// MARK ALL BUTTON EVENT
// =========================================================

if (markAllButton) {

    markAllButton.addEventListener(
        "click",
        markAllNotificationsAsRead
    );

}


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "📄 Notifications DOM READY"
        );


        await loadNotifications();

    }
);


// =========================================================
// END
// =========================================================

console.log(
    "🔔 NOTIFICATIONS.JS END"
);

