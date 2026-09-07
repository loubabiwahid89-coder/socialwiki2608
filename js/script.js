
// =========================================================
// SOCIALWIKI 2608
// SCRIPT.JS
// SUPABASE + SESSION + LOGOUT + SEARCH + NAVBAR PROFILE


console.log("🚨 SCRIPT.JS START 🚨");

// SUPABASE CONFIG

const SUPABASE_URL =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

// =========================================================
// CREATE SUPABASE CLIENT
// =========================================================

console.log(
    "Supabase library:",
    window.supabase
);

if (!window.supabase) {

    console.error(
        "❌ Supabase library NOT loaded"
    );

} else {

    if (!window.supabaseClient) {

        window.supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log(
            "✅ Supabase client created"
        );

    } else {

        console.log(
            "ℹ️ Supabase client already exists"
        );

    }

}


// =========================================================
// CHECK SESSION
// =========================================================

async function checkSession() {

    console.log(
        "🔐 Checking session..."
    );

    if (!window.supabaseClient) {

        console.error(
            "❌ Supabase client missing"
        );

        return;
    }

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .auth
                .getSession();

        if (error) {

            console.error(
                "❌ Session error:",
                error
            );

            return;
        }

        console.log(
            "Session:",
            data?.session
        );

        if (data?.session) {

            console.log(
                "✅ User is logged in:",
                data.session.user.email
            );

        } else {

            console.log(
                "ℹ️ No active session"
            );

        }

    } catch (error) {

        console.error(
            "❌ Session exception:",
            error
        );

    }

}


// =========================================================
// LOGOUT SYSTEM
// =========================================================

function setupLogout() {

    console.log(
        "🚪 Setting up Logout..."
    );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    console.log(
        "🚪 Logout button:",
        logoutButton
    );

    if (!logoutButton) {

        console.warn(
            "⚠️ logoutButton NOT FOUND"
        );

        return;
    }

    console.log(
        "✅ Logout button found"
    );

    logoutButton.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "🚪🚪 LOGOUT CLICKED"
            );

            if (!window.supabaseClient) {

                console.error(
                    "❌ Supabase client missing"
                );

                return;
            }

            console.log(
                "🔐 Signing out..."
            );

            try {

                const {
                    error
                } =
                    await window.supabaseClient
                        .auth
                        .signOut();

                if (error) {

                    console.error(
                        "❌ SIGN OUT ERROR:",
                        error
                    );

                    return;
                }

                console.log(
                    "✅ SIGN OUT SUCCESS"
                );

                // Clear selected profile
                sessionStorage.removeItem(
                    "viewProfileUserId"
                );

                window.location.href =
                    "auth.html";

            } catch (error) {

                console.error(
                    "❌ LOGOUT EXCEPTION:",
                    error
                );

            }

        }
    );

}


// =========================================================
// AUTH STATE LISTENER
// =========================================================

function setupAuthListener() {

    if (!window.supabaseClient) {

        console.error(
            "❌ Cannot setup auth listener"
        );

        return;
    }

    window.supabaseClient.auth.onAuthStateChange(
        function (event, session) {

            console.log(
                "🔐 Auth state changed:",
                event
            );

            if (session) {

                console.log(
                    "👤 Active user:",
                    session.user.email
                );

                // Refresh navbar when login/session changes
                loadNavbarProfile();

            } else {

                console.log(
                    "ℹ️ No active user"
                );

            }

        }
    );

}


// =========================================================
// SEARCH SYSTEM
// =========================================================

console.log(
    "🔎 SEARCH SYSTEM START"
);


