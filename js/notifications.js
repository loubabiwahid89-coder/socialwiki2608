// =========================================================
// SOCIALWIKI NOTIFICATIONS SYSTEM
// REAL NOTIFICATIONS + REAL-TIME BADGE + FRIEND REQUEST BADGE
// + GROUP INVITATIONS
// =========================================================

console.log("🔔 NOTIFICATIONS.JS LOADED");
console.log("🔥 NOTIFICATIONS VERSION: UNREAD-ONLY-FIX-2");


// =========================================================
// SUPABASE
// =========================================================

let notificationSupabase =
    window.supabaseClient || null;


// =========================================================
// CREATE CLIENT IF NEEDED
// =========================================================

if (!notificationSupabase && window.supabase) {

    notificationSupabase =
        window.supabase.createClient(
            "https://hvslktufqrgdgrgxmvcm.supabase.co",
            "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT"
        );

    window.supabaseClient =
        notificationSupabase;

    console.log(
        "✅ Notification Supabase client created"
    );
}


// =========================================================
// CHECK SUPABASE
// =========================================================

if (!notificationSupabase) {

    console.error(
        "❌ Supabase client not available for notifications"
    );

} else {

    console.log(
        "✅ Notification Supabase ready"
    );

}


// =========================================================
// ELEMENTS
// =========================================================

const notificationButton =
    document.getElementById(
        "notificationButton"
    );

const notificationBadge =
    document.getElementById(
        "notificationBadge"
    );

const friendsBadge =
    document.getElementById(
        "friendsBadge"
    );

const notificationsPanel =
    document.getElementById(
        "notificationsPanel"
    );

const notificationsList =
    document.getElementById(
        "notificationsList"
    );

const markNotificationsRead =
    document.getElementById(
        "markAllNotificationsRead"
    );


// =========================================================
// NOTIFICATION PANEL POSITION
// =========================================================

function positionNotificationsPanel() {

    if (
        !notificationButton ||
        !notificationsPanel
    ) {

        return;
    }

    const buttonRect =
        notificationButton.getBoundingClientRect();

    const panelWidth = 360;

    let left =
        buttonRect.right - panelWidth;

    let top =
        buttonRect.bottom + 8;

    const viewportWidth =
        window.innerWidth;

    const viewportHeight =
        window.innerHeight;

    if (left < 10) {

        left = 10;
    }

    if (
        left + panelWidth >
        viewportWidth - 10
    ) {

        left =
            viewportWidth -
            panelWidth -
            10;
    }

    if (
        viewportWidth <= 600
    ) {

        left = 10;

        top =
            buttonRect.bottom + 8;

        notificationsPanel.style.width =
            "calc(100vw - 20px)";

    } else {

        notificationsPanel.style.width =
            panelWidth + "px";
    }

    const panelHeight =
        Math.min(
            notificationsPanel.scrollHeight || 520,
            520
        );

    if (
        top + panelHeight >
        viewportHeight - 10
    ) {

        top =
            Math.max(
                10,
                viewportHeight -
                panelHeight -
                10
            );
    }

    notificationsPanel.style.position =
        "fixed";

    notificationsPanel.style.left =
        left + "px";

    notificationsPanel.style.top =
        top + "px";

    notificationsPanel.style.right =
        "auto";

    notificationsPanel.style.zIndex =
        "99999";
}


// =========================================================
// MOVE PANEL TO BODY
// =========================================================

if (
    notificationsPanel &&
    notificationsPanel.parentElement !== document.body
) {

    document.body.appendChild(
        notificationsPanel
    );

    console.log(
        "📦 Notifications panel moved to BODY"
    );
}


// =========================================================
// DEBUG
// =========================================================

console.log(
    "🔔 notificationButton:",
    notificationButton
);

console.log(
    "🔴 notificationBadge:",
    notificationBadge
);

console.log(
    "👥 friendsBadge:",
    friendsBadge
);

console.log(
    "📦 notificationsPanel:",
    notificationsPanel
);

console.log(
    "📋 notificationsList:",
    notificationsList
);

console.log(
    "📖 markNotificationsRead:",
    markNotificationsRead
);


// =========================================================
// REALTIME CHANNEL
// =========================================================

let notificationRealtimeChannel =
    null;


// =========================================================
// POLLING TIMER
// =========================================================

let notificationPollingTimer =
    null;


// =========================================================
// GET CURRENT USER
// =========================================================

async function getNotificationUser() {

    if (!notificationSupabase) {

        return null;
    }

    try {

        const {
            data,
            error
        } =
            await notificationSupabase
                .auth
                .getUser();

        if (error) {

            console.error(
                "❌ Get notification user error:",
                error
            );

            return null;
        }

        return data?.user || null;

    }

    catch (error) {

        console.error(
            "❌ Get notification user exception:",
            error
        );

        return null;
    }
}


// =========================================================
// FORMAT TIME
// =========================================================

function formatNotificationTime(
    createdAt
) {

    if (!createdAt) {

        return "";
    }

    const date =
        new Date(
            createdAt
        );

    const now =
        new Date();

    const difference =
        Math.floor(
            (
                now.getTime() -
                date.getTime()
            ) / 1000
        );

    if (difference < 0) {

        return "منذ قليل";
    }

    if (difference < 60) {

        return "منذ قليل";
    }

    if (difference < 3600) {

        const minutes =
            Math.floor(
                difference / 60
            );

        return (
            "منذ " +
            minutes +
            " دقيقة"
        );
    }

    if (difference < 86400) {

        const hours =
            Math.floor(
                difference / 3600
            );

        return (
            "منذ " +
            hours +
            " ساعة"
        );
    }

    if (difference < 604800) {

        const days =
            Math.floor(
                difference / 86400
            );

        return (
            "منذ " +
            days +
            " يوم"
        );
    }

    return date.toLocaleString();
}


