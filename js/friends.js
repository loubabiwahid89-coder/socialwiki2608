```javascript
console.log("🔥 Friends system starting...");

document.addEventListener("DOMContentLoaded", async function () {

    console.log("👥 Friends page loaded");


    // =====================================================
    // SUPABASE
    // =====================================================

    const SUPABASE_URL =
        "https://hvslktufqrgdgrgxmvcm.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

    if (!window.supabase) {

        console.error("❌ Supabase library not found");

        return;
    }

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    console.log("✅ Friends Supabase client created");


    // =====================================================
    // ELEMENTS
    // =====================================================

    const searchInput =
        document.getElementById("friendSearchInput");

    const searchBtn =
        document.getElementById("friendSearchBtn");

    const searchResults =
        document.getElementById("friendSearchResults");

    const friendRequests =
        document.getElementById("friendRequests");

    const myFriends =
        document.getElementById("myFriends");


    console.log("🔎 Search input:", searchInput);
    console.log("🔎 Search button:", searchBtn);
    console.log("📋 Search results:", searchResults);
    console.log("📨 Friend requests:", friendRequests);
    console.log("👥 My friends:", myFriends);


    // =====================================================
    // CURRENT USER
    // =====================================================

    async function getCurrentUser() {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();

        if (error) {

            console.error(
                "❌ Auth error:",
                error
            );

            return null;
        }

        return data?.user || null;
    }


    // =====================================================
    // GET FRIEND STATUS
    // =====================================================

    async function getFriendStatus(
        currentUserId,
        otherUserId
    ) {

        // -------------------------------------------------
        // CHECK FRIENDSHIP
        // -------------------------------------------------

        const {
            data: friendship,
            error: friendshipError
        } =
            await supabaseClient
                .from("friends")
                .select("id")
                .eq("user_id", currentUserId)
                .eq("friend_id", otherUserId)
                .maybeSingle();

        if (friendshipError) {

            console.error(
                "❌ Friendship check error:",
                friendshipError
            );
        }

        if (friendship) {

            return "friends";
        }


        // -------------------------------------------------
        // CHECK SENT REQUEST
        // -------------------------------------------------

        const {
            data: sentRequest,
            error: sentError
        } =
            await supabaseClient
                .from("friend_requests")
                .select("id, status")
                .eq("sender_id", currentUserId)
                .eq("receiver_id", otherUserId)
                .eq("status", "pending")
                .maybeSingle();

        if (sentError) {

            console.error(
                "❌ Sent request check error:",
                sentError
            );
        }

        if (sentRequest) {

            return "sent";
        }


        // -------------------------------------------------
        // CHECK RECEIVED REQUEST
        // -------------------------------------------------

        const {
            data: receivedRequest,
            error: receivedError
        } =
            await supabaseClient
                .from("friend_requests")
                .select("id, status")
                .eq("sender_id", otherUserId)
                .eq("receiver_id", currentUserId)
                .eq("status", "pending")
                .maybeSingle();

        if (receivedError) {

            console.error(
                "❌ Received request check error:",
                receivedError
            );
        }

        if (receivedRequest) {

            return "received";
        }

        return "none";
    }


    // =====================================================
    // CREATE FRIEND BUTTON
    // =====================================================

    function createFriendButton(
        profile,
        currentUserId
    ) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "add-friend-btn";

        button.dataset.userId =
            profile.id;

        button.textContent =
            "Checking...";


        // -------------------------------------------------
        // LOAD STATUS
        // -------------------------------------------------

        getFriendStatus(
            currentUserId,
            profile.id
        )
        .then(function (status) {

            if (status === "friends") {

                button.textContent =
                    "Friends";

                button.disabled =
                    true;

                button.classList.add(
                    "friend-active"
                );

                return;
            }


            if (status === "sent") {

                button.textContent =
                    "Request Sent";

                button.disabled =
                    true;

                return;
            }


            if (status === "received") {

                button.textContent =
                    "Respond to Request";

                button.disabled =
                    false;

                button.classList.add(
                    "received-request"
                );

                return;
            }


            button.textContent =
                "Add Friend";

            button.disabled =
                false;

        })
        .catch(function (error) {

            console.error(
                "❌ Friend status error:",
                error
            );

            button.textContent =
                "Add Friend";

            button.disabled =
                false;
        });


        // -------------------------------------------------
        // CLICK
        // -------------------------------------------------

        button.addEventListener(
            "click",
            async function (event) {

                event.stopPropagation();

                await sendFriendRequest(
                    profile.id,
                    button
                );
            }
        );

        return button;
    }


    // =====================================================
    // SEARCH USERS
    // =====================================================

    async function searchUsers() {

        const search =
            searchInput?.value.trim();


        if (!search) {

            searchResults.innerHTML =
                "<p>Please enter a username or name.</p>";

            return;
        }


        const user =
            await getCurrentUser();


        if (!user) {

            searchResults.innerHTML =
                "<p>Please login first.</p>";

            return;
        }


        searchResults.innerHTML =
            "<p>Searching...</p>";


        console.log(
            "🔎 Searching for:",
            search
        );


        // -------------------------------------------------
        // SEARCH PROFILES
        // -------------------------------------------------

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, username, full_name, avatar_url, bio"
                )
                .or(
                    `username.ilike.%${search}%,full_name.ilike.%${search}%`
                )
                .neq(
                    "id",
                    user.id
                )
                .limit(20);


        if (error) {

            console.error(
                "❌ Search error:",
                error
            );

            searchResults.innerHTML =
                "<p>Could not search users.</p>";

            return;
        }


        console.log(
            "👥 Users found:",
            data
        );


        if (
            !data ||
            data.length === 0
        ) {

            searchResults.innerHTML =
                "<p>No users found.</p>";

            return;
        }


        searchResults.innerHTML =
            "";


        // -------------------------------------------------
        // DISPLAY USERS
        // -------------------------------------------------

        for (
            const profile of data
        ) {

            const card =
                document.createElement("div");

            card.className =
                "friend-user-card";


            // -------------------------------------------------
            // AVATAR
            // -------------------------------------------------

            const avatar =
                document.createElement("img");

            avatar.className =
                "friend-avatar";

            avatar.src =
                profile.avatar_url ||
                "images/iconprofile.png";

            avatar.alt =
                "Profile";

            avatar.onerror =
                function () {

                    this.src =
                        "images/iconprofile.png";
                };


            // -------------------------------------------------
            // INFO
            // -------------------------------------------------

            const info =
                document.createElement("div");

            info.className =
                "friend-user-info";


            const name =
                document.createElement("strong");

            name.textContent =
                profile.full_name ||
                profile.username ||
                "User";


            const username =
                document.createElement("span");

            username.textContent =
                "@" +
                (
                    profile.username ||
                    ""
                );


            info.appendChild(
                name
            );

            info.appendChild(
                username
            );


            // -------------------------------------------------
            // ADD FRIEND BUTTON
            // -------------------------------------------------

            const button =
                createFriendButton(
                    profile,
                    user.id
                );


            // -------------------------------------------------
            // BUILD CARD
            // -------------------------------------------------

            card.appendChild(
                avatar
            );

            card.appendChild(
                info
            );

            card.appendChild(
                button
            );


            searchResults.appendChild(
                card
            );
        }


        console.log(
            "✅ Search results displayed"
        );
    }


    // =====================================================
    // SEND FRIEND REQUEST
    // =====================================================

    async function sendFriendRequest(
        receiverId,
        button
    ) {

        const user =
            await getCurrentUser();


        if (!user) {

            alert(
                "Please login first."
            );

            return;
        }


        if (
            user.id === receiverId
        ) {

            return;
        }


        // -------------------------------------------------
        // CHECK EXISTING STATUS
        // -------------------------------------------------

        const status =
            await getFriendStatus(
                user.id,
                receiverId
            );


        if (status === "friends") {

            button.textContent =
                "Friends";

            button.disabled =
                true;

            return;
        }


        if (status === "sent") {

            button.textContent =
                "Request Sent";

            button.disabled =
                true;

            return;
        }


        if (status === "received") {

            alert(
                "This user already sent you a friend request."
            );

            return;
        }


        // -------------------------------------------------
        // DISABLE
        // -------------------------------------------------

        button.disabled =
            true;

        button.textContent =
            "Sending...";


        console.log(
            "📨 Sending friend request:",
            user.id,
            "→",
            receiverId
        );


        // -------------------------------------------------
        // INSERT REQUEST
        // -------------------------------------------------

        const {
            data,
            error
        } =
            await supabaseClient
                .from("friend_requests")
                .insert({

                    sender_id:
                        user.id,

                    receiver_id:
                        receiverId,

                    status:
                        "pending"

                })
                .select()
                .single();


        if (error) {

            console.error(
                "❌ Friend request error:",
                error
            );


            if (
                error.code === "23505"
            ) {

                button.textContent =
                    "Request Sent";

                button.disabled =
                    true;

            } else {

                button.textContent =
                    "Add Friend";

                button.disabled =
                    false;
            }

            return;
        }


        console.log(
            "✅ Friend request created:",
            data
        );


        // =====================================================
        // CREATE FRIEND REQUEST NOTIFICATION
        // =====================================================

        const {
            error: notificationError
        } =
            await supabaseClient
                .from("notifications")
                .insert({

                    receiver_id:
                        receiverId,

                    sender_id:
                        user.id,

                    type:
                        "friend_request",

                    message:
                        "You have a new friend request",

                    is_read:
                        false
                });


        if (notificationError) {

            console.error(
                "❌ Friend request notification error:",
                notificationError
            );

        } else {

            console.log(
                "🔔 Friend request notification created"
            );
        }


        // =====================================================
        // UPDATE BUTTON
        // =====================================================

        button.textContent =
            "Request Sent";

        button.disabled =
            true;

    }


    // =====================================================
    // LOAD FRIEND REQUESTS
    // =====================================================

    async function loadFriendRequests() {

        const user =
            await getCurrentUser();


        if (!user) {

            friendRequests.innerHTML =
                "<p>Please login first.</p>";

            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("friend_requests")
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    status,
                    created_at,
                    profiles:sender_id (
                        id,
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq(
                    "receiver_id",
                    user.id
                )
                .eq(
                    "status",
                    "pending"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "❌ Requests error:",
                error
            );

            friendRequests.innerHTML =
                "<p>Could not load requests.</p>";

            return;
        }


        console.log(
            "📨 Friend requests:",
            data
        );


        if (
            !data ||
            data.length === 0
        ) {

            friendRequests.innerHTML =
                "<p>No friend requests.</p>";

            return;
        }


        friendRequests.innerHTML =
            "";


        data.forEach(
            function (request) {

                const profile =
                    request.profiles;


                const name =
                    profile?.full_name ||
                    profile?.username ||
                    "User";


                const avatar =
                    profile?.avatar_url ||
                    "images/iconprofile.png";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "friend-request-card";


                card.innerHTML = `

                    <img
                        src="${avatar}"
                        alt="Profile"
                        class="friend-avatar"
                        onerror="this.src='images/iconprofile.png'"
                    >

                    <div class="friend-user-info">

                        <strong>
                            ${name}
                        </strong>

                        <span>
                            @${profile?.username || ""}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="accept-request-btn"
                        data-request-id="${request.id}"
                    >
                        Accept
                    </button>

                    <button
                        type="button"
                        class="reject-request-btn"
                        data-request-id="${request.id}"
                    >
                        Reject
                    </button>

                `;


                friendRequests.appendChild(
                    card
                );
            }
        );


        // -------------------------------------------------
        // ACCEPT
        // -------------------------------------------------

        friendRequests
            .querySelectorAll(
                ".accept-request-btn"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        async function () {

                            await respondToRequest(
                                this.dataset.requestId,
                                "accepted"
                            );
                        }
                    );
                }
            );


        // -------------------------------------------------
        // REJECT
        // -------------------------------------------------

        friendRequests
            .querySelectorAll(
                ".reject-request-btn"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        async function () {

                            await respondToRequest(
                                this.dataset.requestId,
                                "rejected"
                            );
                        }
                    );
                }
            );
    }


    // =====================================================
    // ACCEPT / REJECT REQUEST
    // =====================================================

    async function respondToRequest(
        requestId,
        status
    ) {

        const user =
            await getCurrentUser();


        if (!user) {

            return;
        }


        console.log(
            "📨 Responding to request:",
            requestId,
            status
        );


        // -------------------------------------------------
        // GET REQUEST
        // -------------------------------------------------

        const {
            data: request,
            error: requestError
        } =
            await supabaseClient
                .from("friend_requests")
                .select(
                    "id, sender_id, receiver_id, status"
                )
                .eq(
                    "id",
                    requestId
                )
                .eq(
                    "receiver_id",
                    user.id
                )
                .eq(
                    "status",
                    "pending"
                )
                .single();


        if (requestError) {

            console.error(
                "❌ Request lookup error:",
                requestError
            );

            return;
        }


        // =====================================================
        // REJECT
        // =====================================================

        if (
            status === "rejected"
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from("friend_requests")
                    .update({
                        status: "rejected"
                    })
                    .eq(
                        "id",
                        requestId
                    )
                    .eq(
                        "receiver_id",
                        user.id
                    );


            if (error) {

                console.error(
                    "❌ Reject error:",
                    error
                );

                return;
            }


            console.log(
                "❌ Friend request rejected"
            );


            // =====================================================
            // CREATE REJECTED FRIEND REQUEST NOTIFICATION
            // =====================================================

            const {
                error: rejectedNotificationError
            } =
                await supabaseClient
                    .from("notifications")
                    .insert({

                        receiver_id:
                            request.sender_id,

                        sender_id:
                            user.id,

                        type:
                            "friend_rejected",

                        message:
                            "Your friend request was declined",

                        is_read:
                            false

                    });


            if (rejectedNotificationError) {

                console.error(
                    "❌ Rejected friend notification error:",
                    rejectedNotificationError
                );

            } else {

                console.log(
                    "🔔 Friend request rejected notification created"
                );
            }


            await loadFriendRequests();

            return;
        }


        // =====================================================
        // ACCEPT
        // =====================================================

        const {
            error: updateError
        } =
            await supabaseClient
                .from("friend_requests")
                .update({
                    status: "accepted"
                })
                .eq(
                    "id",
                    requestId
                )
                .eq(
                    "receiver_id",
                    user.id
                );


        if (updateError) {

            console.error(
                "❌ Accept update error:",
                updateError
            );

            return;
        }


        console.log(
            "✅ Request accepted"
        );


        // -------------------------------------------------
        // CREATE FRIENDSHIP - CURRENT USER
        // -------------------------------------------------

        const {
            error: friendError1
        } =
            await supabaseClient
                .from("friends")
                .insert({

                    user_id:
                        user.id,

                    friend_id:
                        request.sender_id

                });


        if (
            friendError1 &&
            friendError1.code !== "23505"
        ) {

            console.error(
                "❌ Friendship 1 error:",
                friendError1
            );

            return;
        }


        // -------------------------------------------------
        // CREATE FRIENDSHIP - SENDER
        // -------------------------------------------------

        const {
            error: friendError2
        } =
            await supabaseClient
                .from("friends")
                .insert({

                    user_id:
                        request.sender_id,

                    friend_id:
                        user.id

                });


        if (
            friendError2 &&
            friendError2.code !== "23505"
        ) {

            console.error(
                "❌ Friendship 2 error:",
                friendError2
            );

            return;
        }


        console.log(
            "🎉 Friendship created for both users"
        );


        // =====================================================
        // CREATE ACCEPTED FRIEND REQUEST NOTIFICATION
        // =====================================================

        const {
            error: acceptedNotificationError
        } =
            await supabaseClient
                .from("notifications")
                .insert({

                    receiver_id:
                        request.sender_id,

                    sender_id:
                        user.id,

                    type:
                        "friend_accepted",

                    message:
                        "Your friend request was accepted",

                    is_read:
                        false

                });


        if (acceptedNotificationError) {

            console.error(
                "❌ Accepted friend notification error:",
                acceptedNotificationError
            );

        } else {

            console.log(
                "🔔 Friend request accepted notification created"
            );
        }


        // -------------------------------------------------
        // REFRESH
        // -------------------------------------------------

        await loadFriendRequests();

        await loadFriends();

    }


    // =====================================================
    // LOAD MY FRIENDS
    // =====================================================

    async function loadFriends() {

        const user =
            await getCurrentUser();


        if (!user) {

            myFriends.innerHTML =
                "<p>Please login first.</p>";

            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("friends")
                .select(`
                    id,
                    friend_id,
                    created_at,
                    profiles:friend_id (
                        id,
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "❌ Friends error:",
                error
            );

            myFriends.innerHTML =
                "<p>Could not load friends.</p>";

            return;
        }


        console.log(
            "👥 My friends:",
            data
        );


        if (
            !data ||
            data.length === 0
        ) {

            myFriends.innerHTML =
                "<p>No friends yet.</p>";

            return;
        }


        myFriends.innerHTML =
            "";


        data.forEach(
            function (item) {

                const profile =
                    item.profiles;


                const name =
                    profile?.full_name ||
                    profile?.username ||
                    "User";


                const avatar =
                    profile?.avatar_url ||
                    "images/iconprofile.png";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "friend-card";


                card.dataset.userId =
                    profile?.id || "";


                card.innerHTML = `

                    <img
                        src="${avatar}"
                        alt="Profile"
                        class="friend-avatar"
                        onerror="this.src='images/iconprofile.png'"
                    >

                    <div class="friend-user-info">

                        <strong>
                            ${name}
                        </strong>

                        <span>
                            @${profile?.username || ""}
                        </span>

                    </div>

                `;


                // =====================================================
                // OPEN FRIEND PROFILE
                // =====================================================

                card.style.cursor =
                    "pointer";


                card.addEventListener(
                    "click",
                    function () {

                        if (!profile?.id) {

                            console.error(
                                "❌ Friend profile ID missing"
                            );

                            return;
                        }


                        console.log(
                            "👤 Opening friend profile:",
                            profile.id
                        );


                        window.location.href =
                            "profile.html?id=" +
                            encodeURIComponent(
                                profile.id
                            );
                    }
                );


                myFriends.appendChild(
                    card
                );

            }
        );
    }


    // =====================================================
    // SEARCH BUTTON
    // =====================================================

    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            searchUsers
        );
    }


    // =====================================================
    // ENTER SEARCH
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    searchUsers();
                }
            }
        );
    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    await loadFriendRequests();

    await loadFriends();


    console.log(
        "✅ Friends system ready."
    );

});

