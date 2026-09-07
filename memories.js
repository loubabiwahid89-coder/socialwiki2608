// =========================================================
// MEMORIES.JS
// SOCIALWIKI MEMORIES SYSTEM
// =========================================================

console.log(
    "🕰️ memories.js system started"
);


// =========================================================
// LANGUAGE SYSTEM
// =========================================================

const memoriesTranslations = {

    // =====================================================
    // ENGLISH
    // =====================================================

    en: {

        home:
            "← Home",

        title:
            "🕰️ Memories",

        subtitle:
            "Your memories from SocialWiki",

        loading:
            "Loading memories...",

        login:
            "🔐 Please login to see your memories.",

        error:
            "❌ Unable to load memories.",

        noMemories:
            "No memories today",

        noMemoriesText:
            "Come back on another day to discover your memories.",

        yourMemory:
            "🕰️ Your memory",

        view:
            "👁️ View Original",

        share:
            "📤 Share Memory",

        year:
            "year",

        years:
            "years",

        ago:
            "ago",

        shareLogin:
            "🔐 Please login before sharing a memory.",

        memoryMissing:
            "❌ Memory could not be found.",

        memoryIdMissing:
            "❌ Memory ID is missing.",

        postIdMissing:
            "❌ Post ID is missing.",

        sharedSuccess:
            "✅ Memory shared successfully!",

        shareError:
            "❌ Could not share memory.",

        goHomeQuestion:
            "Do you want to go to Home and see your shared memory?"

    },


    // =====================================================
    // FRENCH
    // =====================================================

    fr: {

        home:
            "← Accueil",

        title:
            "🕰️ Souvenirs",

        subtitle:
            "Vos souvenirs sur SocialWiki",

        loading:
            "Chargement des souvenirs...",

        login:
            "🔐 Veuillez vous connecter pour voir vos souvenirs.",

        error:
            "❌ Impossible de charger les souvenirs.",

        noMemories:
            "Aucun souvenir aujourd'hui",

        noMemoriesText:
            "Revenez un autre jour pour découvrir vos souvenirs.",

        yourMemory:
            "🕰️ Votre souvenir",

        view:
            "👁️ Voir l'original",

        share:
            "📤 Partager le souvenir",

        year:
            "an",

        years:
            "ans",

        ago:
            "il y a",

        shareLogin:
            "🔐 Veuillez vous connecter avant de partager un souvenir.",

        memoryMissing:
            "❌ Le souvenir est introuvable.",

        memoryIdMissing:
            "❌ L'identifiant du souvenir est manquant.",

        postIdMissing:
            "❌ L'identifiant de la publication est manquant.",

        sharedSuccess:
            "✅ Souvenir partagé avec succès !",

        shareError:
            "❌ Impossible de partager le souvenir.",

        goHomeQuestion:
            "Voulez-vous aller à l'accueil pour voir votre souvenir partagé ?"

    },


    // =====================================================
    // ARABIC
    // =====================================================

    ar: {

        home:
            "← الرئيسية",

        title:
            "🕰️ الذكريات",

        subtitle:
            "ذكرياتك على SocialWiki",

        loading:
            "جارٍ تحميل الذكريات...",

        login:
            "🔐 يرجى تسجيل الدخول لرؤية ذكرياتك.",

        error:
            "❌ تعذر تحميل الذكريات.",

        noMemories:
            "لا توجد ذكريات اليوم",

        noMemoriesText:
            "عد في يوم آخر لاكتشاف ذكرياتك.",

        yourMemory:
            "🕰️ ذكرياتك",

        view:
            "👁️ عرض المنشور الأصلي",

        share:
            "📤 مشاركة الذكرى",

        year:
            "سنة",

        years:
            "سنوات",

        ago:
            "منذ",

        shareLogin:
            "🔐 يرجى تسجيل الدخول قبل مشاركة الذكرى.",

        memoryMissing:
            "❌ تعذر العثور على الذكرى.",

        memoryIdMissing:
            "❌ معرّف الذكرى غير موجود.",

        postIdMissing:
            "❌ معرّف المنشور غير موجود.",

        sharedSuccess:
            "✅ تمت مشاركة الذكرى بنجاح!",

        shareError:
            "❌ تعذر مشاركة الذكرى.",

        goHomeQuestion:
            "هل تريد الانتقال إلى الرئيسية لرؤية الذكرى التي شاركتها؟"

    }

};