// =========================================================
// GET NOTIFICATION MESSAGE
// =========================================================

function getNotificationMessage(
    notification,
    sender,
    group
) {

    const senderName =
        sender?.full_name ||
        sender?.username ||
        "Someone";


    if (
        notification.type === "like"
    ) {

        return (
            "👍 " +
            senderName +
            " liked your post"
        );
    }


    if (
        notification.type === "comment"
    ) {

        return (
            "💬 " +
            senderName +
            " commented on your post"
        );
    }


    if (
        notification.type === "share"
    ) {

        return (
            "↗ " +
            senderName +
            " shared your post"
        );
    }


    if (
        notification.type === "friend_request"
    ) {

        return (
            "👥 " +
            senderName +
            " sent you a friend request"
        );
    }


    if (
        notification.type === "friend_accepted"
    ) {

        return (
            "✅ " +
            senderName +
            " accepted your friend request"
        );
    }


    if (
        notification.type === "friend_rejected"
    ) {

        return (
            "❌ " +
            senderName +
            " declined your friend request"
        );
    }


    if (
        notification.type === "group_invite"
    ) {

        const groupName =
            group?.name ||
            "this group";

        return (
            "📩 " +
            senderName +
            " invited you to join " +
            groupName
        );
    }


    return (
        notification.message ||
        "New notification"
    );
}


// =========================================================
// MARK ONE NOTIFICATION AS READ
// =========================================================

async function markNotificationAsRead(
    notificationId
) {

    if (!notificationSupabase) {

        return false;
    }

    if (!notificationId) {

        return false;
    }

    const user =
        await getNotificationUser();

    if (!user) {

        return false;
    }

    const {
        error
    } =
        await notificationSupabase
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
                user.id
            );

    if (error) {

        console.error(
            "❌ Mark notification read error:",
            error
        );

        return false;
    }

    console.log(
        "✅ Notification marked as read:",
        notificationId
    );

    return true;
}


// =========================================================
// UPDATE NOTIFICATION BADGE
// =========================================================

async function updateNotificationBadge() {

    if (!notificationSupabase) {

        return;
    }

    if (!notificationBadge) {

        return;
    }

    const user =
        await getNotificationUser();

    if (!user) {

        notificationBadge.textContent =
            "0";

        notificationBadge.hidden =
            true;

        notificationBadge.style.display =
            "none";

        return;
    }

    const {
        count,
        error
    } =
        await notificationSupabase
            .from("notifications")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "receiver_id",
                user.id
            )
            .eq(
                "is_read",
                false
            );

    if (error) {

        console.error(
            "❌ Badge error:",
            error
        );

        return;
    }

    const unreadCount =
        count || 0;

    if (
        unreadCount > 0
    ) {

        notificationBadge.textContent =
            unreadCount > 99
                ? "99+"
                : String(unreadCount);

        notificationBadge.hidden =
            false;

        notificationBadge.style.display =
            "flex";

    } else {

        notificationBadge.textContent =
            "0";

        notificationBadge.hidden =
            true;

        notificationBadge.style.display =
            "none";
    }
}


window.updateNotificationBadge =
    updateNotificationBadge;


// =========================================================
// UPDATE FRIEND REQUEST BADGE
// =========================================================

async function updateFriendRequestBadge() {

    if (!notificationSupabase) {

        return;
    }

    const badge =
        document.getElementById(
            "friendsBadge"
        );

    if (!badge) {

        return;
    }

    const user =
        await getNotificationUser();

    if (!user) {

        badge.textContent =
            "0";

        badge.hidden =
            true;

        badge.style.display =
            "none";

        return;
    }

    const {
        count,
        error
    } =
        await notificationSupabase
            .from("friend_requests")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "receiver_id",
                user.id
            )
            .eq(
                "status",
                "pending"
            );

    if (error) {

        console.error(
            "❌ Friend request badge error:",
            error
        );

        return;
    }

    const pendingRequests =
        count || 0;

    if (
        pendingRequests > 0
    ) {

        badge.textContent =
            pendingRequests > 99
                ? "99+"
                : String(pendingRequests);

        badge.hidden =
            false;

        badge.style.display =
            "flex";

    } else {

        badge.textContent =
            "0";

        badge.hidden =
            true;

        badge.style.display =
            "none";
    }
}


// =========================================================
// OPEN POST FROM NOTIFICATION
// =========================================================

function openNotificationPost(
    postId
) {

    if (!postId) {

        console.warn(
            "⚠️ Notification has no post_id"
        );

        return;
    }

    console.log(
        "📌 Opening post from notification:",
        postId
    );

    const postElement =
        document.querySelector(
            `[data-post-id="${postId}"]`
        );

    if (!postElement) {

        console.warn(
            "⚠️ Post element not found for post_id:",
            postId
        );

        return;
    }

    postElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    postElement.classList.add(
        "notification-post-highlight"
    );

    setTimeout(
        function () {

            postElement.classList.remove(
                "notification-post-highlight"
            );

        },
        2500
    );
}


// =========================================================
// ACCEPT GROUP INVITATION
// =========================================================

