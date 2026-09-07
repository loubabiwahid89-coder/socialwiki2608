// =========================================================
// SOCIALWIKI - LATEST NEWS
// =========================================================

console.log("📰 LATEST NEWS JS LOADED");
console.log("🔥 Latest News version: 20260905");


// =========================================================
// SUPABASE
// =========================================================

let latestNewsSupabase =
    window.supabaseClient || null;


if (!latestNewsSupabase) {

    console.error(
        "❌ Supabase client not found!"
    );

} else {

    console.log(
        "✅ Using existing SocialWiki Supabase client"
    );

}


// =========================================================
// DOM
// =========================================================

const latestNewsFeed =
    document.getElementById("latestNewsFeed");

const newsSearchInput =
    document.getElementById("newsSearchInput");

const refreshNewsButton =
    document.getElementById("refreshNewsButton");


// =========================================================
// DATA
// =========================================================

let latestNewsPosts = [];

let latestNewsProfiles = {};

let latestNewsCurrentUser = null;


// =========================================================
// GET CURRENT USER
// =========================================================

async function getLatestNewsUser() {

    const {
        data,
        error
    } = await latestNewsSupabase.auth.getUser();


    if (error) {

        console.error(
            "❌ User error:",
            error
        );

        return null;
    }


    return data?.user || null;
}


// =========================================================
// LOAD PROFILES
// =========================================================

async function loadLatestNewsProfiles() {

    const {
        data,
        error
    } =
        await latestNewsSupabase
            .from("profiles")
            .select(
                "id, username, full_name, avatar_url"
            );


    if (error) {

        console.error(
            "❌ Profiles error:",
            error
        );

        return;
    }


    latestNewsProfiles = {};


    (data || []).forEach(profile => {

        latestNewsProfiles[
            profile.id
        ] = profile;

    });

}


// =========================================================
// LOAD POSTS
// =========================================================

async function loadLatestNewsPosts() {

    latestNewsFeed.innerHTML = `
        <div class="news-loading">
            Loading latest news...
        </div>
    `;


    const {
        data,
        error
    } =
        await latestNewsSupabase
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
            "❌ Posts error:",
            error
        );


        latestNewsFeed.innerHTML = `
            <div class="news-error">
                ❌ Failed to load latest news.
                <br>
                ${escapeLatestNewsHTML(error.message)}
            </div>
        `;

        return;
    }


    latestNewsPosts =
        data || [];


    renderLatestNews(
        latestNewsPosts
    );

}


// =========================================================
// RENDER POSTS
// =========================================================

function renderLatestNews(posts) {

    if (!posts || posts.length === 0) {

        latestNewsFeed.innerHTML = `
            <div class="news-empty">
                📰 No posts yet.
            </div>
        `;

        return;
    }


    latestNewsFeed.innerHTML =
        posts.map(post => {

            const profile =
                latestNewsProfiles[
                    post.user_id
                ] || {};


            const username =
                profile.full_name ||
                profile.username ||
                "SocialWiki User";


            // Avatar fallback
            const avatar =
                profile.avatar_url ||
                "images/right-icon-last-news.webp";


            const time =
                formatLatestNewsDate(
                    post.created_at
                );


            const content =
                escapeLatestNewsHTML(
                    post.content || ""
                );


            return `

                <article
                    class="latest-news-card"
                    data-post-id="${post.id}"
                >

                    <div class="latest-news-user">

                        <img
                            class="latest-news-avatar"
                            src="${escapeLatestNewsAttribute(avatar)}"
                            alt="Avatar"
                            onerror="this.onerror=null; this.src='images/right-icon-last-news.webp';"
                        >

                        <div class="latest-news-user-info">

                            <span
                                class="latest-news-user-name"
                            >
                                ${escapeLatestNewsHTML(username)}
                            </span>

                            <span
                                class="latest-news-time"
                            >
                                ${time}
                            </span>

                        </div>

                    </div>


                    <div class="latest-news-content">
                        ${content}
                    </div>


                    <div class="latest-news-actions">

                        <button
                            class="latest-news-action"
                            onclick="latestNewsLike('${post.id}')"
                        >
                            👍 Like
                        </button>


                        <button
                            class="latest-news-action"
                            onclick="latestNewsComment('${post.id}')"
                        >
                            💬 Comment
                        </button>


                        <button
                            class="latest-news-action"
                            onclick="latestNewsShare('${post.id}')"
                        >
                            ↗️ Share
                        </button>

                    </div>

                </article>

            `;

        }).join("");

}