function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const searchResults =
        document.getElementById(
            "searchResults"
        );


    if (!searchInput || !searchResults) {

        console.warn(
            "⚠️ Search elements not found"
        );

        return;
    }


    console.log(
        "✅ Search system ready"
    );


    let searchTimer = null;


    // =====================================================
    // SEARCH INPUT
    // =====================================================

    searchInput.addEventListener(
        "input",
        function () {

            const query =
                searchInput.value.trim();


            clearTimeout(
                searchTimer
            );


            if (!query) {

                searchResults.innerHTML =
                    "";

                searchResults.hidden =
                    true;

                return;
            }


            searchResults.hidden =
                false;


            searchResults.innerHTML =
                `
                <div class="search-no-results">
                    🔎 Searching...
                </div>
                `;


            searchTimer =
                setTimeout(
                    function () {

                        searchUsers(
                            query
                        );

                    },
                    300
                );

        }
    );


    // =====================================================
    // CLOSE SEARCH RESULTS
    // =====================================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                !event.target.closest(
                    ".search-container"
                )
            ) {

                searchResults.hidden =
                    true;

            }

        }
    );


    // =====================================================
    // SEARCH USERS
    // =====================================================

    async function searchUsers(query) {

        if (!window.supabaseClient) {

            console.error(
                "❌ Supabase client missing for search"
            );

            return;
        }


        console.log(
            "🔎 Searching users:",
            query
        );


        const searchText =
            `%${query}%`;


        try {

            const {
                data: profiles,
                error
            } =
                await window.supabaseClient
                    .from("profiles")
                    .select(
                        "id, username, full_name, avatar_url"
                    )
                    .or(
                        `username.ilike.${searchText},full_name.ilike.${searchText}`
                    )
                    .limit(10);


            if (error) {

                console.error(
                    "❌ Search error:",
                    error
                );


                searchResults.innerHTML =
                    `
                    <div class="search-no-results">
                        ❌ Search error
                    </div>
                    `;

                return;
            }


            console.log(
                "✅ Search results:",
                profiles
            );


            // =================================================
            // NO RESULTS
            // =================================================

            if (
                !profiles ||
                profiles.length === 0
            ) {

                searchResults.innerHTML =
                    `
                    <div class="search-no-results">
                        No users found.
                    </div>
                    `;

                return;
            }


            // =================================================
            // DISPLAY RESULTS
            // =================================================

            searchResults.innerHTML =
                "";


            profiles.forEach(
                function (profile) {

                    const result =
                        document.createElement(
                            "div"
                        );

                    result.className =
                        "search-result-item";


                    // =================================================
                    // AVATAR
                    // =================================================

                    const image =
                        document.createElement(
                            "img"
                        );

                    image.src =
                        profile.avatar_url ||
                        "images/iconprofile.png";

                    image.alt =
                        profile.username ||
                        profile.full_name ||
                        "User";


                    image.onerror =
                        function () {

                            this.src =
                                "images/iconprofile.png";

                        };


                    // =================================================
                    // INFO
                    // =================================================

                    const info =
                        document.createElement(
                            "div"
                        );

                    info.className =
                        "search-result-info";


                    const name =
                        document.createElement(
                            "div"
                        );

                    name.className =
                        "search-result-name";

                    name.textContent =
                        profile.full_name ||
                        profile.username ||
                        "User";


                    const usernameElement =
                        document.createElement(
                            "div"
                        );

                    usernameElement.className =
                        "search-result-username";

                    usernameElement.textContent =
                        profile.username
                            ? "@" + profile.username
                            : "";


                    info.appendChild(
                        name
                    );

                    info.appendChild(
                        usernameElement
                    );


                    result.appendChild(
                        image
                    );

                    result.appendChild(
                        info
                    );


                    // =================================================
                    // OPEN PROFILE
                    // =================================================

                    result.addEventListener(
                        "click",
                        function () {

                            console.log(
                                "👤 Opening profile:",
                                profile.id
                            );


                            sessionStorage.setItem(
                                "viewProfileUserId",
                                profile.id
                            );


                            window.location.href =
                                "profile.html";

                        }
                    );


                    searchResults.appendChild(
                        result
                    );

                }
            );

        } catch (error) {

            console.error(
                "❌ Search exception:",
                error
            );

            searchResults.innerHTML =
                `
                <div class="search-no-results">
                    ❌ Search error
                </div>
                `;

        }

    }

}


