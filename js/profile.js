console.log("🚀 profile.js is working");
console.log("🔥 PROFILE VERSION: POSTS-MEDIA-20260906");


// =========================================================
// SUPABASE
// =========================================================

const supabaseUrl =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const supabaseKey =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

const supabaseClient =
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );

console.log("✅ Supabase client created");


// =========================================================
// HTML ELEMENTS
// =========================================================

const avatar =
    document.getElementById("avatar");

const avatarWrapper =
    document.getElementById("avatarWrapper");

const avatarFileInput =
    document.getElementById("avatarFileInput");

const username =
    document.getElementById("username");

const email =
    document.getElementById("email");

const bio =
    document.getElementById("bio");

const roleBadge =
    document.getElementById("roleBadge");

const editSection =
    document.getElementById("editSection");

const usernameInput =
    document.getElementById("usernameInput");

const fullNameInput =
    document.getElementById("fullNameInput");

const bioInput =
    document.getElementById("bioInput");

const saveProfileButton =
    document.getElementById("saveProfileButton");

const logoutButton =
    document.getElementById("logoutButton");

const profileMessage =
    document.getElementById("profileMessage");

console.log("✅ Profile HTML loaded");


// =========================================================
// HELPER - MESSAGE
// =========================================================

function showMessage(message) {

    if (profileMessage) {

        profileMessage.textContent =
            message;

    }

}


// =========================================================
// CREATE POSTS SECTION
// =========================================================

function createPostsSection() {

    let existing =
        document.getElementById(
            "profilePostsSection"
        );

    if (existing) {

        return existing;

    }


    const section =
        document.createElement("div");

    section.id =
        "profilePostsSection";


    section.innerHTML = `

        <div class="profile-posts-title">
            <h2>Posts</h2>
        </div>

        <div
            id="profilePostsFeed"
            class="profile-posts-feed"
        >
            <div class="profile-post-loading">
                Loading posts...
            </div>
        </div>

    `;


    const container =
        document.querySelector(
            ".profile-container"
        );


    if (container) {

        container.appendChild(section);

    }


    addPostsStyles();


    return section;

}


// =========================================================
// POSTS CSS
// =========================================================

