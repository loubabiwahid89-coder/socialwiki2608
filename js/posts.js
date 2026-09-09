
// =========================================================
// POSTS.JS
// SOCIALWIKI POSTS SYSTEM
// FULL VERSION 20260908
// =========================================================

console.log("🔥 POSTS.JS VERSION 20260908");
console.log("📝 SocialWiki Posts System loaded");


// =========================================================
// SUPABASE
// =========================================================

const POSTS_SUPABASE_URL =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const POSTS_SUPABASE_KEY =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

let postsSupabase =
    window.supabaseClient || null;

if (!postsSupabase) {

    postsSupabase =
        window.supabase.createClient(
            POSTS_SUPABASE_URL,
            POSTS_SUPABASE_KEY
        );

}

console.log("✅ Posts Supabase ready");


// =========================================================
// GLOBALS
// =========================================================

let postsProfiles = [];

let selectedPostMediaFile = null;

let selectedPostMediaPreviewUrl = null;

let selectedPostFeeling = null;

let createPostModal = null;


// =========================================================
// FEELINGS
// =========================================================

const SOCIALWIKI_FEELINGS = [

    {
        emoji: "😊",
        name: "Happy"
    },

    {
        emoji: "😍",
        name: "Loved"
    },

    {
        emoji: "🥰",
        name: "Lovely"
    },

    {
        emoji: "😎",
        name: "Cool"
    },

    {
        emoji: "🤩",
        name: "Excited"
    },

    {
        emoji: "😂",
        name: "Funny"
    },

    {
        emoji: "🥳",
        name: "Celebrating"
    },

    {
        emoji: "😢",
        name: "Sad"
    },

    {
        emoji: "😡",
        name: "Angry"
    },

    {
        emoji: "😴",
        name: "Tired"
    },

    {
        emoji: "🙏",
        name: "Grateful"
    },

    {
        emoji: "🤔",
        name: "Thoughtful"
    }

];


// =========================================================
// UUID
// =========================================================

function isValidUUID(value) {

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        .test(value || "");

}


// =========================================================
// POST OWNER
// =========================================================

function getPostOwnerId(post) {

    if (!post) {
        return null;
    }

    const possibleIds = [

        post.user_id,

        post.author_id,

        post.owner_id,

        post.profile_id,

        post.userId,

        post.authorId,

        post.ownerId

    ];

    for (const id of possibleIds) {

        if (
            id &&
            isValidUUID(id)
        ) {

            return id;

        }

    }

    return null;
}


// =========================================================
// CURRENT USER
// =========================================================

async function getCurrentPostsUser() {

    try {

        const {
            data,
            error
        } =
            await postsSupabase.auth.getUser();

        if (error) {

            console.error(
                "❌ getCurrentPostsUser:",
                error
            );

            return null;
        }

        return data?.user || null;

    } catch (error) {

        console.error(
            "❌ getCurrentPostsUser exception:",
            error
        );

        return null;
    }
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

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
// NOTIFICATIONS
// =========================================================

async function createNotification({

    receiverId,

    senderId,

    type,

    message,

    postId = null

}) {

    console.log(
        "🔔 createNotification:",
        {
            receiverId,
            senderId,
            type,
            message,
            postId
        }
    );


    if (
        !receiverId ||
        !senderId
    ) {

        console.warn(
            "⚠️ Notification cancelled: missing user"
        );

        return null;
    }


    if (
        receiverId === senderId
    ) {

        console.log(
            "ℹ️ Notification skipped: self action"
        );

        return null;
    }


    if (
        !isValidUUID(receiverId) ||
        !isValidUUID(senderId)
    ) {

        console.error(
            "❌ Invalid notification UUID"
        );

        return null;
    }


    const notificationData = {

        receiver_id:
            receiverId,

        sender_id:
            senderId,

        post_id:
            postId,

        type:
            type,

        message:
            message,

        is_read:
            false

    };


    try {

        const {
            error
        } =
            await postsSupabase
                .from("notifications")
                .insert(
                    notificationData
                );


        if (error) {

            console.error(
                "❌ Notification insert failed:",
                error
            );

            return null;
        }


        console.log(
            "✅ Notification inserted"
        );

        return notificationData;

    } catch (error) {

        console.error(
            "❌ createNotification exception:",
            error
        );

        return null;
    }
}


// =========================================================
// PROFILES
// =========================================================

async function loadPostsProfiles() {

    try {

        const {
            data,
            error
        } =
            await postsSupabase
                .from("profiles")
                .select("*");


        if (error) {

            console.error(
                "❌ Profiles error:",
                error
            );

            postsProfiles = [];

            return;
        }


        postsProfiles =
            data || [];


        console.log(
            "👥 Profiles loaded:",
            postsProfiles.length
        );

    } catch (error) {

        console.error(
            "❌ loadPostsProfiles:",
            error
        );

        postsProfiles = [];
    }
}


// =========================================================
// GET PROFILE
// =========================================================

function getPostProfile(userId) {

    if (!userId) {
        return null;
    }

    return postsProfiles.find(
        profile =>
            profile.id === userId
    ) || null;
}


// =========================================================
// PROFILE NAME
// =========================================================

function getProfileDisplayName(
    profile,
    fallback = "User"
) {

    if (!profile) {
        return fallback;
    }

    return (
        profile.full_name ||
        profile.username ||
        fallback
    );
}


// =========================================================
// PROFILE AVATAR
// =========================================================

function getProfileAvatar(profile) {

    if (
        profile &&
        profile.avatar_url &&
        profile.avatar_url.trim() !== ""
    ) {

        return profile.avatar_url;

    }

    return "images/storyimage.jpeg";
}


// =========================================================
// DATE
// =========================================================

function formatPostDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date =
        new Date(dateValue);

    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "";
    }

    return date.toLocaleString();
}


// =========================================================
// CREATE POST STYLES
// =========================================================