// =========================================================
// APPLY LANGUAGE
// =========================================================

function applyMemoriesLanguage(lang) {

    const t =
        memoriesTranslations[lang] ||
        memoriesTranslations.en;


    // =====================================================
    // HTML LANGUAGE
    // =====================================================

    document.documentElement.lang =
        lang;


    // =====================================================
    // RTL / LTR
    // =====================================================

    document.documentElement.dir =
        lang === "ar"
            ? "rtl"
            : "ltr";


    // =====================================================
    // HOME
    // =====================================================

    const homeLink =
        document.getElementById(
            "homeLink"
        );


    if (homeLink) {

        homeLink.textContent =
            t.home;

    }


    // =====================================================
    // TITLE
    // =====================================================

    const memoriesTitle =
        document.getElementById(
            "memoriesTitle"
        );


    if (memoriesTitle) {

        memoriesTitle.textContent =
            t.title;

    }


    // =====================================================
    // SUBTITLE
    // =====================================================

    const memoriesSubtitle =
        document.getElementById(
            "memoriesSubtitle"
        );


    if (memoriesSubtitle) {

        memoriesSubtitle.textContent =
            t.subtitle;

    }


    // =====================================================
    // SAVE LANGUAGE
    // =====================================================

    localStorage.setItem(
        "socialwikiLanguage",
        lang
    );


    console.log(
        "🌍 Memories language applied:",
        lang
    );


    // =====================================================
    // RELOAD MEMORIES
    // =====================================================

    loadMemories();

}


// =========================================================
// GET CURRENT LANGUAGE
// =========================================================

function getMemoriesLanguage() {

    return (
        localStorage.getItem(
            "socialwikiLanguage"
        ) || "en"
    );

}


// =========================================================
// GET TRANSLATIONS
// =========================================================

function getMemoriesTranslations() {

    const lang =
        getMemoriesLanguage();


    return (
        memoriesTranslations[lang] ||
        memoriesTranslations.en
    );

}


// =========================================================
// SUPABASE
// =========================================================

const memoriesSupabaseUrl =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";


const memoriesSupabaseKey =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";


// =========================================================
// CREATE SUPABASE CLIENT
// =========================================================

let memoriesSupabase = null;


if (window.supabase) {

    memoriesSupabase =
        window.supabase.createClient(
            memoriesSupabaseUrl,
            memoriesSupabaseKey
        );


    console.log(
        "✅ Memories Supabase client ready"
    );

} else {

    console.error(
        "❌ Supabase library not found"
    );

}


// =========================================================
// GLOBAL DATA
// =========================================================

let memoriesList = [];

let memoriesCurrentUser = null;


// =========================================================
// GET CURRENT USER
// =========================================================

async function getMemoriesCurrentUser() {

    if (!memoriesSupabase) {

        return null;

    }


    const {
        data,
        error
    } =
        await memoriesSupabase
            .auth
            .getUser();


    if (error) {

        console.error(
            "❌ Error getting current user:",
            error
        );

        return null;

    }


    return data?.user || null;

}


// =========================================================
// LOAD MEMORIES
// =========================================================