async function acceptGroupInvitation(
    notification,
    item
) {

    console.log(
        "✅ Accepting group invitation:",
        notification
    );

    if (!notificationSupabase) {

        return;
    }

    if (
        !notification ||
        !notification.group_invitation_id
    ) {

        console.error(
            "❌ Missing group invitation ID"
        );

        alert(
            "This group invitation is invalid."
        );

        return;
    }

    const user =
        await getNotificationUser();

    if (!user) {

        alert(
            "Please log in first."
        );

        return;
    }

    try {

        const {
            data: invitation,
            error: invitationError
        } =
            await notificationSupabase
                .from("group_invitations")
                .select(`
                    id,
                    group_id,
                    inviter_id,
                    invited_user_id,
                    status
                `)
                .eq(
                    "id",
                    notification.group_invitation_id
                )
                .eq(
                    "invited_user_id",
                    user.id
                )
                .maybeSingle();

        if (invitationError) {

            console.error(
                "❌ Invitation lookup error:",
                invitationError
            );

            alert(
                "Could not load this invitation: " +
                invitationError.message
            );

            return;
        }

        if (!invitation) {

            alert(
                "Invitation not found."
            );

            return;
        }

        if (
            invitation.status !== "pending"
        ) {

            alert(
                "This invitation has already been processed."
            );

            await loadNotifications();

            return;
        }

        const {
            data: existingMember,
            error: memberCheckError
        } =
            await notificationSupabase
                .from("group_members")
                .select(
                    "group_id"
                )
                .eq(
                    "group_id",
                    invitation.group_id
                )
                .eq(
                    "user_id",
                    user.id
                )
                .maybeSingle();

        if (memberCheckError) {

            console.error(
                "❌ Membership check error:",
                memberCheckError
            );

            alert(
                "Could not check group membership: " +
                memberCheckError.message
            );

            return;
        }

        if (existingMember) {

            console.log(
                "ℹ️ User is already a member"
            );

            const {
                error: invitationUpdateError
            } =
                await notificationSupabase
                    .from("group_invitations")
                    .update({
                        status: "accepted"
                    })
                    .eq(
                        "id",
                        invitation.id
                    )
                    .eq(
                        "invited_user_id",
                        user.id
                    );

            if (invitationUpdateError) {

                console.error(
                    "❌ Invitation update error:",
                    invitationUpdateError
                );
            }

            await markNotificationAsRead(
                notification.id
            );

            await loadNotifications();

            await updateNotificationBadge();

            return;
        }

        const {
            error: insertMemberError
        } =
            await notificationSupabase
                .from("group_members")
                .insert({

                    group_id:
                        invitation.group_id,

                    user_id:
                        user.id,

                    role:
                        "member"

                });

        if (insertMemberError) {

            console.error(
                "❌ Add member error:",
                insertMemberError
            );

            alert(
                "Could not join the group: " +
                insertMemberError.message
            );

            return;
        }

        console.log(
            "✅ User added to group"
        );

        const {
            error: updateInvitationError
        } =
            await notificationSupabase
                .from("group_invitations")
                .update({
                    status: "accepted"
                })
                .eq(
                    "id",
                    invitation.id
                )
                .eq(
                    "invited_user_id",
                    user.id
                );

        if (updateInvitationError) {

            console.error(
                "❌ Invitation status update error:",
                updateInvitationError
            );

            await notificationSupabase
                .from("group_members")
                .delete()
                .eq(
                    "group_id",
                    invitation.group_id
                )
                .eq(
                    "user_id",
                    user.id
                );

            alert(
                "Could not complete the invitation."
            );

            return;
        }

        await markNotificationAsRead(
            notification.id
        );

        console.log(
            "🎉 GROUP INVITATION ACCEPTED"
        );

        alert(
            "✅ You joined the group successfully!"
        );

        await loadNotifications();

        await updateNotificationBadge();

    }

    catch (error) {

        console.error(
            "❌ Accept group invitation error:",
            error
        );

        alert(
            "Could not accept invitation: " +
            error.message
        );
    }
}


// =========================================================
// DECLINE GROUP INVITATION
// =========================================================

async function declineGroupInvitation(
    notification,
    item
) {

    console.log(
        "❌ Declining group invitation:",
        notification
    );

    if (!notificationSupabase) {

        return;
    }

    if (
        !notification ||
        !notification.group_invitation_id
    ) {

        console.error(
            "❌ Missing group invitation ID"
        );

        alert(
            "This group invitation is invalid."
        );

        return;
    }

    const user =
        await getNotificationUser();

    if (!user) {

        alert(
            "Please log in first."
        );

        return;
    }

    try {

        const {
            data,
            error
        } =
            await notificationSupabase
                .from("group_invitations")
                .update({
                    status: "declined"
                })
                .eq(
                    "id",
                    notification.group_invitation_id
                )
                .eq(
                    "invited_user_id",
                    user.id
                )
                .eq(
                    "status",
                    "pending"
                )
                .select()
                .maybeSingle();

        if (error) {

            console.error(
                "❌ Decline invitation error:",
                error
            );

            alert(
                "Could not decline invitation: " +
                error.message
            );

            return;
        }

        if (!data) {

            alert(
                "This invitation has already been processed."
            );

            await loadNotifications();

            return;
        }

        await markNotificationAsRead(
            notification.id
        );

        console.log(
            "✅ GROUP INVITATION DECLINED"
        );

        await loadNotifications();

        await updateNotificationBadge();

    }

    catch (error) {

        console.error(
            "❌ Decline group invitation exception:",
            error
        );

        alert(
            "Could not decline invitation: " +
            error.message
        );
    }
}


window.acceptGroupInvitation =
    acceptGroupInvitation;

window.declineGroupInvitation =
    declineGroupInvitation;


// =========================================================
// =========================================================
// DISPLAY ONE NOTIFICATION
// =========================================================