function addCreatePostStyles() {

    if (
        document.getElementById(
            "socialwikiCreatePostStyles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "socialwikiCreatePostStyles";


    style.textContent = `

        .sw-post-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.55);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            padding: 20px;
        }

        .sw-post-modal {
            width: min(600px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            background: #fff;
            border-radius: 14px;
            box-shadow: 0 15px 50px rgba(0,0,0,.3);
            color: #111;
        }

        .sw-post-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid #ddd;
        }

        .sw-post-modal-title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
        }

        .sw-post-modal-close {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            background: #eee;
            font-size: 22px;
            cursor: pointer;
        }

        .sw-post-modal-body {
            padding: 18px;
        }

        .sw-post-user {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 14px;
        }

        .sw-post-user img {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
        }

        .sw-post-user-name {
            font-weight: 700;
        }

        .sw-post-textarea {
            width: 100%;
            min-height: 130px;
            resize: vertical;
            border: none;
            outline: none;
            font-size: 19px;
            font-family: inherit;
            padding: 8px 0;
            box-sizing: border-box;
        }

        .sw-post-media-preview {
            margin-top: 12px;
            border: 1px solid #ddd;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            background: #f5f5f5;
        }

        .sw-post-media-preview img,
        .sw-post-media-preview video {
            display: block;
            width: 100%;
            max-height: 400px;
            object-fit: contain;
            background: #000;
        }

        .sw-remove-media {
            position: absolute;
            right: 10px;
            top: 10px;
            width: 34px;
            height: 34px;
            border: none;
            border-radius: 50%;
            background: rgba(0,0,0,.7);
            color: #fff;
            font-size: 20px;
            cursor: pointer;
        }

        .sw-post-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            margin-top: 12px;
            border: 1px solid #ddd;
            border-radius: 10px;
        }

        .sw-post-action {
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .sw-post-action:hover {
            background: #f0f2f5;
        }

        .sw-post-action.photo {
            color: #16802d;
        }

        .sw-post-action.live {
            color: #d93025;
        }

        .sw-post-action.feeling {
            color: #d89b00;
        }

        .sw-post-publish {
            width: 100%;
            margin-top: 14px;
            border: none;
            border-radius: 8px;
            padding: 12px;
            background: #1877f2;
            color: white;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
        }

        .sw-post-publish:disabled {
            opacity: .55;
            cursor: not-allowed;
        }

        .sw-create-trigger {
            cursor: pointer;
        }

        .sw-feed-media {
            margin-top: 12px;
            border-radius: 10px;
            overflow: hidden;
            background: #000;
        }

        .sw-feed-media img,
        .sw-feed-media video {
            display: block;
            width: 100%;
            max-height: 600px;
            object-fit: contain;
        }

        .sw-feeling-picker {
            margin-top: 12px;
            border: 1px solid #ddd;
            border-radius: 12px;
            background: #fff;
            padding: 12px;
        }

        .sw-feeling-picker-title {
            font-weight: 700;
            margin-bottom: 10px;
            font-size: 15px;
        }

        .sw-feeling-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }

        .sw-feeling-option {
            border: 1px solid #e0e0e0;
            background: #f8f9fa;
            border-radius: 10px;
            padding: 10px 6px;
            cursor: pointer;
            text-align: center;
        }

        .sw-feeling-option:hover {
            background: #f0f2f5;
        }

        .sw-feeling-emoji {
            display: block;
            font-size: 27px;
            margin-bottom: 4px;
        }

        .sw-feeling-name {
            display: block;
            font-size: 12px;
            font-weight: 600;
        }

        .sw-selected-feeling {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            padding: 9px 12px;
            border-radius: 10px;
            background: #fff7df;
            border: 1px solid #f0d98c;
            font-size: 14px;
        }

        .sw-selected-feeling-remove {
            margin-left: auto;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 18px;
            color: #777;
        }

        #sponsoredAdsFeed {
            width: 100%;
            margin: 20px 0;
        }

        .sw-sponsored-wrapper {
            display: flex;
            flex-direction: column;
            gap: 18px;
            width: 100%;
        }

        .sw-sponsored-card {
            width: 100%;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }

        .sw-sponsored-label {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #777;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .sw-sponsored-title {
            font-size: 19px;
            font-weight: 700;
            margin-bottom: 6px;
        }

        .sw-sponsored-campaign {
            color: #777;
            font-size: 12px;
            margin-bottom: 12px;
        }

        .sw-sponsored-image {
            width: 100%;
            max-height: 420px;
            object-fit: cover;
            border-radius: 10px;
            display: block;
            margin-bottom: 14px;
        }

        .sw-sponsored-description {
            color: #555;
            line-height: 1.5;
            margin-bottom: 12px;
            word-break: break-word;
        }

        .sw-sponsored-link {
            display: inline-block;
            color: #1877f2;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
        }

        .sw-sponsored-link:hover {
            text-decoration: underline;
        }

        .sw-sponsored-empty {
            padding: 15px;
            text-align: center;
            color: #777;
            font-size: 13px;
        }

        @media (max-width: 500px) {

            .sw-feeling-grid {
                grid-template-columns: repeat(3, 1fr);
            }

            .sw-post-actions {
                flex-direction: column;
            }

            .sw-post-action {
                width: 100%;
            }

        }

    `;


    document.head.appendChild(
        style
    );
}


// =========================================================
// FEELING DISPLAY
// =========================================================

function updateFeelingDisplay() {

    const selected =
        document.getElementById(
            "swSelectedFeeling"
        );

    if (!selected) {
        return;
    }


    if (!selectedPostFeeling) {

        selected.innerHTML = "";

        selected.style.display =
            "none";

        return;
    }


    selected.innerHTML = `

        <span style="font-size:24px;">
            ${escapeHTML(
                selectedPostFeeling.emoji
            )}
        </span>

        <span>
            Feeling
            <strong>
                ${escapeHTML(
                    selectedPostFeeling.name
                )}
            </strong>
        </span>

        <button
            type="button"
            class="sw-selected-feeling-remove"
            id="swRemoveFeeling"
        >
            ×
        </button>

    `;


    selected.style.display =
        "flex";


    document
        .getElementById(
            "swRemoveFeeling"
        )
        ?.addEventListener(
            "click",
            () => {

                selectedPostFeeling =
                    null;

                updateFeelingDisplay();

                updatePublishButton();

            }
        );
}


// =========================================================
// FEELING PICKER
// =========================================================

function openFeelingPicker() {

    const picker =
        document.getElementById(
            "swFeelingPicker"
        );

    if (!picker) {
        return;
    }

    picker.style.display =
        picker.style.display === "none"
            ? "block"
            : "none";
}


function createFeelingPicker() {

    const picker =
        document.createElement(
            "div"
        );

    picker.id =
        "swFeelingPicker";

    picker.className =
        "sw-feeling-picker";

    picker.style.display =
        "none";


    let optionsHTML = "";


    SOCIALWIKI_FEELINGS.forEach(
        feeling => {

            optionsHTML += `

                <button
                    type="button"
                    class="sw-feeling-option"
                    data-feeling-name="${escapeHTML(
                        feeling.name
                    )}"
                >

                    <span class="sw-feeling-emoji">
                        ${escapeHTML(
                            feeling.emoji
                        )}
                    </span>

                    <span class="sw-feeling-name">
                        ${escapeHTML(
                            feeling.name
                        )}
                    </span>

                </button>

            `;

        }
    );


    picker.innerHTML = `

        <div class="sw-feeling-picker-title">
            How are you feeling?
        </div>

        <div class="sw-feeling-grid">
            ${optionsHTML}
        </div>

    `;


    picker
        .querySelectorAll(
            ".sw-feeling-option"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const name =
                            button.dataset
                                .feelingName;


                        const feeling =
                            SOCIALWIKI_FEELINGS.find(
                                item =>
                                    item.name ===
                                    name
                            );


                        if (!feeling) {
                            return;
                        }


                        selectedPostFeeling = {

                            emoji:
                                feeling.emoji,

                            name:
                                feeling.name

                        };


                        picker.style.display =
                            "none";


                        updateFeelingDisplay();

                        updatePublishButton();

                    }
                );

            }
        );


    return picker;
}