function addPostsStyles() {

    if (
        document.getElementById(
            "profilePostsStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");

    style.id =
        "profilePostsStyles";


    style.textContent = `

        #profilePostsSection {
            margin-top: 30px;
        }

        .profile-posts-title {
            border-top: 1px solid #ddd;
            padding-top: 20px;
            margin-bottom: 15px;
        }

        .profile-posts-title h2 {
            margin: 0;
            font-size: 21px;
        }

        .profile-posts-feed {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }

        .profile-post {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 14px;
            padding: 16px;
            box-sizing: border-box;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .profile-post-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
        }

        .profile-post-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            object-fit: cover;
            background: #eee;
        }

        .profile-post-user {
            font-weight: bold;
            font-size: 15px;
        }

        .profile-post-date {
            font-size: 12px;
            color: #777;
            margin-top: 3px;
        }

        .profile-post-text {
            font-size: 15px;
            line-height: 1.5;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            margin-bottom: 12px;
        }

        .profile-post-media {
            width: 100%;
            max-height: 600px;
            object-fit: contain;
            display: block;
            border-radius: 12px;
            background: #f1f1f1;
            margin-top: 10px;
        }

        .profile-post-video {
            width: 100%;
            max-height: 600px;
            display: block;
            border-radius: 12px;
            background: #000;
            margin-top: 10px;
        }

        .profile-post-empty {
            text-align: center;
            padding: 25px;
            color: #777;
            background: #f5f6f7;
            border-radius: 12px;
        }

        .profile-post-loading {
            text-align: center;
            padding: 25px;
            color: #777;
        }

        .profile-post-error {
            text-align: center;
            padding: 20px;
            color: #c00;
            background: #fff0f0;
            border-radius: 10px;
        }

        .profile-post-actions {
            display: flex;
            gap: 8px;
            margin-top: 14px;
            border-top: 1px solid #eee;
            padding-top: 12px;
        }

        .profile-post-actions button {
            flex: 1;
            width: auto;
            margin: 0;
            padding: 8px;
            background: #f0f2f5;
            color: #333;
            font-size: 14px;
        }

        .profile-post-actions button:hover {
            background: #e4e6e9;
            opacity: 1;
        }

    `;


    document.head.appendChild(style);

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatPostDate(dateValue) {

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


    return date.toLocaleString();

}


// =========================================================
// LOAD PROFILE POSTS
// =========================================================

async function loadProfilePosts(profileUserId) {

    console.log(
        "📥 Loading posts for profile:",
        profileUserId
    );


    createPostsSection();


    const feed =
        document.getElementById(
            "profilePostsFeed"
        );


    if (!feed) {

        console.error(
            "❌ profilePostsFeed not found"
        );

        return;

    }


    feed.innerHTML = `
        <div class="profile-post-loading">
            Loading posts...
        </div>
    `;


    // =====================================================
    // GET POSTS
    // =====================================================

    const {
        data: posts,
        error
    } =
        await supabaseClient
            .from("posts")
            .select(`
                id,
                username,
                created_at,
                content,
                user_id,
                media_url,
                media_type
            `)
            .eq(
                "user_id",
                profileUserId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "❌ Profile posts error:",
            error
        );


        feed.innerHTML = `
            <div class="profile-post-error">
                Unable to load posts.
            </div>
        `;


        return;

    }


    console.log(
        "✅ Profile posts loaded:",
        posts
    );


    if (
        !posts ||
        posts.length === 0
    ) {

        feed.innerHTML = `
            <div class="profile-post-empty">
                No posts yet.
            </div>
        `;

        return;

    }


    feed.innerHTML = "";


    // =====================================================
    // DISPLAY POSTS
    // =====================================================

    posts.forEach(
        function (post) {

            const element =
                createProfilePostElement(
                    post
                );

            feed.appendChild(
                element
            );

        }
    );

}


// =========================================================
// CREATE PROFILE POST ELEMENT
// =========================================================

function createProfilePostElement(post) {

    const article =
        document.createElement("article");


    article.className =
        "profile-post";


    // =====================================================
    // TEXT
    // =====================================================

    let textHTML = "";


    if (
        post.content &&
        post.content.trim()
    ) {

        textHTML = `
            <div class="profile-post-text">
                ${escapeProfileHTML(
                    post.content
                )}
            </div>
        `;

    }


    // =====================================================
    // MEDIA
    // =====================================================

    let mediaHTML = "";


    if (
        post.media_url &&
        post.media_type === "image"
    ) {

        mediaHTML = `

            <img
                class="profile-post-media"
                src="${escapeProfileAttribute(
                    post.media_url
                )}"
                alt="Post image"
                loading="lazy"
                onerror="this.style.display='none';"
            >

        `;

    }


    else if (
        post.media_url &&
        post.media_type === "video"
    ) {

        mediaHTML = `

            <video
                class="profile-post-video"
                src="${escapeProfileAttribute(
                    post.media_url
                )}"
                controls
                preload="metadata"
            ></video>

        `;

    }


    // =====================================================
    // POST HTML
    // =====================================================

    article.innerHTML = `

        <div class="profile-post-header">

            <img
                class="profile-post-avatar"
                src="images/iconprofile.png"
                alt="Profile"
            >

            <div>

                <div class="profile-post-user">
                    ${escapeProfileHTML(
                        post.username ||
                        "User"
                    )}
                </div>

                <div class="profile-post-date">
                    ${formatPostDate(
                        post.created_at
                    )}
                </div>

            </div>

        </div>

        ${textHTML}

        ${mediaHTML}

        <div class="profile-post-actions">

            <button
                type="button"
                class="profile-like-button"
            >
                👍 Like
            </button>

            <button
                type="button"
                class="profile-comment-button"
            >
                💬 Comment
            </button>

            <button
                type="button"
                class="profile-share-button"
            >
                ↗️ Share
            </button>

        </div>

    `;


    // =====================================================
    // LIKE
    // =====================================================

    const likeButton =
        article.querySelector(
            ".profile-like-button"
        );


    if (likeButton) {

        likeButton.addEventListener(
            "click",
            function () {

                console.log(
                    "👍 Profile post like:",
                    post.id
                );

                if (
                    typeof window.handleLike ===
                    "function"
                ) {

                    window.handleLike(
                        post.id,
                        article
                    );

                } else {

                    alert(
                        "Like system is available on Home."
                    );

                }

            }
        );

    }


    // =====================================================
    // COMMENT
    // =====================================================

    const commentButton =
        article.querySelector(
            ".profile-comment-button"
        );


    if (commentButton) {

        commentButton.addEventListener(
            "click",
            function () {

                console.log(
                    "💬 Profile post comment:",
                    post.id
                );


                if (
                    typeof window.handleComment ===
                    "function"
                ) {

                    window.handleComment(
                        post.id,
                        article
                    );

                } else {

                    alert(
                        "Comment system is available on Home."
                    );

                }

            }
        );

    }


    // =====================================================
    // SHARE
    // =====================================================

    const shareButton =
        article.querySelector(
            ".profile-share-button"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            function () {

                console.log(
                    "↗️ Profile post share:",
                    post.id
                );


                if (
                    typeof window.handleShare ===
                    "function"
                ) {

                    window.handleShare(
                        post.id,
                        article
                    );

                } else {

                    sharePostFromProfile(
                        post
                    );

                }

            }
        );

    }


    return article;

}