function displayNotification(
    notification,
    sender,
    group
) {

    const item =
        document.createElement(
            "div"
        );

    item.className =
        "notification-item";

    item.dataset.notificationId =
        notification.id;


    // =====================================================
    // SAVE POST ID
    // =====================================================

    if (
        notification.post_id
    ) {

        item.dataset.postId =
            notification.post_id;
    }


    // =====================================================
    // UNREAD STYLE
    // =====================================================

    if (
        notification.is_read === false
    ) {

        item.classList.add(
            "unread"
        );
    }


    // =====================================================
    // POST NOTIFICATION
    // =====================================================

    const isPostNotification =
        notification.type === "like" ||
        notification.type === "comment" ||
        notification.type === "share";


    // =====================================================
    // MAKE POST NOTIFICATION CLICKABLE
    // =====================================================

    if (
        isPostNotification &&
        notification.post_id
    ) {

        item.style.cursor =
            "pointer";

        item.title =
            "Click to open the post";
    }


    // =====================================================
    // HEADER
    // =====================================================

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "notification-header";


    // =====================================================
    // AVATAR
    // =====================================================

    const avatar =
        document.createElement(
            "img"
        );

    avatar.className =
        "notification-avatar";

    avatar.src =
        sender?.avatar_url ||
        "images/iconprofile.png";

    avatar.alt =
        sender?.username ||
        "User";

    avatar.style.width =
        "42px";

    avatar.style.height =
        "42px";

    avatar.style.minWidth =
        "42px";

    avatar.style.minHeight =
        "42px";

    avatar.style.maxWidth =
        "42px";

    avatar.style.maxHeight =
        "42px";

    avatar.style.objectFit =
        "cover";

    avatar.style.borderRadius =
        "50%";

    avatar.style.display =
        "block";

    avatar.style.flex =
        "0 0 42px";


    avatar.onerror =
        function () {

            this.src =
                "images/iconprofile.png";

        };


    // =====================================================
    // CONTENT
    // =====================================================

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "notification-content";


    // =====================================================
    // MESSAGE
    // =====================================================

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "notification-message";

    message.textContent =
        getNotificationMessage(
            notification,
            sender,
            group
        );


    // =====================================================
    // TIME
    // =====================================================

    const time =
        document.createElement(
            "small"
        );

    time.className =
        "notification-time";

    time.textContent =
        formatNotificationTime(
            notification.created_at
        );


    content.appendChild(
        message
    );

    content.appendChild(
        time
    );


    // =====================================================
    // VIEW POST BUTTON
    // =====================================================

    if (
        isPostNotification &&
        notification.post_id
    ) {

        const viewPostButton =
            document.createElement(
                "button"
            );

        viewPostButton.type =
            "button";

        viewPostButton.textContent =
            "👁 View post";

        viewPostButton.className =
            "notification-view-post";


        viewPostButton.style.marginTop =
            "8px";

        viewPostButton.style.padding =
            "6px 10px";

        viewPostButton.style.border =
            "none";

        viewPostButton.style.borderRadius =
            "8px";

        viewPostButton.style.cursor =
            "pointer";

        viewPostButton.style.fontWeight =
            "600";


        // =================================================
        // VIEW POST BUTTON CLICK
        // =================================================

        viewPostButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                event.stopPropagation();


                console.log(
                    "👁 View post clicked:",
                    notification.post_id
                );


                // =========================================
                // MARK AS READ
                // =========================================

                if (
                    notification.is_read === false
                ) {

                    const success =
                        await markNotificationAsRead(
                            notification.id
                        );


                    if (!success) {

                        return;
                    }


                    notification.is_read =
                        true;


                    item.classList.remove(
                        "unread"
                    );
                }


                // =========================================
                // OPEN POST
                // =========================================

                openNotificationPost(
                    notification.post_id
                );


                // =========================================
                // REMOVE NOTIFICATION
                // =========================================

                item.remove();


                await updateNotificationBadge();


                // =========================================
                // EMPTY MESSAGE
                // =========================================

                if (
                    notificationsList &&
                    notificationsList.querySelectorAll(
                        ".notification-item"
                    ).length === 0
                ) {

                    notificationsList.innerHTML = `
                        <p class="no-notifications">
                            No notifications yet.
                        </p>
                    `;
                }

            }
        );


        content.appendChild(
            viewPostButton
        );
    }


    // =====================================================
    // GROUP INVITATION BUTTONS
    // =====================================================

    if (
        notification.type ===
        "group_invite"
    ) {

        const invitationButtons =
            document.createElement(
                "div"
            );

        invitationButtons.className =
            "group-invitation-actions";

        invitationButtons.style.display =
            "flex";

        invitationButtons.style.gap =
            "8px";

        invitationButtons.style.marginTop =
            "10px";

        invitationButtons.style.flexWrap =
            "wrap";


        // =================================================
        // ACCEPT BUTTON
        // =================================================

        const acceptButton =
            document.createElement(
                "button"
            );

        acceptButton.type =
            "button";

        acceptButton.textContent =
            "✅ Accept";

        acceptButton.className =
            "group-invitation-accept";

        acceptButton.style.border =
            "none";

        acceptButton.style.borderRadius =
            "8px";

        acceptButton.style.padding =
            "7px 12px";

        acceptButton.style.cursor =
            "pointer";

        acceptButton.style.fontWeight =
            "600";


        // =================================================
        // DECLINE BUTTON
        // =================================================

        const declineButton =
            document.createElement(
                "button"
            );

        declineButton.type =
            "button";

        declineButton.textContent =
            "❌ Decline";

        declineButton.className =
            "group-invitation-decline";

        declineButton.style.border =
            "none";

        declineButton.style.borderRadius =
            "8px";

        declineButton.style.padding =
            "7px 12px";

        declineButton.style.cursor =
            "pointer";

        declineButton.style.fontWeight =
            "600";


        // =================================================
        // ACCEPT EVENT
        // =================================================

        acceptButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                event.stopPropagation();

                acceptButton.disabled =
                    true;

                declineButton.disabled =
                    true;

                acceptButton.textContent =
                    "Joining...";

                await acceptGroupInvitation(
                    notification,
                    item
                );

            }
        );


        // =================================================
        // DECLINE EVENT
        // =================================================

        declineButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                event.stopPropagation();

                acceptButton.disabled =
                    true;

                declineButton.disabled =
                    true;

                declineButton.textContent =
                    "Declining...";

                await declineGroupInvitation(
                    notification,
                    item
                );

            }
        );


        invitationButtons.appendChild(
            acceptButton
        );

        invitationButtons.appendChild(
            declineButton
        );

        content.appendChild(
            invitationButtons
        );
    }


    // =====================================================
    // BUILD NOTIFICATION
    // =====================================================

    header.appendChild(
        avatar
    );

    header.appendChild(
        content
    );

    item.appendChild(
        header
    );


    // =====================================================
    // NORMAL NOTIFICATION CLICK
    // =====================================================

    item.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            // =================================================
            // GROUP INVITATION
            // =================================================

            if (
                notification.type ===
                "group_invite"
            ) {

                return;
            }


            // =================================================
            // MARK AS READ
            // =================================================

            if (
                notification.is_read === false
            ) {

                const success =
                    await markNotificationAsRead(
                        notification.id
                    );


                if (!success) {

                    return;
                }


                notification.is_read =
                    true;


                item.classList.remove(
                    "unread"
                );
            }


            // =================================================
            // OPEN POST
            // =================================================

            if (
                isPostNotification &&
                notification.post_id
            ) {

                openNotificationPost(
                    notification.post_id
                );
            }


            // =================================================
            // REMOVE READ NOTIFICATION
            // =================================================

            item.remove();


            await updateNotificationBadge();


            // =================================================
            // SHOW EMPTY MESSAGE
            // =================================================

            if (
                notificationsList &&
                notificationsList.querySelectorAll(
                    ".notification-item"
                ).length === 0
            ) {

                notificationsList.innerHTML = `
                    <p class="no-notifications">
                        No notifications yet.
                    </p>
                `;
            }

        }
    );


    return item;
}
    // =====================================================
    // SAVE POST ID ON THE NOTIFICATION ELEMENT
    // =====================================================

    if (
        notification.post_id
    ) {

        item.dataset.postId =
            notification.post_id;
    }


    // =====================================================
    // UNREAD STYLE
    // =====================================================

    if (
        notification.is_read === false
    ) {

        item.classList.add(
            "unread"
        );
    }


    // =====================================================
    // MAKE POST NOTIFICATIONS LOOK CLICKABLE
    // =====================================================

    const isPostNotification =
        notification.type === "like" ||
        notification.type === "comment" ||
        notification.type === "share";


    if (
        isPostNotification &&
        notification.post_id
    ) {

        item.style.cursor =
            "pointer";

        item.title =
            "Click to open the post";
    }


    // =====================================================
    // HEADER
    // =====================================================

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "notification-header";


    // =====================================================
    // AVATAR
    // =====================================================

    const avatar =
        document.createElement(
            "img"
        );

    avatar.className =
        "notification-avatar";

    avatar.src =
        sender?.avatar_url ||
        "images/iconprofile.png";

    avatar.alt =
        sender?.username ||
        "User";

    avatar.style.width =
        "42px";

    avatar.style.height =
        "42px";

    avatar.style.minWidth =
        "42px";

    avatar.style.minHeight =
        "42px";

    avatar.style.maxWidth =
        "42px";

    avatar.style.maxHeight =
        "42px";

    avatar.style.objectFit =
        "cover";

    avatar.style.borderRadius =
        "50%";

    avatar.style.display =
        "block";

    avatar.style.flex =
        "0 0 42px";


    avatar.onerror =
        function () {

            this.src =
                "images/iconprofile.png";
        };


    // =====================================================
    // CONTENT
    // =====================================================

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "notification-content";


    // =====================================================
    // MESSAGE
    // =====================================================

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "notification-message";

    message.textContent =
        getNotificationMessage(
            notification,
            sender,
            group
        );


    // =====================================================
    // TIME
    // =====================================================

    const time =
        document.createElement(
            "small"
        );

    time.className =
        "notification-time";

    time.textContent =
        formatNotificationTime(
            notification.created_at
        );


    content.appendChild(
        message
    );

    content.appendChild(
        time
    );


    // =====================================================
    // GROUP INVITATION BUTTONS
    // =====================================================

    if (
        notification.type ===
        "group_invite"
    ) {

        const invitationButtons =
            document.createElement(
                "div"
            );

        invitationButtons.className =
            "group-invitation-actions";

        invitationButtons.style.display =
            "flex";

        invitationButtons.style.gap =
            "8px";

        invitationButtons.style.marginTop =
            "10px";

        invitationButtons.style.flexWrap =
            "wrap";


        // =================================================
        // ACCEPT BUTTON
        // =================================================

        const acceptButton =
            document.createElement(
                "button"
            );

        acceptButton.type =
            "button";

        acceptButton.textContent =
            "✅ Accept";

        acceptButton.className =
            "group-invitation-accept";

        acceptButton.style.border =
            "none";

        acceptButton.style.borderRadius =
            "8px";

        acceptButton.style.padding =
            "7px 12px";

        acceptButton.style.cursor =
            "pointer";

        acceptButton.style.fontWeight =
            "600";


        // =================================================
        // DECLINE BUTTON
        // =================================================

        const declineButton =
            document.createElement(
                "button"
            );

        declineButton.type =
            "button";

        declineButton.textContent =
            "❌ Decline";

        declineButton.className =
            "group-invitation-decline";

        declineButton.style.border =
            "none";

        declineButton.style.borderRadius =
            "8px";

        declineButton.style.padding =
            "7px 12px";

        declineButton.style.cursor =
            "pointer";

        declineButton.style.fontWeight =
            "600";


        // =================================================
        // ACCEPT EVENT
        // =================================================

        acceptButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                event.stopPropagation();

                acceptButton.disabled =
                    true;

                declineButton.disabled =
                    true;

                acceptButton.textContent =
                    "Joining...";

                await acceptGroupInvitation(
                    notification,
                    item
                );
            }
        );


        // =================================================
        // DECLINE EVENT
        // =================================================

        declineButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                event.stopPropagation();

                acceptButton.disabled =
                    true;

                declineButton.disabled =
                    true;

                declineButton.textContent =
                    "Declining...";

                await declineGroupInvitation(
                    notification,
                    item
                );
            }
        );


        invitationButtons.appendChild(
            acceptButton
        );

        invitationButtons.appendChild(
            declineButton
        );

        content.appendChild(
            invitationButtons
        );
    }


    // =====================================================
    // BUILD NOTIFICATION
    // =====================================================

    header.appendChild(
        avatar
    );

    header.appendChild(
        content
    );

    item.appendChild(
        header
    );


    // =====================================================
    // NORMAL NOTIFICATION CLICK
    // =====================================================

    item.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            // =================================================
            // GROUP INVITATION
            // Buttons handle the action
            // =================================================

            if (
                notification.type ===
                "group_invite"
            ) {

                return;
            }


            // =================================================
            // MARK AS READ
            // =================================================

            if (
                notification.is_read === false
            ) {

                const success =
                    await markNotificationAsRead(
                        notification.id
                    );


                if (!success) {

                    return;
                }


                notification.is_read =
                    true;


                item.classList.remove(
                    "unread"
                );
            }


            // =================================================
            // OPEN POST
            // =================================================

            if (
                isPostNotification &&
                notification.post_id
            ) {

                openNotificationPost(
                    notification.post_id
                );
            }


            // =================================================
            // REMOVE READ NOTIFICATION
            // =================================================

            item.remove();


            await updateNotificationBadge();


            // =================================================
            // SHOW EMPTY MESSAGE
            // =================================================

            if (
                notificationsList &&
                notificationsList.querySelectorAll(
                    ".notification-item"
                ).length === 0
            ) {

                notificationsList.innerHTML = `
                    <p class="no-notifications">
                        No notifications yet.
                    </p>
                `;
            }

        }
    );


    return item;
}