async function loadMemories() {

    console.log(
        "🕰️ Loading memories..."
    );


    const t =
        getMemoriesTranslations();


    const container =
        document.getElementById(
            "memoriesContainer"
        );


    if (!container) {

        console.error(
            "❌ #memoriesContainer not found"
        );

        return;

    }


    // =====================================================
    // LOADING
    // =====================================================

    container.innerHTML = `

        <div class="loading">

            ${escapeMemoriesHtml(
                t.loading
            )}

        </div>

    `;


    // =====================================================
    // CURRENT USER
    // =====================================================

    memoriesCurrentUser =
        await getMemoriesCurrentUser();


    if (!memoriesCurrentUser) {

        console.warn(
            "⚠️ No authenticated user"
        );


        showMemoriesMessage(
            t.login
        );


        return;

    }


    // =====================================================
    // LOAD POSTS
    // =====================================================

    const {
        data,
        error
    } =
        await memoriesSupabase
            .from("posts")
            .select(`
                id,
                content,
                created_at,
                user_id
            `)
            .eq(
                "user_id",
                memoriesCurrentUser.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "❌ Error loading memories:",
            error
        );


        showMemoriesMessage(
            t.error
        );


        return;

    }


    // =====================================================
    // TODAY
    // =====================================================

    const today =
        new Date();


    const currentMonth =
        today.getMonth();


    const currentDay =
        today.getDate();


    const currentYear =
        today.getFullYear();


    // =====================================================
    // FILTER MEMORIES
    // =====================================================

    memoriesList =
        (data || []).filter(
            post => {

                const postDate =
                    new Date(
                        post.created_at
                    );


                return (

                    postDate.getMonth()
                    ===
                    currentMonth

                    &&

                    postDate.getDate()
                    ===
                    currentDay

                    &&

                    postDate.getFullYear()
                    <
                    currentYear

                );

            }
        );


    console.log(
        "🕰️ Memories found:",
        memoriesList.length
    );


    renderMemories();

}


// =========================================================
// RENDER MEMORIES
// =========================================================

function renderMemories() {

    const container =
        document.getElementById(
            "memoriesContainer"
        );


    if (!container) {

        console.error(
            "❌ #memoriesContainer not found"
        );

        return;

    }


    const t =
        getMemoriesTranslations();


    // =====================================================
    // NO MEMORIES
    // =====================================================

    if (!memoriesList.length) {

        container.innerHTML = `

            <div class="empty">

                🕰️

                <h2>

                    ${escapeMemoriesHtml(
                        t.noMemories
                    )}

                </h2>

                <p>

                    ${escapeMemoriesHtml(
                        t.noMemoriesText
                    )}

                </p>

            </div>

        `;


        return;

    }


    // =====================================================
    // RENDER
    // =====================================================

    container.innerHTML = "";


    memoriesList.forEach(
        memory => {

            const date =
                new Date(
                    memory.created_at
                );


            const currentYear =
                new Date().getFullYear();


            const yearsAgo =
                currentYear -
                date.getFullYear();


            const formattedDate =
                date.toLocaleDateString(
                    getMemoriesLocale(),
                    {
                        year:
                            "numeric",

                        month:
                            "long",

                        day:
                            "numeric"
                    }
                );


            const yearText =
                yearsAgo === 1
                    ? t.year
                    : t.years;


            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "memory-card";


            article.innerHTML = `

                <div
                    class="memory-date"
                >

                    📅

                    ${escapeMemoriesHtml(
                        formattedDate
                    )}

                    •

                    ${yearsAgo}

                    ${escapeMemoriesHtml(
                        yearText
                    )}

                    ${escapeMemoriesHtml(
                        t.ago
                    )}

                </div>


                <div
                    class="memory-title"
                >

                    ${escapeMemoriesHtml(
                        t.yourMemory
                    )}

                </div>


                <div
                    class="memory-content"
                >

                    ${escapeMemoriesHtml(
                        memory.content || ""
                    )}

                </div>


                <div
                    class="memory-actions"
                >

                    <button
                        class="memory-button"
                        type="button"
                        onclick="viewOriginalMemory('${memory.id}')"
                    >

                        ${escapeMemoriesHtml(
                            t.view
                        )}

                    </button>


                    <button
                        class="memory-button"
                        type="button"
                        onclick="shareMemory('${memory.id}')"
                    >

                        ${escapeMemoriesHtml(
                            t.share
                        )}

                    </button>

                </div>

            `;


            container.appendChild(
                article
            );

        }
    );

}


// =========================================================
// LOCALE
// =========================================================

function getMemoriesLocale() {

    const lang =
        getMemoriesLanguage();


    if (lang === "fr") {

        return "fr-FR";

    }


    if (lang === "ar") {

        return "ar-MA";

    }


    return "en-US";

}