// =========================================================
// SIMPLE SHARE FALLBACK
// =========================================================

async function sharePostFromProfile(post) {

    const shareText =
        post.content ||
        "Check out this post on SocialWiki!";


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "SocialWiki",

                text:
                    shareText,

                url:
                    window.location.href

            });

            return;

        } catch (error) {

            console.log(
                "Share cancelled"
            );

        }

    }


    try {

        await navigator.clipboard.writeText(
            window.location.href
        );


        alert(
            "Post link copied!"
        );

    } catch (error) {

        alert(
            "Unable to share this post."
        );

    }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeProfileHTML(value) {

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
// ESCAPE ATTRIBUTE
// =========================================================

function escapeProfileAttribute(value) {

    return escapeProfileHTML(
        value
    );

}


// =========================================================
// LOAD PROFILE
// =========================================================

async function loadProfile() {

    console.log(
        "📥 Loading profile..."
    );


    // =====================================================
    // SESSION
    // =====================================================

    const {
        data: sessionData,
        error: sessionError
    } =
        await supabaseClient.auth.getSession();


    if (sessionError) {

        console.error(
            "❌ Session error:",
            sessionError
        );

        showMessage(
            sessionError.message
        );

        return;
    }


    if (!sessionData.session) {

        console.log(
            "❌ No logged in user"
        );

        showMessage(
            "Please login first."
        );

        return;
    }


    const currentUser =
        sessionData.session.user;


    console.log(
        "👤 Current user:",
        currentUser.email
    );


    // =====================================================
    // CHECK SELECTED PROFILE
    // =====================================================

    const selectedUserId =
        sessionStorage.getItem(
            "viewProfileUserId"
        );


    let profileUserId =
        currentUser.id;


    let isOwnProfile =
        true;


    if (
        selectedUserId &&
        selectedUserId !== currentUser.id
    ) {

        profileUserId =
            selectedUserId;

        isOwnProfile =
            false;


        console.log(
            "👁️ Viewing another profile:",
            profileUserId
        );

    } else {

        console.log(
            "✏️ Viewing own profile"
        );

    }


    // =====================================================
    // GET PROFILE
    // =====================================================

    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                profileUserId
            )
            .maybeSingle();


    if (error) {

        console.error(
            "❌ Profile error:",
            error
        );

        showMessage(
            error.message
        );

        return;
    }


    if (!profile) {

        username.textContent =
            "User";

        email.textContent =
            "";

        bio.textContent =
            "No bio yet.";

        roleBadge.textContent =
            "";


        if (!isOwnProfile) {

            editSection.style.display =
                "none";

        }


        // Still try to load posts

        await loadProfilePosts(
            profileUserId
        );


        return;

    }


    // =====================================================
    // DISPLAY USERNAME
    // =====================================================

    username.textContent =
        profile.username ||
        profile.full_name ||
        "No username";


    // =====================================================
    // EMAIL
    // =====================================================

    if (isOwnProfile) {

        email.textContent =
            currentUser.email || "";

    } else {

        email.textContent =
            "";

    }


    // =====================================================
    // BIO
    // =====================================================

    bio.textContent =
        profile.bio ||
        "No bio yet";


    // =====================================================
    // AVATAR
    // =====================================================

    if (profile.avatar_url) {

        avatar.src =
            profile.avatar_url;

    } else {

        avatar.src =
            "images/iconprofile.png";

    }


    avatar.onerror =
        function () {

            this.src =
                "images/iconprofile.png";

        };


    // =====================================================
    // ROLE
    // =====================================================

    if (
        profile.role ===
        "manager"
    ) {

        roleBadge.textContent =
            "🟣 WIKI MANAGER";

        roleBadge.style.display =
            "inline-block";

        roleBadge.style.marginTop =
            "8px";

        roleBadge.style.padding =
            "6px 12px";

        roleBadge.style.borderRadius =
            "20px";

        roleBadge.style.fontWeight =
            "bold";

        roleBadge.style.background =
            "#eee5ff";

        roleBadge.style.color =
            "#6f2dbd";

    } else {

        roleBadge.textContent =
            "";

        roleBadge.style.display =
            "none";

    }


    // =====================================================
    // OWN PROFILE
    // =====================================================

    if (isOwnProfile) {

        console.log(
            "✏️ EDIT MODE"
        );


        editSection.style.display =
            "block";


        avatarWrapper.classList.add(
            "editable"
        );


        avatar.classList.add(
            "editable"
        );


        usernameInput.value =
            profile.username || "";


        fullNameInput.value =
            profile.full_name || "";


        bioInput.value =
            profile.bio || "";


        // IMPORTANT:
        // Remove old selected profile ID.

        sessionStorage.removeItem(
            "viewProfileUserId"
        );


    } else {

        console.log(
            "👁️ VIEW ONLY MODE"
        );


        editSection.style.display =
            "none";


        avatarWrapper.classList.remove(
            "editable"
        );


        avatar.classList.remove(
            "editable"
        );

    }


    // =====================================================
    // LOAD POSTS
    // =====================================================

    await loadProfilePosts(
        profileUserId
    );

}