// =========================================================
// CREATE POST MODAL
// =========================================================

function openCreatePostModal(
    initialText = ""
) {

    addCreatePostStyles();


    if (createPostModal) {

        createPostModal.remove();

        createPostModal =
            null;
    }


    selectedPostFeeling =
        null;


    const overlay =
        document.createElement(
            "div"
        );

    overlay.className =
        "sw-post-modal-overlay";


    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "sw-post-modal";


    const header =
        document.createElement(
            "div"
        );

    header.className =
        "sw-post-modal-header";


    header.innerHTML = `

        <h2 class="sw-post-modal-title">
            Create Post
        </h2>

        <button
            type="button"
            class="sw-post-modal-close"
            id="swClosePostModal"
        >
            ×
        </button>

    `;


    const body =
        document.createElement(
            "div"
        );

    body.className =
        "sw-post-modal-body";


    body.innerHTML = `

        <div class="sw-post-user">

            <img
                id="swCreatePostAvatar"
                src="images/storyimage.jpeg"
                alt="Profile"
            >

            <div
                id="swCreatePostName"
                class="sw-post-user-name"
            >
                User
            </div>

        </div>


        <textarea
            id="swCreatePostText"
            class="sw-post-textarea"
            placeholder="What's on your mind?"
        ></textarea>


        <div
            id="swSelectedFeeling"
            class="sw-selected-feeling"
            style="display:none;"
        ></div>


        <div
            id="swPostMediaPreview"
            class="sw-post-media-preview"
            style="display:none;"
        ></div>


        <div class="sw-post-actions">

            <button
                type="button"
                class="sw-post-action photo"
                id="swPostPhotoButton"
            >
                📷 Photo/Video
            </button>

            <button
                type="button"
                class="sw-post-action live"
                id="swPostLiveButton"
            >
                🔴 Live
            </button>

            <button
                type="button"
                class="sw-post-action feeling"
                id="swPostFeelingButton"
            >
                😊 Feeling
            </button>

        </div>


        <button
            type="button"
            class="sw-post-publish"
            id="swPublishPostButton"
        >
            Post
        </button>

    `;


    body.appendChild(
        createFeelingPicker()
    );


    modal.appendChild(header);

    modal.appendChild(body);

    overlay.appendChild(modal);

    document.body.appendChild(overlay);


    createPostModal =
        overlay;


    getCurrentPostsUser()
        .then(
            user => {

                if (!user) {
                    return;
                }


                const profile =
                    getPostProfile(
                        user.id
                    );


                const avatar =
                    getProfileAvatar(
                        profile
                    );


                const name =
                    getProfileDisplayName(
                        profile,
                        user.email || "User"
                    );


                const avatarElement =
                    document.getElementById(
                        "swCreatePostAvatar"
                    );


                const nameElement =
                    document.getElementById(
                        "swCreatePostName"
                    );


                if (avatarElement) {

                    avatarElement.src =
                        avatar;

                }


                if (nameElement) {

                    nameElement.textContent =
                        name;

                }

            }
        );


    const textarea =
        document.getElementById(
            "swCreatePostText"
        );


    if (textarea) {

        textarea.value =
            initialText || "";


        textarea.addEventListener(
            "input",
            updatePublishButton
        );


        setTimeout(
            () => textarea.focus(),
            50
        );

    }


    document
        .getElementById(
            "swClosePostModal"
        )
        ?.addEventListener(
            "click",
            closeCreatePostModal
        );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                closeCreatePostModal();

            }

        }
    );


    document
        .getElementById(
            "swPostPhotoButton"
        )
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById(
                        "mediaInput"
                    )
                    ?.click();

            }
        );


    document
        .getElementById(
            "swPostLiveButton"
        )
        ?.addEventListener(
            "click",
            () => {

                alert(
                    "🔴 Live feature will be added later."
                );

            }
        );


    document
        .getElementById(
            "swPostFeelingButton"
        )
        ?.addEventListener(
            "click",
            openFeelingPicker
        );


    document
        .getElementById(
            "swPublishPostButton"
        )
        ?.addEventListener(
            "click",
            publishCreatePost
        );


    updateFeelingDisplay();

    updatePublishButton();


    return overlay;
}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeCreatePostModal() {

    if (createPostModal) {

        createPostModal.remove();

        createPostModal =
            null;
    }


    selectedPostFeeling =
        null;


    clearSelectedMedia();
}


// =========================================================
// MEDIA PREVIEW
// =========================================================

function showSelectedMediaPreview(file) {

    const preview =
        document.getElementById(
            "swPostMediaPreview"
        );


    if (!preview) {
        return;
    }


    preview.innerHTML = "";


    if (!file) {

        preview.style.display =
            "none";

        return;
    }


    if (
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/")
    ) {

        alert(
            "Please select an image or video."
        );

        return;
    }


    selectedPostMediaFile =
        file;


    if (
        selectedPostMediaPreviewUrl
    ) {

        URL.revokeObjectURL(
            selectedPostMediaPreviewUrl
        );

    }


    selectedPostMediaPreviewUrl =
        URL.createObjectURL(file);


    if (
        file.type.startsWith("image/")
    ) {

        const img =
            document.createElement(
                "img"
            );

        img.src =
            selectedPostMediaPreviewUrl;

        img.alt =
            "Selected media";

        preview.appendChild(img);

    } else {

        const video =
            document.createElement(
                "video"
            );

        video.src =
            selectedPostMediaPreviewUrl;

        video.controls =
            true;

        preview.appendChild(video);

    }


    const removeButton =
        document.createElement(
            "button"
        );


    removeButton.type =
        "button";

    removeButton.className =
        "sw-remove-media";

    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        clearSelectedMedia
    );


    preview.appendChild(
        removeButton
    );


    preview.style.display =
        "block";


    updatePublishButton();
}


// =========================================================
// CLEAR MEDIA
// =========================================================

function clearSelectedMedia() {

    selectedPostMediaFile =
        null;


    if (
        selectedPostMediaPreviewUrl
    ) {

        try {

            URL.revokeObjectURL(
                selectedPostMediaPreviewUrl
            );

        } catch (error) {

            console.warn(
                "Could not revoke media URL",
                error
            );

        }

    }


    selectedPostMediaPreviewUrl =
        null;


    const preview =
        document.getElementById(
            "swPostMediaPreview"
        );


    if (preview) {

        preview.innerHTML = "";

        preview.style.display =
            "none";

    }


    const mediaInput =
        document.getElementById(
            "mediaInput"
        );


    if (mediaInput) {

        mediaInput.value = "";

    }


    updatePublishButton();
}