// =========================================================
// VIEW ORIGINAL MEMORY
// =========================================================

function viewOriginalMemory(postId) {

    const t =
        getMemoriesTranslations();


    if (!postId) {

        alert(
            t.postIdMissing
        );

        return;

    }


    console.log(
        "👁️ View memory:",
        postId
    );


    const url =
        "./index.html?post=" +
        encodeURIComponent(
            postId
        );


    window.location.assign(
        url
    );

}


// =========================================================
// SHARE MEMORY
// =========================================================

async function shareMemory(postId) {

    const t =
        getMemoriesTranslations();


    if (!postId) {

        alert(
            t.memoryIdMissing
        );

        return;

    }


    if (!memoriesCurrentUser) {

        memoriesCurrentUser =
            await getMemoriesCurrentUser();

    }


    if (!memoriesCurrentUser) {

        alert(
            t.shareLogin
        );

        return;

    }


    const memory =
        memoriesList.find(
            item =>
                item.id === postId
        );


    if (!memory) {

        alert(
            t.memoryMissing
        );

        return;

    }


    const memoryDate =
        new Date(
            memory.created_at
        );


    const yearsAgo =
        new Date().getFullYear()
        -
        memoryDate.getFullYear();


    const originalContent =
        memory.content || "";


    const language =
        getMemoriesLanguage();


    let sharedContent;


    if (language === "fr") {

        sharedContent =
            `🕰️ Souvenir d'il y a ${yearsAgo} ${
                yearsAgo === 1
                    ? "an"
                    : "ans"
            } :\n\n${originalContent}`;

    }

    else if (language === "ar") {

        sharedContent =
            `🕰️ ذكرى منذ ${yearsAgo} ${
                yearsAgo === 1
                    ? "سنة"
                    : "سنوات"
            }:\n\n${originalContent}`;

    }

    else {

        sharedContent =
            `🕰️ Memory from ${yearsAgo} ${
                yearsAgo === 1
                    ? "year"
                    : "years"
            } ago:\n\n${originalContent}`;

    }


    // =====================================================
    // CREATE NEW POST
    // =====================================================

    const {
        data,
        error
    } =
        await memoriesSupabase
            .from("posts")
            .insert({

                user_id:
                    memoriesCurrentUser.id,

                content:
                    sharedContent

            })
            .select()
            .single();


    if (error) {

        console.error(
            "❌ Error sharing memory:",
            error
        );


        alert(
            t.shareError
            +
            "\n\n"
            +
            error.message
        );


        return;

    }


    console.log(
        "✅ Memory shared:",
        data
    );


    alert(
        t.sharedSuccess
    );


    // =====================================================
    // GO HOME
    // =====================================================

    const goHome =
        confirm(
            t.goHomeQuestion
        );


    if (goHome) {

        window.location.assign(
            "./index.html"
        );

    }

}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMemoriesMessage(message) {

    const container =
        document.getElementById(
            "memoriesContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="error">

            <h2>

                ${escapeMemoriesHtml(
                    message
                )}

            </h2>

        </div>

    `;

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeMemoriesHtml(value) {

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
// START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🕰️ Starting Memories..."
        );


        const languageSelect =
            document.getElementById(
                "languageSelect"
            );


        const savedLanguage =
            localStorage.getItem(
                "socialwikiLanguage"
            ) || "en";


        console.log(
            "🌍 Saved language:",
            savedLanguage
        );


        // =================================================
        // LANGUAGE SELECT
        // =================================================

        if (languageSelect) {

            console.log(
                "✅ Language selector found"
            );


            languageSelect.value =
                savedLanguage;


            languageSelect.addEventListener(
                "change",
                function () {

                    const selectedLanguage =
                        this.value;


                    console.log(
                        "🌍 Language changed to:",
                        selectedLanguage
                    );


                    applyMemoriesLanguage(
                        selectedLanguage
                    );

                }
            );

        }

        else {

            console.error(
                "❌ #languageSelect not found"
            );

        }


        // =================================================
        // APPLY SAVED LANGUAGE
        // =================================================

        applyMemoriesLanguage(
            savedLanguage
        );

    }
);