// =========================================================
// LOAD NOTIFICATIONS
// IMPORTANT: LOAD UNREAD ONLY
// =========================================================

async function loadNotifications() {

    console.log(
        "🔔 Loading UNREAD notifications..."
    );

    if (!notificationSupabase) {

        return;
    }

    if (!notificationsList) {

        return;
    }

    const user =
        await getNotificationUser();

    if (!user) {

        notificationsList.innerHTML = `
            <p class="no-notifications">
                Please log in to see notifications.
            </p>
        `;

        return;
    }


    // =====================================================
    // LOAD ONLY UNREAD NOTIFICATIONS
    // =====================================================

    const {
        data: notifications,
        error
    } =
        await notificationSupabase
            .from("notifications")
            .select(`
                id,
                receiver_id,
                sender_id,
                post_id,
                type,
                message,
                is_read,
                created_at,
                group_invitation_id
            `)
            .eq(
                "receiver_id",
                user.id
            )
            .eq(
                "is_read",
                false
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "❌ Load notifications error:",
            error
        );

        notificationsList.innerHTML = `
            <p class="no-notifications">
                Unable to load notifications.
            </p>
        `;

        return;
    }


    console.log(
        "✅ Total UNREAD notifications:",
        notifications?.length || 0
    );


    // =====================================================
    // EMPTY
    // =====================================================

    if (
        !notifications ||
        notifications.length === 0
    ) {

        notificationsList.innerHTML = `
            <p class="no-notifications">
                No notifications yet.
            </p>
        `;

        await updateNotificationBadge();

        return;
    }


    // =====================================================
    // SENDER IDS
    // =====================================================

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


    // =====================================================
    // GROUP INVITATION IDS
    // =====================================================

    const invitationIds = [
        ...new Set(
            notifications
                .filter(
                    notification =>
                        notification.type ===
                        "group_invite"
                )
                .map(
                    notification =>
                        notification.group_invitation_id
                )
                .filter(Boolean)
        )
    ];


    // =====================================================
    // LOAD SENDER PROFILES
    // =====================================================

    let senderProfiles =
        [];

    if (
        senderIds.length > 0
    ) {

        const {
            data,
            error: profilesError
        } =
            await notificationSupabase
                .from("profiles")
                .select(`
                    id,
                    username,
                    full_name,
                    avatar_url
                `)
                .in(
                    "id",
                    senderIds
                );

        if (profilesError) {

            console.error(
                "❌ Sender profiles error:",
                profilesError
            );

        } else {

            senderProfiles =
                data || [];
        }
    }


    // =====================================================
    // LOAD GROUP INVITATIONS
    // =====================================================

    let groupInvitations =
        [];

    if (
        invitationIds.length > 0
    ) {

        const {
            data,
            error: invitationsError
        } =
            await notificationSupabase
                .from("group_invitations")
                .select(`
                    id,
                    group_id,
                    inviter_id,
                    invited_user_id,
                    status
                `)
                .in(
                    "id",
                    invitationIds
                );

        if (invitationsError) {

            console.error(
                "❌ Group invitations error:",
                invitationsError
            );

        } else {

            groupInvitations =
                data || [];
        }
    }


    // =====================================================
    // GROUP IDS
    // =====================================================

    const groupIds = [
        ...new Set(
            groupInvitations
                .map(
                    invitation =>
                        invitation.group_id
                )
                .filter(Boolean)
        )
    ];


    // =====================================================
    // LOAD GROUPS
    // =====================================================

    let groups =
        [];

    if (
        groupIds.length > 0
    ) {

        const {
            data,
            error: groupsError
        } =
            await notificationSupabase
                .from("groups")
                .select(`
                    id,
                    name,
                    description,
                    avatar_url,
                    cover_url
                `)
                .in(
                    "id",
                    groupIds
                );

        if (groupsError) {

            console.error(
                "❌ Group data error:",
                groupsError
            );

        } else {

            groups =
                data || [];
        }
    }


    // =====================================================
    // CLEAR LIST
    // =====================================================

    notificationsList.innerHTML =
        "";


    // =====================================================
    // DISPLAY UNREAD ONLY
    // =====================================================

    for (
        const notification of notifications
    ) {

        const sender =
            senderProfiles.find(
                profile =>
                    profile.id ===
                    notification.sender_id
            );


        const invitation =
            groupInvitations.find(
                item =>
                    item.id ===
                    notification.group_invitation_id
            );


        const group =
            invitation
                ? groups.find(
                    item =>
                        item.id ===
                        invitation.group_id
                )
                : null;


        console.log(
            "🔔 UNREAD NOTIFICATION:",
            {
                id:
                    notification.id,

                type:
                    notification.type,

                sender_username:
                    sender?.username ||
                    "UNKNOWN",

                sender_name:
                    sender?.full_name ||
                    "UNKNOWN",

                is_read:
                    notification.is_read,

                post_id:
                    notification.post_id,

                created_at:
                    notification.created_at
            }
        );


        // =================================================
        // SKIP PROCESSED GROUP INVITATIONS
        // =================================================

        if (
            notification.type ===
                "group_invite" &&
            invitation &&
            invitation.status !==
                "pending"
        ) {

            console.log(
                "ℹ️ Group invitation already processed:",
                invitation.status
            );

            if (
                notification.is_read === false
            ) {

                await markNotificationAsRead(
                    notification.id
                );
            }

            continue;
        }


        // =================================================
        // SAFETY:
        // ONLY DISPLAY UNREAD
        // =================================================

        if (
            notification.is_read !== false
        ) {

            continue;
        }


        const item =
            displayNotification(
                notification,
                sender,
                group
            );

        notificationsList.appendChild(
            item
        );
    }


    // =====================================================
    // IF EVERYTHING WAS FILTERED
    // =====================================================

    if (
        notificationsList.querySelectorAll(
            ".notification-item"
        ).length === 0
    ) {

        notificationsList.innerHTML = `
            <p class="no-notifications">
                No notifications yet.
            </p>
        `;
    }


    // =====================================================
    // UPDATE BADGE
    // =====================================================

    await updateNotificationBadge();
}