// =========================================================
// NAVBAR PROFILE
// =========================================================

async function loadNavbarProfile() {

    console.log(
        "🖼️ Loading navbar profile..."
    );


    const navAvatar =
        document.getElementById(
            "navProfileAvatar"
        );


    const navProfileName =
        document.getElementById(
            "navProfileName"
        );


    const profileNavLink =
        document.getElementById(
            "profileNavLink"
        );


    // =====================================================
    // CHECK AVATAR ELEMENT
    // =====================================================

    if (!navAvatar) {

        console.warn(
            "⚠️ navProfileAvatar not found"
        );

        return;
    }


    // =====================================================
    // CHECK SUPABASE
    // =====================================================

    if (!window.supabaseClient) {

        console.error(
            "❌ Supabase client not available"
        );

        return;
    }


    try {

        // =================================================
        // GET SESSION
        // =================================================

        const {
            data: sessionData,
            error: sessionError
        } =
            await window.supabaseClient
                .auth
                .getSession();


        if (sessionError) {

            console.error(
                "❌ Navbar session error:",
                sessionError
            );

            return;
        }


        const session =
            sessionData?.session;


        if (!session) {

            console.log(
                "ℹ️ No logged-in user for navbar"
            );

            return;
        }


        // =================================================
        // CURRENT USER
        // =================================================

        const user =
            session.user;


        console.log(
            "👤 Navbar current user:",
            user.id
        );


        // =================================================
        // GET PROFILE
        // =================================================

        const {
            data: profile,
            error: profileError
        } =
            await window.supabaseClient
                .from("profiles")
                .select(
                    "username, full_name, avatar_url"
                )
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();


        if (profileError) {

            console.error(
                "❌ Navbar profile error:",
                profileError
            );

            return;
        }


        console.log(
            "👤 Navbar profile:",
            profile
        );


        // =================================================
        // DISPLAY NAME
        // =================================================

        if (navProfileName) {

            navProfileName.textContent =
                profile?.username ||
                profile?.full_name ||
                user.email?.split("@")[0] ||
                "User";

        }


        // =================================================
        // DISPLAY AVATAR
        // =================================================

        if (
            profile &&
            profile.avatar_url
        ) {

            console.log(
                "🖼️ Profile avatar:",
                profile.avatar_url
            );


            navAvatar.src =
                profile.avatar_url +
                "?t=" +
                Date.now();

        } else {

            navAvatar.src =
                "images/iconprofile.png";

        }


        // =================================================
        // AVATAR FALLBACK
        // =================================================

        navAvatar.onerror =
            function () {

                console.warn(
                    "⚠️ Navbar avatar failed"
                );

                this.src =
                    "images/iconprofile.png";

            };


        // =================================================
        // PROFILE LINK
        // =================================================

        if (profileNavLink) {

            profileNavLink.title =
                "My Profile";

        }


        console.log(
            "✅ Navbar profile displayed"
        );


    } catch (error) {

        console.error(
            "❌ Navbar profile exception:",
            error
        );

    }

}


// =========================================================
// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "📄 DOM READY"
        );

        // =====================================================
        // SESSION
        // =====================================================

        checkSession();


        // =====================================================
        // LOGOUT
        // =====================================================

        setupLogout();


        // =====================================================
        // AUTH LISTENER
        // =====================================================

        setupAuthListener();


        // =====================================================
        // SEARCH
        // =====================================================

        setupSearch();


        // =====================================================
        // NAVBAR PROFILE
        // =====================================================

        loadNavbarProfile();


        console.log(
            "✅ SCRIPT.JS INITIALIZED"
        );

    }
);


// =========================================================
// END
// =========================================================

console.log(
    "🔎 SEARCH SYSTEM END"
);

console.log(
    "🚨 SCRIPT.JS END 🚨"
);