// =========================================================
// CLICK AVATAR
// =========================================================

if (avatar) {

    avatar.addEventListener(
        "click",
        async function () {

            console.log(
                "🖼️ Avatar clicked"
            );


            const {
                data,
                error
            } =
                await supabaseClient.auth.getSession();


            if (error) {

                console.error(
                    "Session error:",
                    error
                );

                return;

            }


            if (!data.session) {

                showMessage(
                    "Please login first."
                );

                return;

            }


            const currentUserId =
                data.session.user.id;


            const selectedUserId =
                sessionStorage.getItem(
                    "viewProfileUserId"
                );


            // SECURITY

            if (
                selectedUserId &&
                selectedUserId !==
                    currentUserId
            ) {

                console.warn(
                    "❌ Cannot change another user's avatar"
                );

                return;

            }


            console.log(
                "📂 Opening file selector..."
            );


            if (avatarFileInput) {

                avatarFileInput.click();

            }

        }
    );

}


// =========================================================
// FILE SELECTED
// =========================================================

if (avatarFileInput) {

    avatarFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files?.[0];


            if (!file) {

                return;

            }


            console.log(
                "🖼️ Selected:",
                file.name
            );


            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showMessage(
                    "Please select JPG, PNG, WEBP or GIF."
                );

                this.value = "";

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                showMessage(
                    "Image must be smaller than 5 MB."
                );

                this.value = "";

                return;

            }


            await uploadAvatar(
                file
            );


            this.value = "";

        }
    );

}


// =========================================================
// UPLOAD AVATAR
// =========================================================