// =========================================================
// PUBLISH BUTTON
// =========================================================

function updatePublishButton() {

    const button =
        document.getElementById(
            "swPublishPostButton"
        );


    const textarea =
        document.getElementById(
            "swCreatePostText"
        );


    if (!button) {
        return;
    }


    const hasText =
        !!(
            textarea &&
            textarea.value &&
            textarea.value.trim()
        );


    const hasMedia =
        !!selectedPostMediaFile;


    const hasFeeling =
        !!selectedPostFeeling;


    button.disabled =
        !(hasText || hasMedia || hasFeeling);
}


// =========================================================
// MEDIA INPUT
// =========================================================

function setupMediaInput() {

    const mediaInput =
        document.getElementById(
            "mediaInput"
        );


    if (!mediaInput) {

        console.warn(
            "⚠️ #mediaInput not found"
        );

        return;
    }


    if (
        mediaInput.dataset.socialwikiReady ===
        "true"
    ) {

        return;
    }


    mediaInput.dataset.socialwikiReady =
        "true";


    mediaInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith("image/") &&
                !file.type.startsWith("video/")
            ) {

                alert(
                    "Only images and videos are supported."
                );

                mediaInput.value = "";

                return;
            }


            if (!createPostModal) {

                openCreatePostModal();


                setTimeout(
                    () => {

                        showSelectedMediaPreview(
                            file
                        );

                    },
                    100
                );

            } else {

                showSelectedMediaPreview(
                    file
                );

            }

        }
    );


    console.log(
        "✅ Media input ready"
    );
}


// =========================================================
// UPLOAD MEDIA
// =========================================================

async function uploadPostMedia(
    file,
    userId
) {

    if (!file || !userId) {

        throw new Error(
            "Missing media file or user ID"
        );
    }


    const safeName =
        (
            file.name ||
            "media"
        ).replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    const storagePath =
        `${userId}/${Date.now()}_${Math.random()
            .toString(36)
            .substring(2,10)}_${safeName}`;


    const {
        data,
        error
    } =
        await postsSupabase
            .storage
            .from("post_media")
            .upload(
                storagePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type
                }
            );


    if (error) {

        console.error(
            "❌ Media upload error:",
            error
        );

        throw error;
    }


    const {
        data: publicData
    } =
        postsSupabase
            .storage
            .from("post_media")
            .getPublicUrl(
                storagePath
            );


    const publicUrl =
        publicData?.publicUrl || "";


    if (!publicUrl) {

        throw new Error(
            "Could not create public media URL."
        );
    }


    return {

        path:
            storagePath,

        url:
            publicUrl,

        type:
            file.type.startsWith("video/")
                ? "video"
                : "image"

    };
}


// =========================================================
// PUBLISH POST
// =========================================================

async function publishCreatePost() {

    const button =
        document.getElementById(
            "swPublishPostButton"
        );


    const textarea =
        document.getElementById(
            "swCreatePostText"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Posting...";

    }


    try {

        const user =
            await getCurrentPostsUser();


        if (!user) {

            alert(
                "Please log in first."
            );

            return;
        }


        const text =
            textarea?.value?.trim() || "";


        if (
            !text &&
            !selectedPostMediaFile &&
            !selectedPostFeeling
        ) {

            alert(
                "Write something, choose a feeling, or choose a photo/video."
            );

            return;
        }


        let mediaUrl = null;

        let mediaType = null;


        if (selectedPostMediaFile) {

            const uploaded =
                await uploadPostMedia(
                    selectedPostMediaFile,
                    user.id
                );


            mediaUrl =
                uploaded.url;

            mediaType =
                uploaded.type;
        }


        let finalContent =
            text;


        if (selectedPostFeeling) {

            const feelingText =
                `${selectedPostFeeling.emoji} Feeling ${selectedPostFeeling.name}`;


            finalContent =
                finalContent
                    ? `${finalContent}\n${feelingText}`
                    : feelingText;
        }


        const {
            data: newPost,
            error
        } =
            await postsSupabase
                .from("posts")
                .insert({

                    user_id:
                        user.id,

                    content:
                        finalContent || "",

                    media_url:
                        mediaUrl,

                    media_type:
                        mediaType

                })
                .select()
                .single();


        if (error) {

            console.error(
                "❌ Create post error:",
                error
            );

            alert(
                "Could not create the post.\n\n" +
                error.message
            );

            return;
        }


        console.log(
            "✅ Post created:",
            newPost
        );


        closeCreatePostModal();


        const oldInput =
            document.getElementById(
                "postInput"
            );


        if (oldInput) {

            oldInput.value = "";

        }


        await loadPosts();


    } catch (error) {

        console.error(
            "❌ publishCreatePost:",
            error
        );

        alert(
            "Something went wrong while creating the post."
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Post";

        }

        updatePublishButton();

    }
}


// =========================================================
// CREATE POST SETUP
// =========================================================

function setupCreatePost() {

    const postInput =
        document.getElementById(
            "postInput"
        );


    const postButton =
        document.getElementById(
            "postButton"
        );


    const mediaButton =
        document.getElementById(
            "mediaButton"
        );


    if (
        postInput &&
        postInput.dataset.socialwikiCreateReady !==
            "true"
    ) {

        postInput.dataset.socialwikiCreateReady =
            "true";


        postInput.classList.add(
            "sw-create-trigger"
        );


        postInput.readOnly =
            true;


        postInput.addEventListener(
            "click",
            () => {

                openCreatePostModal(
                    postInput.value || ""
                );

            }
        );

    }


    if (
        postButton &&
        postButton.dataset.socialwikiCreateReady !==
            "true"
    ) {

        postButton.dataset.socialwikiCreateReady =
            "true";


        postButton.addEventListener(
            "click",
            () => {

                openCreatePostModal(
                    postInput?.value || ""
                );

            }
        );

    }


    if (
        mediaButton &&
        mediaButton.dataset.socialwikiCreateReady !==
            "true"
    ) {

        mediaButton.dataset.socialwikiCreateReady =
            "true";


        mediaButton.addEventListener(
            "click",
            () => {

                openCreatePostModal();


                setTimeout(
                    () => {

                        document
                            .getElementById(
                                "mediaInput"
                            )
                            ?.click();

                    },
                    100
                );

            }
        );

    }


    setupMediaInput();


    console.log(
        "✅ Create Post system ready"
    );
}


// =========================================================
// LOAD COMMENTS
// =========================================================

