// ==========================================
// SOCIALWIKI ROLE ROUTER
// ==========================================

// ضع بيانات مشروع Supabase الخاصة بك هنا
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==========================================
// GET CURRENT USER + ROLE
// ==========================================

async function getCurrentProfile() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {

        window.location.href = "login.html";

        return null;
    }


    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("id, username, role")
            .eq("id", user.id)
            .single();


    if (profileError || !profile) {

        console.error(
            "Profile error:",
            profileError
        );

        alert("Profile not found.");

        return null;
    }


    return {
        user: user,
        profile: profile,
        role: profile.role
    };
}


// ==========================================
// CHECK PAGE ACCESS
// ==========================================

async function checkRoleAccess(allowedRoles) {

    const account = await getCurrentProfile();

    if (!account) {
        return;
    }


    const role = account.role;


    // OWNER CAN ACCESS EVERYTHING
    if (role === "owner") {

        console.log(
            "Owner access granted 👑"
        );

        showDashboard(account);

        return;
    }


    // CHECK NORMAL ROLES
    if (!allowedRoles.includes(role)) {

        console.warn(
            "Access denied for role:",
            role
        );

        alert(
            "Access denied. You do not have permission to access this dashboard."
        );


        // Return user to normal profile
        window.location.href = "index.html";

        return;
    }


    console.log(
        "Access granted:",
        role
    );


    showDashboard(account);
}


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard(account) {

    const message =
        document.getElementById(
            "managerMessage"
        );


    const dashboard =
        document.getElementById(
            "dashboard"
        );


    if (message) {

        message.style.display =
            "none";
    }


    if (dashboard) {

        dashboard.style.display =
            "block";
    }


    // Manager name
    const managerName =
        document.getElementById(
            "managerName"
        );


    const topManagerName =
        document.getElementById(
            "topManagerName"
        );


    const username =
        account.profile.username ||
        "User";


    if (managerName) {

        managerName.textContent =
            "Welcome " +
            username +
            " 👑";
    }


    if (topManagerName) {

        topManagerName.textContent =
            username;
    }
}


// ==========================================
// LOGOUT
// ==========================================

async function logoutUser() {

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


    localStorage.removeItem(
        "socialwiki_language"
    );


    window.location.href =
        "login.html";
}


// ==========================================
// LOGOUT BUTTON
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

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