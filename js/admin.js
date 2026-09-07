// =========================
// ADMIN.JS
// SOCIALWIKI
// =========================

console.log("admin.js is working");


// =========================
// SUPABASE
// =========================

const supabaseUrl =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const supabaseKey =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

const supabaseClient =
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );


// =========================
// ELEMENTS
// =========================

const adminMessage =
    document.getElementById(
        "adminMessage"
    );

const dashboard =
    document.getElementById(
        "dashboard"
    );

const adminName =
    document.getElementById(
        "adminName"
    );

const topAdminName =
    document.getElementById(
        "topAdminName"
    );

const topAdminRole =
    document.getElementById(
        "topAdminRole"
    );

const usersCount =
    document.getElementById(
        "usersCount"
    );

const reportsCount =
    document.getElementById(
        "reportsCount"
    );

const groupsCount =
    document.getElementById(
        "groupsCount"
    );

const usersList =
    document.getElementById(
        "usersList"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// =========================
// CHECK ADMIN ACCESS
// =========================

async function checkAdmin() {

    console.log(
        "Checking admin access..."
    );


    // =========================
    // GET USER
    // =========================

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


    // =========================
    // NOT LOGGED IN
    // =========================

    if (
        userError ||
        !user
    ) {

        adminMessage.textContent =
            "You must be logged in.";


        setTimeout(
            function () {

                window.location.href =
                    "auth.html";

            },
            1500
        );


        return;

    }


    // =========================
    // GET PROFILE
    // =========================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "username, full_name, role"
            )
            .eq(
                "id",
                user.id
            )
            .single();


    console.log(
        "Profile:",
        profile
    );


    // =========================
    // PROFILE ERROR
    // =========================

    if (profileError) {

        console.error(
            "Profile error:",
            profileError
        );


        adminMessage.textContent =
            "Could not load profile.";


        return;

    }


    // =========================
    // ACCESS RULE
    //
    // OWNER = YES
    // ADMIN = YES
    // MANAGER = NO
    // USER = NO
    // =========================

    if (
        profile.role !== "admin" &&
        profile.role !== "owner"
    ) {

        console.log(
            "Access denied:",
            profile.role
        );


        adminMessage.textContent =
            "Access denied. Admins and Owner only.";


        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            1500
        );


        return;

    }


    // =========================
    // ACCESS GRANTED
    // =========================

    console.log(
        "ADMIN ACCESS GRANTED"
    );


    adminMessage.style.display =
        "none";


    dashboard.style.display =
        "block";


    // =========================
    // DISPLAY NAME
    // =========================

    const displayName =
        profile.username ||
        profile.full_name ||
        (
            profile.role === "owner"
                ? "Owner"
                : "Admin"
        );


    adminName.textContent =
        (
            profile.role === "owner"
                ? "👑 Owner"
                : "🛡️ Admin"
        ) +
        " — " +
        displayName;


    if (topAdminName) {

        topAdminName.textContent =
            displayName;

    }


    if (topAdminRole) {

        topAdminRole.textContent =
            profile.role === "owner"
                ? "Owner"
                : "Admin";

    }


    // =========================
    // LOAD DATA
    // =========================

    await loadUsers();

    await loadGroups();

}


// =========================
// LOAD USERS
// =========================

async function loadUsers() {

    console.log(
        "Loading users..."
    );


    const {
        data: users,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, username, full_name, role"
            )
            .order(
                "username",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Users loading error:",
            error
        );


        usersList.textContent =
            "Could not load users.";


        return;

    }


    usersCount.textContent =
        users
            ? users.length
            : 0;


    displayUsers(
        users
    );

}


// =========================
// DISPLAY USERS
// =========================

function displayUsers(
    users
) {

    usersList.innerHTML =
        "";


    if (
        !users ||
        users.length === 0
    ) {

        usersList.textContent =
            "No users found.";


        return;

    }


    users.forEach(
        function (user) {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "user-card";


            const left =
                document.createElement(
                    "div"
                );


            left.className =
                "user-left";


            const avatar =
                document.createElement(
                    "div"
                );


            avatar.className =
                "user-avatar";


            avatar.textContent =
                "👤";


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "user-info";


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                user.username ||
                user.full_name ||
                "Unknown User";


            const id =
                document.createElement(
                    "span"
                );


            id.textContent =
                user.id;


            info.appendChild(
                name
            );


            info.appendChild(
                id
            );


            left.appendChild(
                avatar
            );


            left.appendChild(
                info
            );


            const role =
                document.createElement(
                    "span"
                );


            role.className =
                "role";


            role.textContent =
                user.role ||
                "user";


            card.appendChild(
                left
            );


            card.appendChild(
                role
            );


            usersList.appendChild(
                card
            );

        }
    );

}


// =========================
// LOAD GROUPS
// =========================

async function loadGroups() {

    console.log(
        "Checking groups..."
    );


    const {
        count,
        error
    } =
        await supabaseClient
            .from("groups")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    if (error) {

        console.log(
            "Groups table not available yet."
        );


        groupsCount.textContent =
            "0";


        return;

    }


    groupsCount.textContent =
        count || 0;

}


// =========================
// LOGOUT
// =========================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {


            console.log(
                "Logging out..."
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


                return;

            }


            window.location.href =
                "auth.html";

        }
    );

}


// =========================
// SIDEBAR BUTTONS
// =========================

const menuButtons =
    document.querySelectorAll(
        ".menu button"
    );


menuButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {


                menuButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                const section =
                    this.getAttribute(
                        "data-section"
                    );


                console.log(
                    "Selected section:",
                    section
                );


                if (
                    section ===
                    "overview"
                ) {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }


                if (
                    section ===
                    "users"
                ) {

                    document
                        .getElementById(
                            "usersList"
                        )
                        .scrollIntoView({
                            behavior:
                                "smooth"
                        });

                }


                if (
                    section ===
                    "reports"
                ) {

                    const sections =
                        document.querySelectorAll(
                            ".section"
                        );


                    if (
                        sections[1]
                    ) {

                        sections[1]
                            .scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                    }

                }


                if (
                    section ===
                    "groups"
                ) {

                    const sections =
                        document.querySelectorAll(
                            ".section"
                        );


                    if (
                        sections[2]
                    ) {

                        sections[2]
                            .scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                    }

                }


                if (
                    section ===
                    "moderation"
                ) {

                    const sections =
                        document.querySelectorAll(
                            ".section"
                        );


                    if (
                        sections[3]
                    ) {

                        sections[3]
                            .scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                    }

                }

            }
        );

    }
);


// =========================
// START
// =========================

checkAdmin();