async function loadComments(
    postId,
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML =
        `<div style="padding:10px;">Loading comments...</div>`;


    try {

        const {
            data: comments,
            error
        } =
            await postsSupabase
                .from("comments")
                .select("*")
                .eq(
                    "post_id",
                    postId
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "❌ Comments error:",
                error
            );

            container.innerHTML =
                `<div style="padding:10px;">Could not load comments.</div>`;

            return;
        }


        if (
            !comments ||
            comments.length === 0
        ) {

            container.innerHTML =
                `<div style="padding:10px;color:#777;">No comments yet.</div>`;

            return;
        }


        container.innerHTML = "";


        comments.forEach(
            comment => {

                const profile =
                    getPostProfile(
                        comment.user_id
                    );


                const name =
                    getProfileDisplayName(
                        profile
                    );


                const avatar =
                    getProfileAvatar(
                        profile
                    );


                const item =
                    document.createElement(
                        "div"
                    );


                item.style.display =
                    "flex";

                item.style.gap =
                    "8px";

                item.style.padding =
                    "8px 0";


                item.innerHTML = `

                    <img
                        src="${escapeHTML(avatar)}"
                        alt="Profile"
                        style="
                            width:34px;
                            height:34px;
                            border-radius:50%;
                            object-fit:cover;
                        "
                    >

                    <div
                        style="
                            flex:1;
                            background:#f0f2f5;
                            border-radius:12px;
                            padding:8px 10px;
                        "
                    >

                        <div
                            style="
                                font-weight:700;
                                margin-bottom:3px;
                            "
                        >
                            ${escapeHTML(name)}
                        </div>

                        <div>
                            ${escapeHTML(
                                comment.content || ""
                            )}
                        </div>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ loadComments:",
            error
        );

    }
}


// =========================================================
// ADD COMMENT
// =========================================================

async function addComment(
    post,
    currentUser,
    commentInput,
    commentsContainer
) {

    if (!currentUser) {

        alert(
            "Please log in first."
        );

        return;
    }


    const text =
        commentInput?.value?.trim();


    if (!text) {
        return;
    }


    try {

        const {
            data: comment,
            error
        } =
            await postsSupabase
                .from("comments")
                .insert({

                    post_id:
                        post.id,

                    user_id:
                        currentUser.id,

                    content:
                        text

                })
                .select()
                .single();


        if (error) {

            console.error(
                "❌ Add comment:",
                error
            );

            alert(
                "Could not add comment."
            );

            return;
        }


        console.log(
            "✅ Comment created:",
            comment
        );


        commentInput.value = "";


        await loadComments(
            post.id,
            commentsContainer
        );


        const ownerId =
            getPostOwnerId(post);


        if (
            ownerId &&
            ownerId !== currentUser.id
        ) {

            await createNotification({

                receiverId:
                    ownerId,

                senderId:
                    currentUser.id,

                type:
                    "comment",

                message:
                    "commented on your post.",

                postId:
                    post.id

            });

        }


    } catch (error) {

        console.error(
            "❌ addComment:",
            error
        );

    }
}


// =========================================================
// EDIT POST
// =========================================================

async function editPost(
    post,
    currentUser
) {

    if (!currentUser) {
        return;
    }


    const ownerId =
        getPostOwnerId(post);


    if (
        !ownerId ||
        ownerId !== currentUser.id
    ) {

        alert(
            "You can only edit your own post."
        );

        return;
    }


    const newText =
        prompt(
            "Edit your post:",
            post.content || ""
        );


    if (newText === null) {
        return;
    }


    const updatedText =
        newText.trim();


    if (
        !updatedText &&
        !post.media_url
    ) {

        alert(
            "Post cannot be empty."
        );

        return;
    }


    try {

        const {
            error
        } =
            await postsSupabase
                .from("posts")
                .update({
                    content:
                        updatedText
                })
                .eq(
                    "id",
                    post.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {

            console.error(
                "❌ Edit post:",
                error
            );

            alert(
                "Could not edit post."
            );

            return;
        }


        await loadPosts();


    } catch (error) {

        console.error(
            "❌ editPost:",
            error
        );

    }
}


// =========================================================
// DELETE POST
// =========================================================

async function deletePost(
    post,
    currentUser
) {

    if (!currentUser) {
        return;
    }


    const ownerId =
        getPostOwnerId(post);


    if (
        !ownerId ||
        ownerId !== currentUser.id
    ) {

        alert(
            "You can only delete your own post."
        );

        return;
    }


    if (
        !confirm(
            "Delete this post?"
        )
    ) {

        return;
    }


    try {

        const {
            error
        } =
            await postsSupabase
                .from("posts")
                .delete()
                .eq(
                    "id",
                    post.id
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {

            console.error(
                "❌ Delete post:",
                error
            );

            alert(
                "Could not delete post."
            );

            return;
        }


        await loadPosts();


    } catch (error) {

        console.error(
            "❌ deletePost:",
            error
        );

    }
}


// =========================================================
// CREATE POST ELEMENT
// =========================================================

async function createPostElement(
    post,
    currentUser
) {

    const postElement =
        document.createElement(
            "article"
        );


    postElement.className =
        "post-card";


    postElement.dataset.postId =
        post.id;


    const ownerId =
        getPostOwnerId(post);


    const profile =
        getPostProfile(ownerId);


    const displayName =
        getProfileDisplayName(
            profile,
            post.username || "User"
        );


    const avatar =
        getProfileAvatar(profile);


    let likesCount = 0;

    let userLiked = false;


    try {

        const {
            data: likes,
            error
        } =
            await postsSupabase
                .from("likes")
                .select("*")
                .eq(
                    "post_id",
                    post.id
                );


        if (!error && likes) {

            likesCount =
                likes.length;


            userLiked =
                likes.some(
                    like =>
                        like.user_id ===
                        currentUser?.id
                );

        }

    } catch (error) {

        console.warn(
            "⚠️ Likes loading:",
            error
        );

    }


    let commentsCount = 0;


    try {

        const {
            count,
            error
        } =
            await postsSupabase
                .from("comments")
                .select(
                    "*",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "post_id",
                    post.id
                );


        if (!error) {

            commentsCount =
                count || 0;

        }

    } catch (error) {

        console.warn(
            "⚠️ Comments count:",
            error
        );

    }


    let sharesCount = 0;


    try {

        const {
            count,
            error
        } =
            await postsSupabase
                .from("shares")
                .select(
                    "*",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "post_id",
                    post.id
                );


        if (!error) {

            sharesCount =
                count || 0;

        }

    } catch (error) {

        console.warn(
            "⚠️ Shares count:",
            error
        );

    }


    let mediaHTML = "";


    if (
        post.media_url &&
        post.media_type === "image"
    ) {

        mediaHTML = `

            <div class="sw-feed-media">

                <img
                    src="${escapeHTML(post.media_url)}"
                    alt="Post image"
                    loading="lazy"
                >

            </div>

        `;

    } else if (
        post.media_url &&
        post.media_type === "video"
    ) {

        mediaHTML = `

            <div class="sw-feed-media">

                <video
                    src="${escapeHTML(post.media_url)}"
                    controls
                    preload="metadata"
                ></video>

            </div>

        `;

    }


    let ownerMenuHTML = "";


    if (
        currentUser &&
        ownerId === currentUser.id
    ) {

        ownerMenuHTML = `

            <div
                class="post-owner-actions"
                style="
                    display:flex;
                    gap:6px;
                    margin-left:auto;
                "
            >

                <button
                    type="button"
                    class="edit-post-btn"
                >
                    ✏️
                </button>

                <button
                    type="button"
                    class="delete-post-btn"
                >
                    🗑️
                </button>

            </div>

        `;

    }


    postElement.innerHTML = `

        <div
            class="post-header"
            style="
                display:flex;
                align-items:center;
                gap:10px;
            "
        >

            <img
                src="${escapeHTML(avatar)}"
                alt="Profile"
                style="
                    width:42px;
                    height:42px;
                    border-radius:50%;
                    object-fit:cover;
                "
            >

            <div>

                <div
                    style="
                        font-weight:700;
                    "
                >
                    ${escapeHTML(displayName)}
                </div>

                <div
                    style="
                        font-size:12px;
                        color:#777;
                    "
                >
                    ${escapeHTML(
                        formatPostDate(
                            post.created_at
                        )
                    )}
                </div>

            </div>

            ${ownerMenuHTML}

        </div>


        <div
            class="post-content"
            style="margin-top:12px;"
        >

            ${
                post.content
                    ? escapeHTML(
                        post.content
                    ).replace(
                        /\n/g,
                        "<br>"
                    )
                    : ""
            }

            ${mediaHTML}

        </div>


        <div
            class="post-stats"
            style="
                display:flex;
                justify-content:space-between;
                padding:10px 0;
                color:#666;
                font-size:14px;
            "
        >

            <span class="like-count">
                👍 ${likesCount}
            </span>

            <span class="post-counts">
                ${commentsCount} comments
                ·
                ${sharesCount} shares
            </span>

        </div>


        <div
            class="post-actions"
            style="
                display:flex;
                gap:4px;
                border-top:1px solid #ddd;
                border-bottom:1px solid #ddd;
            "
        >

            <button
                type="button"
                class="post-like-btn"
                style="
                    flex:1;
                    border:none;
                    background:transparent;
                    padding:10px;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                ${
                    userLiked
                        ? "👍 Liked"
                        : "👍 Like"
                }
            </button>


            <button
                type="button"
                class="post-comment-btn"
                style="
                    flex:1;
                    border:none;
                    background:transparent;
                    padding:10px;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                💬 Comment
            </button>


            <button
                type="button"
                class="post-share-btn"
                style="
                    flex:1;
                    border:none;
                    background:transparent;
                    padding:10px;
                    cursor:pointer;
                    font-weight:600;
                "
            >
                ↗️ Share
            </button>

        </div>


        <div
            class="comments-section"
            style="
                display:none;
                padding-top:10px;
            "
        >

            <div class="comments-list"></div>


            <div
                style="
                    display:flex;
                    gap:6px;
                    margin-top:8px;
                "
            >

                <input
                    type="text"
                    class="comment-input"
                    placeholder="Write a comment..."
                    style="
                        flex:1;
                        padding:10px;
                        border:1px solid #ddd;
                        border-radius:20px;
                        outline:none;
                    "
                >

                <button
                    type="button"
                    class="send-comment-btn"
                >
                    Send
                </button>

            </div>

        </div>

    `;


    const likeButton =
        postElement.querySelector(
            ".post-like-btn"
        );


    const likeCountElement =
        postElement.querySelector(
            ".like-count"
        );


    const commentButton =
        postElement.querySelector(
            ".post-comment-btn"
        );


    const shareButton =
        postElement.querySelector(
            ".post-share-btn"
        );


    const commentsSection =
        postElement.querySelector(
            ".comments-section"
        );


    const commentsList =
        postElement.querySelector(
            ".comments-list"
        );


    const commentInput =
        postElement.querySelector(
            ".comment-input"
        );


    const sendCommentButton =
        postElement.querySelector(
            ".send-comment-btn"
        );


    // =====================================================
    // LIKE
    // =====================================================

    likeButton?.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please log in first."
                );

                return;
            }


            likeButton.disabled =
                true;


            try {

                if (userLiked) {

                    const {
                        error
                    } =
                        await postsSupabase
                            .from("likes")
                            .delete()
                            .eq(
                                "post_id",
                                post.id
                            )
                            .eq(
                                "user_id",
                                currentUser.id
                            );


                    if (error) {

                        console.error(
                            "❌ Unlike:",
                            error
                        );

                        return;
                    }


                    userLiked =
                        false;


                    likesCount =
                        Math.max(
                            0,
                            likesCount - 1
                        );


                    likeButton.textContent =
                        "👍 Like";


                } else {

                    const {
                        error
                    } =
                        await postsSupabase
                            .from("likes")
                            .insert({

                                post_id:
                                    post.id,

                                user_id:
                                    currentUser.id

                            });


                    if (error) {

                        console.error(
                            "❌ Like:",
                            error
                        );

                        return;
                    }


                    userLiked =
                        true;


                    likesCount++;


                    likeButton.textContent =
                        "👍 Liked";


                    const receiverId =
                        getPostOwnerId(
                            post
                        );


                    if (
                        receiverId &&
                        receiverId !==
                            currentUser.id
                    ) {

                        await createNotification({

                            receiverId:
                                receiverId,

                            senderId:
                                currentUser.id,

                            type:
                                "like",

                            message:
                                "liked your post.",

                            postId:
                                post.id

                        });

                    }

                }


                if (likeCountElement) {

                    likeCountElement.textContent =
                        `👍 ${likesCount}`;

                }


            } catch (error) {

                console.error(
                    "❌ Like handler:",
                    error
                );


            } finally {

                likeButton.disabled =
                    false;

            }

        }
    );


    // =====================================================
    // COMMENTS
    // =====================================================

    commentButton?.addEventListener(
        "click",
        async () => {

            if (
                commentsSection.style.display ===
                "none"
            ) {

                commentsSection.style.display =
                    "block";


                await loadComments(
                    post.id,
                    commentsList
                );

            } else {

                commentsSection.style.display =
                    "none";

            }

        }
    );


    sendCommentButton?.addEventListener(
        "click",
        async () => {

            await addComment(
                post,
                currentUser,
                commentInput,
                commentsList
            );

        }
    );


    commentInput?.addEventListener(
        "keydown",
        async event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                await addComment(
                    post,
                    currentUser,
                    commentInput,
                    commentsList
                );

            }

        }
    );


    // =====================================================
    // SHARE
    // =====================================================

    shareButton?.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please log in first."
                );

                return;
            }


            try {

                const {
                    data: existingShares,
                    error: checkError
                } =
                    await postsSupabase
                        .from("shares")
                        .select("id")
                        .eq(
                            "post_id",
                            post.id
                        )
                        .eq(
                            "user_id",
                            currentUser.id
                        )
                        .limit(1);


                if (checkError) {

                    console.error(
                        "❌ Share check:",
                        checkError
                    );

                    return;
                }


                if (
                    existingShares &&
                    existingShares.length
                ) {

                    alert(
                        "You already shared this post."
                    );

                    return;
                }


                const {
                    error
                } =
                    await postsSupabase
                        .from("shares")
                        .insert({

                            post_id:
                                post.id,

                            user_id:
                                currentUser.id

                        });


                if (error) {

                    console.error(
                        "❌ Share:",
                        error
                    );

                    return;
                }


                sharesCount++;


                const receiverId =
                    getPostOwnerId(
                        post
                    );


                if (
                    receiverId &&
                    receiverId !==
                        currentUser.id
                ) {

                    await createNotification({

                        receiverId:
                            receiverId,

                        senderId:
                            currentUser.id,

                        type:
                            "share",

                        message:
                            "shared your post.",

                        postId:
                            post.id

                    });

                }


                const counts =
                    postElement.querySelector(
                        ".post-counts"
                    );


                if (counts) {

                    counts.textContent =
                        `${commentsCount} comments · ${sharesCount} shares`;

                }


                alert(
                    "✅ Post shared!"
                );


            } catch (error) {

                console.error(
                    "❌ Share exception:",
                    error
                );

            }

        }
    );


    // =====================================================
    // EDIT
    // =====================================================

    postElement
        .querySelector(
            ".edit-post-btn"
        )
        ?.addEventListener(
            "click",
            async () => {

                await editPost(
                    post,
                    currentUser
                );

            }
        );


    // =====================================================
    // DELETE
    // =====================================================

    postElement
        .querySelector(
            ".delete-post-btn"
        )
        ?.addEventListener(
            "click",
            async () => {

                await deletePost(
                    post,
                    currentUser
                );

            }
        );


    return postElement;
}


// =========================================================
// SPONSORED ADS
// =========================================================

async function loadSponsoredAds() {

    console.log(
        "📢 Loading sponsored ads..."
    );


    const container =
        document.getElementById(
            "sponsoredAdsFeed"
        );


    if (!container) {

        console.warn(
            "⚠️ #sponsoredAdsFeed not found"
        );

        return;
    }


    try {

        const {
            data: ads,
            error
        } =
            await postsSupabase
                .from("ad_campaigns")
                .select(`
                    id,
                    ad_name,
                    ad_title,
                    description,
                    destination_link,
                    media_url,
                    media_type,
                    language,
                    currency,
                    budget,
                    start_date,
                    end_date,
                    status,
                    created_at
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "❌ Sponsored ads:",
                error
            );

            container.innerHTML = "";

            return;
        }


        if (
            !ads ||
            ads.length === 0
        ) {

            container.innerHTML = "";

            return;
        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "sw-sponsored-wrapper";


        ads.forEach(
            ad => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "sw-sponsored-card";


                let mediaHTML = "";


                if (
                    ad.media_url &&
                    ad.media_type ===
                        "image"
                ) {

                    mediaHTML = `

                        <img
                            class="sw-sponsored-image"
                            src="${escapeHTML(
                                ad.media_url
                            )}"
                            alt="${escapeHTML(
                                ad.ad_title ||
                                "Sponsored Advertisement"
                            )}"
                            loading="lazy"
                        >

                    `;

                } else if (
                    ad.media_url &&
                    ad.media_type ===
                        "video"
                ) {

                    mediaHTML = `

                        <video
                            class="sw-sponsored-image"
                            src="${escapeHTML(
                                ad.media_url
                            )}"
                            controls
                            preload="metadata"
                        ></video>

                    `;

                }


                let linkHTML = "";


                if (
                    ad.destination_link
                ) {

                    linkHTML = `

                        <a
                            class="sw-sponsored-link"
                            href="${escapeHTML(
                                ad.destination_link
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            🔗 Learn More
                        </a>

                    `;

                }


                card.innerHTML = `

                    <div class="sw-sponsored-label">
                        📢 Sponsored
                    </div>

                    <div class="sw-sponsored-title">
                        ${escapeHTML(
                            ad.ad_title ||
                            "Advertisement"
                        )}
                    </div>

                    <div class="sw-sponsored-campaign">
                        ${escapeHTML(
                            ad.ad_name ||
                            "Sponsored Ad"
                        )}
                    </div>

                    ${mediaHTML}

                    <div class="sw-sponsored-description">
                        ${escapeHTML(
                            ad.description || ""
                        ).replace(
                            /\n/g,
                            "<br>"
                        )}
                    </div>

                    ${linkHTML}

                `;


                wrapper.appendChild(
                    card
                );

            }
        );


        container.innerHTML = "";

        container.appendChild(
            wrapper
        );


        console.log(
            "✅ Sponsored ads rendered:",
            ads.length
        );


    } catch (error) {

        console.error(
            "❌ loadSponsoredAds:",
            error
        );

    }
}