// =========================================================
// SEARCH
// =========================================================

if (newsSearchInput) {

    newsSearchInput.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                renderLatestNews(
                    latestNewsPosts
                );

                return;
            }


            const filtered =
                latestNewsPosts.filter(post => {

                    const profile =
                        latestNewsProfiles[
                            post.user_id
                        ] || {};


                    const name =
                        (
                            profile.full_name ||
                            profile.username ||
                            ""
                        ).toLowerCase();


                    const content =
                        (
                            post.content ||
                            ""
                        ).toLowerCase();


                    return (
                        name.includes(search) ||
                        content.includes(search)
                    );

                });


            renderLatestNews(
                filtered
            );

        }
    );

}


// =========================================================
// LIKE
// =========================================================

async function latestNewsLike(postId) {

    if (!latestNewsCurrentUser) {

        alert(
            "Please login first."
        );

        return;
    }


    const {
        data: existingLike,
        error: checkError
    } =
        await latestNewsSupabase
            .from("likes")
            .select("id")
            .eq(
                "post_id",
                postId
            )
            .eq(
                "user_id",
                latestNewsCurrentUser.id
            )
            .maybeSingle();


    if (checkError) {

        console.error(
            "❌ Like check error:",
            checkError
        );

        return;
    }


    if (existingLike) {

        const {
            error
        } =
            await latestNewsSupabase
                .from("likes")
                .delete()
                .eq(
                    "id",
                    existingLike.id
                );


        if (error) {

            console.error(
                "❌ Unlike error:",
                error
            );

            return;
        }


        console.log(
            "👎 Post unliked"
        );

    } else {

        const {
            error
        } =
            await latestNewsSupabase
                .from("likes")
                .insert({

                    post_id: postId,

                    user_id:
                        latestNewsCurrentUser.id

                });


        if (error) {

            console.error(
                "❌ Like error:",
                error
            );

            return;
        }


        console.log(
            "👍 Post liked"
        );

    }


    await loadLatestNewsPosts();

}


// =========================================================
// COMMENT
// =========================================================

function latestNewsComment(postId) {

    alert(
        "💬 Comments are available from the Home feed."
    );

}


// =========================================================
// SHARE
// =========================================================

async function latestNewsShare(postId) {

    if (!latestNewsCurrentUser) {

        alert(
            "Please login first."
        );

        return;
    }


    const {
        data: existingShare,
        error: checkError
    } =
        await latestNewsSupabase
            .from("shares")
            .select("id")
            .eq(
                "post_id",
                postId
            )
            .eq(
                "user_id",
                latestNewsCurrentUser.id
            )
            .maybeSingle();


    if (checkError) {

        console.error(
            "❌ Share check error:",
            checkError
        );

        return;
    }


    if (existingShare) {

        alert(
            "You already shared this post."
        );

        return;
    }


    const {
        error
    } =
        await latestNewsSupabase
            .from("shares")
            .insert({

                post_id: postId,

                user_id:
                    latestNewsCurrentUser.id

            });


    if (error) {

        console.error(
            "❌ Share error:",
            error
        );


        alert(
            "Unable to share this post."
        );

        return;
    }


    console.log(
        "↗️ Post shared"
    );


    alert(
        "✅ Post shared successfully!"
    );

}


// =========================================================
// REFRESH
// =========================================================

if (refreshNewsButton) {

    refreshNewsButton.addEventListener(
        "click",
        async function () {

            await loadLatestNewsPosts();

        }
    );

}


// =========================================================
// DATE
// =========================================================

function formatLatestNewsDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    return date.toLocaleString(
        "en-US",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// =========================================================
// SECURITY HELPERS
// =========================================================

function escapeLatestNewsHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeLatestNewsAttribute(value) {

    return escapeLatestNewsHTML(
        value
    );

}


// =========================================================
// INITIALIZATION
// =========================================================

async function initLatestNews() {

    console.log(
        "🚀 Initializing Latest News..."
    );


    latestNewsCurrentUser =
        await getLatestNewsUser();


    if (!latestNewsCurrentUser) {

        console.warn(
            "⚠️ No logged-in user."
        );

    } else {

        console.log(
            "👤 Current user:",
            latestNewsCurrentUser.id
        );

    }


    await loadLatestNewsProfiles();

    await loadLatestNewsPosts();


    console.log(
        "🎉 LATEST NEWS READY"
    );

}


// =========================================================
// START
// =========================================================

initLatestNews();