// =========================================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================================

async function markAllNotificationsAsRead() {

    console.log(
        "📖 Marking ALL notifications as read..."
    );

    if (!notificationSupabase) {

        return;
    }

    const user =
        await getNotificationUser();

    if (!user) {

        return;
    }

    const {
        error
    } =
        await notificationSupabase
            .from("notifications")
            .update({
                is_read: true
            })
            .eq(
                "receiver_id",
                user.id
            )
            .eq(
                "is_read",
                false
            );

    if (error) {

        console.error(
            "❌ Mark all notifications error:",
            error
        );

        return;
    }

    console.log(
        "✅ ALL notifications marked as read"
    );


    // =====================================================
    // REMOVE ALL NOTIFICATION ITEMS FROM UI
    // =====================================================

    if (notificationsList) {

        notificationsList.innerHTML = `
            <p class="no-notifications">
                No notifications yet.
            </p>
        `;
    }


    // =====================================================
    // UPDATE BADGE
    // =====================================================

    await updateNotificationBadge();


    if (notificationsPanel) {

        notificationsPanel.hidden =
            false;

        notificationsPanel.style.display =
            "block";
    }
}


// =========================================================
// OPEN / CLOSE NOTIFICATIONS PANEL
// =========================================================

if (
    notificationButton &&
    notificationsPanel
) {

    notificationButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();


            const isClosed =
                notificationsPanel.hidden ||
                notificationsPanel.style.display ===
                "none";


            if (isClosed) {

                notificationsPanel.hidden =
                    false;

                notificationsPanel.style.display =
                    "block";

                positionNotificationsPanel();


                console.log(
                    "📦 Notifications panel OPEN"
                );


                await loadNotifications();

                positionNotificationsPanel();

            } else {

                notificationsPanel.hidden =
                    true;

                notificationsPanel.style.display =
                    "none";


                console.log(
                    "📦 Notifications panel CLOSED"
                );
            }
        }
    );
}