// =========================================================
// LOAD POSTS
// =========================================================

async function loadPosts() {

    console.log(
        "📥 Loading posts..."
    );


    try {

        const {
            data: userData,
            error: userError
        } =
            await postsSupabase.auth.getUser();


        if (userError) {

            console.error(
                "❌ Auth:",
                userError
            );

            return;
        }


        const currentUser =
            userData?.user || null;


        if (!currentUser) {

            console.warn(
                "⚠️ No authenticated user."
            );

            return;
        }


        window.currentUserForPosts =
            currentUser;


        await loadPostsProfiles();


        const {
            data: posts,
            error
        } =
            await postsSupabase
                .from("posts")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "❌ Posts:",
                error
            );

            return;
        }


        const feed =
            document.getElementById(
                "postsFeed"
            );


        if (!feed) {

            console.error(
                "❌ #postsFeed not found"
            );

            return;
        }


        /*
         * IMPORTANT:
         * We DO NOT remove #sponsoredAdsFeed.
         */

        const sponsoredAdsFeed =
            document.getElementById(
                "sponsoredAdsFeed"
            );


        feed.innerHTML = "";


        if (
            !posts ||
            posts.length === 0
        ) {

            feed.innerHTML = `

                <div
                    style="
                        padding:30px;
                        text-align:center;
                        color:#777;
                    "
                >
                    No posts yet.
                </div>

            `;


            if (sponsoredAdsFeed) {

                feed.appendChild(
                    sponsoredAdsFeed
                );

                await loadSponsoredAds();

            }


            return;
        }


        for (
            let i = 0;
            i < posts.length;
            i++
        ) {

            const element =
                await createPostElement(
                    posts[i],
                    currentUser
                );


            feed.appendChild(
                element
            );


            if (
                i === 4 &&
                sponsoredAdsFeed
            ) {

                feed.appendChild(
                    sponsoredAdsFeed
                );


                await loadSponsoredAds();

            }

        }


        if (
            sponsoredAdsFeed &&
            !sponsoredAdsFeed.parentElement
        ) {

            feed.appendChild(
                sponsoredAdsFeed
            );


            await loadSponsoredAds();

        }


        console.log(
            "✅ All posts rendered"
        );


    } catch (error) {

        console.error(
            "❌ loadPosts:",
            error
        );

    }
}


