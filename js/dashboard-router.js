// ==========================================
// SOCIALWIKI - ADMIN DASHBOARD ROUTER
// ==========================================

console.log("admin-router.js is working");


// ==========================================
// SUPABASE
// ==========================================

const supabaseUrl =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const supabaseKey =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

const supabaseClient =
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );


// ==========================================
// GET CURRENT USER
// ==========================================

async function getCurrentProfile() {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    console.log(
        "Current user:",
        user
    );


    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (userError || !user) {

        console.log(
            "No logged-in user"
        );

        window.location.href =
            "auth.html";

        return null;
    }


    // ==========================================
    // GET PROFILE
    // ==========================================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


    if (profileError) {

        console.error(
            "Profile error:",
            profileError
        );

        alert(
            "Could not load your profile."
        );

        return null;
    }


    console.log(
        "Profile:",
        profile
    );


    return {

        user: user,

        profile: profile

    };

}


// ==========================================
// CHECK ADMIN DASHBOARD ACCESS
// ==========================================

async function checkAdminAccess() {

    console.log(
        "Checking Admin Dashboard access..."
    );


    // ==========================================
    // ALLOWED ROLES
    // ==========================================

    const allowedRoles = [
        "admin"
    ];


    // ==========================================
    // GET USER + PROFILE
    // ==========================================

    const result =
        await getCurrentProfile();


    if (!result) {

        return false;

    }


    const role =
        result.profile.role;


    console.log(
        "Current role:",
        role
    );


    // ==========================================
    // OWNER HAS FULL ACCESS
    // ==========================================

    if (role === "owner") {

        console.log(
            "OWNER ACCESS GRANTED 👑"
        );

        return true;

    }


    // ==========================================
    // ADMIN ACCESS
    // ==========================================

    if (
        allowedRoles.includes(role)
    ) {

        console.log(
            "ADMIN ACCESS GRANTED 🛡️"
        );

        return true;

    }


    // ==========================================
    // ACCESS DENIED
    // ==========================================

    console.log(
        "ADMIN ACCESS DENIED ❌"
    );


    alert(
        "Access denied. Admins only."
    );


    window.location.href =
        "index.html";


    return false;

}


// ==========================================
// LOGOUT
// ==========================================

async function logoutUser() {

    console.log(
        "Logging out..."
    );


    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            "Logout failed."
        );

        return;

    }


    // ==========================================
    // REDIRECT
    // ==========================================

    window.location.href =
        "auth.html";

}


// ==========================================
// LOGOUT BUTTON
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutUser
            );

        }

    }
);


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Admin Dashboard started"
        );


        const access =
            await checkAdminAccess();


        if (access) {

            console.log(
                "Admin Dashboard ready ✅"
            );

        }

    }
);