// =========================================================
// MARK ALL BUTTON
// =========================================================

if (
    markNotificationsRead
) {

    markNotificationsRead.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            event.stopPropagation();

            markNotificationsRead.disabled =
                true;

            try {

                await markAllNotificationsAsRead();

            }

            catch (error) {

                console.error(
                    "❌ Mark all unexpected error:",
                    error
                );

            }

            finally {

                markNotificationsRead.disabled =
                    false;
            }


            if (notificationsPanel) {

                notificationsPanel.hidden =
                    false;

                notificationsPanel.style.display =
                    "block";
            }
        }
    );
}


// =========================================================
// KEEP PANEL OPEN WHEN CLICKING INSIDE
// =========================================================

if (
    notificationsPanel
) {

    notificationsPanel.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );
}


// =========================================================
// CLOSE WHEN CLICKING OUTSIDE
// =========================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !notificationsPanel ||
            !notificationButton
        ) {

            return;
        }

        const isClosed =
            notificationsPanel.hidden ||
            notificationsPanel.style.display ===
            "none";

        if (isClosed) {

            return;
        }

        if (
            notificationsPanel.contains(
                event.target
            )
        ) {

            return;
        }

        if (
            notificationButton.contains(
                event.target
            )
        ) {

            return;
        }

        notificationsPanel.hidden =
            true;

        notificationsPanel.style.display =
            "none";
    }
);


// =========================================================
// REALTIME NOTIFICATIONS
// =========================================================