// =========================================================
// RIGHT SIDEBAR
// =========================================================

async function loadRightSidebar() {

    console.log(
        "➡️ Loading Right Sidebar..."
    );


    const profileBox =
        document.getElementById(
            "rightProfileBox"
        );


    const switchBox =
        document.getElementById(
            "switchAccountBox"
        );


    const groupsBox =
        document.getElementById(
            "rightGroupsBox"
        );


    const contentBox =
        document.getElementById(
            "rightSidebarContent"
        );


    if (
        !profileBox &&
        !switchBox &&
        !groupsBox &&
        !contentBox
    ) {

        console.warn(
            "⚠️ Right Sidebar containers not found"
        );

        return;
    }


    try {

        const user =
            await getCurrentPostsUser();


        if (!user) {

            console.warn(
                "⚠️ No current user for Right Sidebar"
            );

            return;
        }


        let profile = null;


        const {
            data,
            error
        } =
            await postsSupabase
                .from("profiles")
                .select(
                    "id, username, full_name, bio, avatar_url"
                )
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();


        if (error) {

            console.error(
                "❌ Right Sidebar profile:",
                error
            );

        } else {

            profile = data;

        }


        const name =
            getProfileDisplayName(
                profile,
                user.email || "User"
            );


        const username =
            profile?.username
                ? "@" + profile.username
                : "View profile";


        const avatar =
            getProfileAvatar(profile);


        // =================================================
        // PROFILE
        // =================================================

        if (profileBox) {

            profileBox.innerHTML = `

                <a
                    href="profile.html"
                    class="right-profile-link"
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        text-decoration:none;
                        color:inherit;
                    "
                >

                    <img
                        src="${escapeHTML(avatar)}"
                        alt="Profile"
                        style="
                            width:48px;
                            height:48px;
                            border-radius:50%;
                            object-fit:cover;
                            flex-shrink:0;
                        "
                    >

                    <div>

                        <div
                            style="
                                font-weight:700;
                                font-size:15px;
                            "
                        >
                            ${escapeHTML(name)}
                        </div>

                        <div
                            style="
                                color:#777;
                                font-size:13px;
                                margin-top:3px;
                            "
                        >
                            ${escapeHTML(username)}
                        </div>

                    </div>

                </a>

            `;

        }


        // =================================================
        // SWITCH ACCOUNT
        // =================================================

        if (switchBox) {

            switchBox.innerHTML = `

                <div
                    class="right-box-title"
                    style="
                        font-weight:700;
                        margin-bottom:10px;
                    "
                >
                    Switch Account
                </div>

                <button
                    type="button"
                    id="rightSwitchAccountButton"
                    style="
                        width:100%;
                        border:none;
                        background:#f0f2f5;
                        border-radius:8px;
                        padding:10px;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    🔄 Switch Account
                </button>

            `;


            document
                .getElementById(
                    "rightSwitchAccountButton"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        alert(
                            "Switch Account will be connected to multiple accounts."
                        );

                    }
                );

        }


        // =================================================
        // GROUPS
        // =================================================

        if (groupsBox) {

            groupsBox.innerHTML = `

                <div
                    class="right-box-title"
                    style="
                        font-weight:700;
                        margin-bottom:10px;
                    "
                >
                    Your Groups
                </div>

                <a
                    href="groups.html"
                    style="
                        display:block;
                        padding:8px 0;
                        text-decoration:none;
                        color:inherit;
                    "
                >
                    👥 Groups
                </a>

                <a
                    href="groups.html"
                    style="
                        display:block;
                        padding:8px 0;
                        text-decoration:none;
                        color:inherit;
                    "
                >
                    ➕ Discover Groups
                </a>

                <a
                    href="groups.html"
                    style="
                        display:block;
                        padding:8px 0;
                        text-decoration:none;
                        color:inherit;
                    "
                >
                    📜 Group History
                </a>

            `;

        }


        // =================================================
        // RIGHT LINKS
        // =================================================

        if (contentBox) {

            contentBox.innerHTML = `

                <div
                    class="right-box-title"
                    style="
                        font-weight:700;
                        margin-bottom:10px;
                    "
                >
                    Shortcuts
                </div>

                <a href="news.html">
                    📰 Last News
                </a>

                <a href="friends.html">
                    👥 Friends
                </a>

                <a href="groups.html">
                    👥 Groups
                </a>

                <a href="market.html">
                    🛒 Market Plus
                </a>

                <a href="conversations.html">
                    💬 Messenger
                </a>

                <a href="pages.html">
                    📄 Pages
                </a>

                <a href="orders.html">
                    💳 Orders and Payments
                </a>

                <a href="memories.html">
                    🕰️ Memories
                </a>

                <a href="birthdays.html">
                    🎂 Birthdays
                </a>

                <a href="ads-manager.html">
                    📢 Ads Manager
                </a>

                <a href="ad-center.html">
                    📣 Ad Center
                </a>

            `;

        }


        console.log(
            "✅ Right Sidebar loaded"
        );


    } catch (error) {

        console.error(
            "❌ Right Sidebar exception:",
            error
        );

    }
}


// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "🚀 SocialWiki Posts initializing..."
        );


        addCreatePostStyles();


        setupCreatePost();


        await loadPosts();


        await loadRightSidebar();


        console.log(
            "✅ SocialWiki Posts initialized"
        );

    }
);


// =========================================================
// GLOBAL ACCESS
// =========================================================

window.loadPosts =
    loadPosts;


window.loadSponsoredAds =
    loadSponsoredAds;


window.createNotification =
    createNotification;


window.openCreatePostModal =
    openCreatePostModal;


window.closeCreatePostModal =
    closeCreatePostModal;


window.loadRightSidebar =
    loadRightSidebar;


console.log(
    "🌍 Posts functions exposed globally"
);