async function uploadAvatar(file) {

    console.log(
        "⬆️ Uploading avatar..."
    );


    const {
        data: sessionData,
        error: sessionError
    } =
        await supabaseClient.auth.getSession();


    if (sessionError) {

        console.error(
            "Session error:",
            sessionError
        );

        return;

    }


    if (!sessionData.session) {

        showMessage(
            "You must login first."
        );

        return;

    }


    const user =
        sessionData.session.user;


    // =====================================================
    // SECURITY CHECK
    // =====================================================

    const selectedUserId =
        sessionStorage.getItem(
            "viewProfileUserId"
        );


    if (
        selectedUserId &&
        selectedUserId !==
            user.id
    ) {

        console.error(
            "❌ SECURITY: Cannot upload for another user"
        );

        showMessage(
            "You cannot change this profile."
        );

        return;

    }


    // =====================================================
    // FILE EXTENSION
    // =====================================================

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const allowedExtensions = [

        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif"

    ];


    if (
        !allowedExtensions.includes(
            extension
        )
    ) {

        showMessage(
            "Invalid image format."
        );

        return;

    }


    // =====================================================
    // SAFE USER PATH
    // =====================================================

    const filePath =
        user.id +
        "/avatar." +
        extension;


    console.log(
        "📁 Avatar path:",
        filePath
    );


    showMessage(
        "Uploading image..."
    );


    // =====================================================
    // UPLOAD
    // =====================================================

    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from("avatars")
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        "3600",
                    upsert:
                        true,
                    contentType:
                        file.type
                }
            );


    if (uploadError) {

        console.error(
            "❌ Upload error:",
            uploadError
        );

        showMessage(
            uploadError.message
        );

        return;

    }


    console.log(
        "✅ Avatar uploaded"
    );


    // =====================================================
    // PUBLIC URL
    // =====================================================

    const {
        data: publicData
    } =
        supabaseClient
            .storage
            .from("avatars")
            .getPublicUrl(
                filePath
            );


    const avatarUrl =
        publicData.publicUrl;


    console.log(
        "🌐 Avatar URL:",
        avatarUrl
    );


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const {
        error: updateError
    } =
        await supabaseClient
            .from("profiles")
            .update({
                avatar_url:
                    avatarUrl
            })
            .eq(
                "id",
                user.id
            );


    if (updateError) {

        console.error(
            "❌ Profile update error:",
            updateError
        );

        showMessage(
            updateError.message
        );

        return;

    }


    // =====================================================
    // DISPLAY NEW IMAGE
    // =====================================================

    avatar.src =
        avatarUrl +
        "?t=" +
        Date.now();


    showMessage(
        "✅ Profile picture updated!"
    );


    console.log(
        "🎉 Avatar update complete"
    );

}


// =========================================================
// SAVE PROFILE
// =========================================================

if (saveProfileButton) {

    saveProfileButton.addEventListener(
        "click",
        async function () {

            console.log(
                "💾 SAVE PROFILE"
            );


            const {
                data: sessionData,
                error: sessionError
            } =
                await supabaseClient.auth.getSession();


            if (sessionError) {

                console.error(
                    sessionError
                );

                return;

            }


            if (!sessionData.session) {

                showMessage(
                    "You must login first."
                );

                return;

            }


            const user =
                sessionData.session.user;


            // SECURITY

            const selectedUserId =
                sessionStorage.getItem(
                    "viewProfileUserId"
                );


            if (
                selectedUserId &&
                selectedUserId !==
                    user.id
            ) {

                console.error(
                    "❌ SECURITY: Cannot edit another user"
                );

                showMessage(
                    "You cannot edit this profile."
                );

                return;

            }


            const newUsername =
                usernameInput.value.trim();


            const newFullName =
                fullNameInput.value.trim();


            const newBio =
                bioInput.value.trim();


            // =================================================
            // UPDATE ONLY USER'S OWN ROW
            // =================================================

            const {
                error
            } =
                await supabaseClient
                    .from("profiles")
                    .upsert({

                        id:
                            user.id,

                        username:
                            newUsername,

                        full_name:
                            newFullName,

                        bio:
                            newBio

                    })
                    .select();


            if (error) {

                console.error(
                    "❌ Save error:",
                    error
                );

                showMessage(
                    error.message
                );

                return;

            }


            username.textContent =
                newUsername ||
                newFullName ||
                "No username";


            bio.textContent =
                newBio ||
                "No bio yet";


            showMessage(
                "✅ Profile saved successfully!"
            );

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            console.log(
                "🚪 LOGOUT"
            );


            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                showMessage(
                    error.message
                );

                return;

            }


            sessionStorage.removeItem(
                "viewProfileUserId"
            );


            console.log(
                "✅ Logout successful"
            );


            window.location.href =
                "auth.html";

        }
    );

}


// =========================================================
// START
// =========================================================

loadProfile();