async function startNotificationRealtime() {

    if (!notificationSupabase) {

        return;
    }


    if (
        notificationRealtimeChannel
    ) {

        try {

            await notificationSupabase
                .removeChannel(
                    notificationRealtimeChannel
                );

        }

        catch (error) {

            console.error(
                "❌ Error removing old notification channel:",
                error
            );
        }

        notificationRealtimeChannel =
            null;
    }


    const user =
        await getNotificationUser();

    if (!user) {

        return;
    }


    console.log(
        "📡 Starting notification realtime for:",
        user.id
    );


    notificationRealtimeChannel =
        notificationSupabase
            .channel(
                "socialwiki-notifications-" +
                user.id +
                "-" +
                Date.now()
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter:
                        "receiver_id=eq." +
                        user.id
                },
                async function (payload) {

                    console.log(
                        "🔔 REALTIME NEW NOTIFICATION:",
                        payload
                    );


                    const newNotification =
                        payload?.new;


                    if (!newNotification) {

                        return;
                    }


                    await updateNotificationBadge();


                    if (
                        newNotification.type ===
                        "friend_request"
                    ) {

                        await updateFriendRequestBadge();
                    }


                    if (
                        notificationsPanel &&
                        !notificationsPanel.hidden &&
                        notificationsPanel.style.display !==
                            "none"
                    ) {

                        await loadNotifications();
                    }
                }
            )
            .subscribe(
                function (status) {

                    console.log(
                        "📡 Notification realtime status:",
                        status
                    );


                    if (
                        status ===
                        "SUBSCRIBED"
                    ) {

                        console.log(
                            "✅ NOTIFICATION REALTIME SUBSCRIBED"
                        );
                    }


                    if (
                        status ===
                        "CHANNEL_ERROR"
                    ) {

                        console.error(
                            "❌ NOTIFICATION REALTIME CHANNEL ERROR"
                        );
                    }


                    if (
                        status ===
                        "TIMED_OUT"
                    ) {

                        console.error(
                            "❌ NOTIFICATION REALTIME TIMED OUT"
                        );
                    }
                }
            );
}


// =========================================================
// STOP NOTIFICATION REALTIME
// =========================================================

async function stopNotificationRealtime() {

    if (
        !notificationSupabase ||
        !notificationRealtimeChannel
    ) {

        return;
    }


    console.log(
        "🛑 Stopping notification realtime"
    );


    try {

        await notificationSupabase
            .removeChannel(
                notificationRealtimeChannel
            );

    }

    catch (error) {

        console.error(
            "❌ Error stopping notification realtime:",
            error
        );
    }


    notificationRealtimeChannel =
        null;
}


// =========================================================
// START POLLING BACKUP
// =========================================================

function startNotificationPolling() {

    if (
        notificationPollingTimer
    ) {

        clearInterval(
            notificationPollingTimer
        );
    }


    notificationPollingTimer =
        setInterval(
            async function () {

                const user =
                    await getNotificationUser();


                if (!user) {

                    return;
                }


                await updateNotificationBadge();

                await updateFriendRequestBadge();

            },
            10000
        );


    console.log(
        "⏱️ Notification polling started: every 10 seconds"
    );
}


// =========================================================
// STOP POLLING
// =========================================================

function stopNotificationPolling() {

    if (
        notificationPollingTimer
    ) {

        clearInterval(
            notificationPollingTimer
        );

        notificationPollingTimer =
            null;
    }
}


// =========================================================
// PAGE VISIBILITY
// =========================================================

document.addEventListener(
    "visibilitychange",
    async function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            await updateNotificationBadge();

            await updateFriendRequestBadge();


            const user =
                await getNotificationUser();


            if (
                user &&
                !notificationRealtimeChannel
            ) {

                await startNotificationRealtime();
            }
        }
    }
);


// =========================================================
// WINDOW FOCUS
// =========================================================

window.addEventListener(
    "focus",
    async function () {

        await updateNotificationBadge();

        await updateFriendRequestBadge();
    }
);


// =========================================================
// INITIALIZE NOTIFICATIONS
// =========================================================

async function initializeNotifications() {

    console.log(
        "🚀 Initializing notifications..."
    );


    await updateNotificationBadge();

    await updateFriendRequestBadge();

    await startNotificationRealtime();

    startNotificationPolling();


    console.log(
        "✅ Notifications + Friends badges initialized"
    );
}


// =========================================================
// AUTH STATE CHANGE
// =========================================================

if (
    notificationSupabase
) {

    notificationSupabase.auth.onAuthStateChange(
        function (event, session) {

            console.log(
                "🔐 Notification auth event:",
                event
            );


            if (
                event === "SIGNED_IN" ||
                event === "INITIAL_SESSION"
            ) {

                setTimeout(
                    async function () {

                        await updateNotificationBadge();

                        await updateFriendRequestBadge();

                        await startNotificationRealtime();

                    },
                    300
                );
            }


            if (
                event === "SIGNED_OUT"
            ) {

                console.log(
                    "🚪 User signed out"
                );


                stopNotificationPolling();

                stopNotificationRealtime();


                if (
                    notificationBadge
                ) {

                    notificationBadge.textContent =
                        "0";

                    notificationBadge.hidden =
                        true;

                    notificationBadge.style.display =
                        "none";
                }


                if (
                    friendsBadge
                ) {

                    friendsBadge.textContent =
                        "0";

                    friendsBadge.hidden =
                        true;

                    friendsBadge.style.display =
                        "none";
                }
            }
        }
    );
}


// =========================================================
// START
// =========================================================

initializeNotifications();


// =========================================================
// FINISHED
// =========================================================

console.log(
    "✅ NOTIFICATIONS + FRIENDS BADGES + GROUP INVITATIONS READY"
);


// =========================================================
// KEEP PANEL POSITIONED UNDER BELL
// =========================================================

window.addEventListener(
    "resize",
    function () {

        if (
            notificationsPanel &&
            !notificationsPanel.hidden &&
            notificationsPanel.style.display !==
                "none"
        ) {

            positionNotificationsPanel();
        }
    }
);


window.addEventListener(
    "scroll",
    function () {

        if (
            notificationsPanel &&
            !notificationsPanel.hidden &&
            notificationsPanel.style.display !==
                "none"
        ) {

            positionNotificationsPanel();
        }

    },
    true
);