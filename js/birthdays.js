// =========================================================
// SOCIALWIKI BIRTHDAYS
// REAL BIRTHDAY GREETINGS + NOTIFICATIONS
// =========================================================

console.log("🎂 birthdays.js started");


// =========================================================
// SUPABASE
// =========================================================

const BIRTHDAYS_SUPABASE_URL =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const BIRTHDAYS_SUPABASE_KEY =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";


let birthdaysSupabase = null;


if (window.supabase) {

    birthdaysSupabase =
        window.supabase.createClient(
            BIRTHDAYS_SUPABASE_URL,
            BIRTHDAYS_SUPABASE_KEY
        );

    console.log(
        "✅ Birthdays Supabase client ready"
    );

} else {

    console.error(
        "❌ Supabase library not found"
    );

}


// =========================================================
// GLOBAL DATA
// =========================================================

let birthdayCurrentUser = null;

let birthdayProfiles = [];


// =========================================================
// GET CURRENT USER
// =========================================================

async function getBirthdayCurrentUser() {

    if (!birthdaysSupabase) {
        return null;
    }


    const {
        data,
        error
    } =
        await birthdaysSupabase
            .auth
            .getUser();


    if (error) {

        console.error(
            "❌ Auth error:",
            error
        );

        return null;
    }


    return data?.user || null;

}


// =========================================================
// LOAD BIRTHDAYS
// =========================================================

async function loadBirthdays() {

    console.log(
        "🎂 Loading birthdays..."
    );


    birthdayCurrentUser =
        await getBirthdayCurrentUser();


    if (!birthdayCurrentUser) {

        showBirthdayError(
            "🔐 Please login to see birthdays."
        );

        return;
    }


    const {
        data,
        error
    } =
        await birthdaysSupabase

            .from("profiles")

            .select(`
                id,
                username,
                full_name,
                avatar_url,
                birth_date
            `)

            .not(
                "birth_date",
                "is",
                null
            );


    if (error) {

        console.error(
            "❌ Error loading profiles:",
            error
        );

        showBirthdayError(
            error.message
        );

        return;
    }


    birthdayProfiles =
        data || [];


    console.log(
        "🎂 Profiles with birthdays:",
        birthdayProfiles.length
    );


    renderBirthdays();

}


// =========================================================
// RENDER BIRTHDAYS
// =========================================================

function renderBirthdays() {

    const myBirthdayCard =
        document.getElementById(
            "myBirthdayCard"
        );


    const todayContainer =
        document.getElementById(
            "todayBirthdays"
        );


    const upcomingContainer =
        document.getElementById(
            "upcomingBirthdays"
        );


    if (
        !myBirthdayCard ||
        !todayContainer ||
        !upcomingContainer
    ) {

        console.error(
            "❌ Birthday containers not found"
        );

        return;
    }


    // =====================================================
    // FIND MY PROFILE
    // =====================================================

    const myProfile =
        birthdayProfiles.find(
            profile =>
                profile.id ===
                birthdayCurrentUser.id
        );


    // =====================================================
    // MY BIRTHDAY - ALWAYS FIRST
    // =====================================================

    if (myProfile) {

        myBirthdayCard.innerHTML =
            createMyBirthdayCard(
                myProfile
            );

    } else {

        myBirthdayCard.innerHTML = `

            <div class="empty-birthdays">

                🎂

                <h3>
                    Your birthday is not set yet.
                </h3>

                <p>
                    Add your birth date to your profile.
                </p>

            </div>

        `;

    }


    // =====================================================
    // TODAY'S BIRTHDAYS
    // =====================================================

    const todayBirthdays =
        birthdayProfiles.filter(
            profile => {

                if (
                    profile.id ===
                    birthdayCurrentUser.id
                ) {
                    return false;
                }

                return isBirthdayToday(
                    profile.birth_date
                );

            }
        );


    if (!todayBirthdays.length) {

        todayContainer.innerHTML = `

            <div class="empty-birthdays">

                🎈

                <h3>
                    No other birthdays today
                </h3>

                <p>
                    Check back later!
                </p>

            </div>

        `;

    } else {

        todayContainer.innerHTML =
            todayBirthdays
                .map(
                    createBirthdayCard
                )
                .join("");

    }


    // =====================================================
    // UPCOMING BIRTHDAYS
    // =====================================================

    const upcoming =
        birthdayProfiles

            .filter(profile => {

                if (
                    profile.id ===
                    birthdayCurrentUser.id
                ) {
                    return false;
                }

                return !isBirthdayToday(
                    profile.birth_date
                );

            })

            .sort(
                compareUpcomingBirthdays
            )

            .slice(0, 12);


    if (!upcoming.length) {

        upcomingContainer.innerHTML = `

            <div class="empty-birthdays">

                📅

                <h3>
                    No upcoming birthdays
                </h3>

                <p>
                    When your friends add their birthdays,
                    they will appear here.
                </p>

            </div>

        `;

    } else {

        upcomingContainer.innerHTML =
            upcoming
                .map(
                    createBirthdayCard
                )
                .join("");

    }

}


// =========================================================
// MY BIRTHDAY CARD
// =========================================================

function createMyBirthdayCard(
    profile
) {

    const name =
        profile.full_name ||
        profile.username ||
        "You";


    const birthday =
        formatBirthday(
            profile.birth_date
        );


    const avatar =
        createAvatar(
            profile.avatar_url,
            name
        );


    const isToday =
        isBirthdayToday(
            profile.birth_date
        );


    return `

        <div class="my-birthday-content">

            <div class="profile-info">

                ${avatar}

                <div>

                    <div class="profile-name">

                        ${escapeHtml(name)}

                    </div>


                    <div class="birthday-date">

                        🎂 ${birthday}

                    </div>

                </div>

            </div>


            <div class="birthday-badge">

                ${
                    isToday
                        ? "🎉 It's your birthday!"
                        : "📅 Your birthday"
                }

            </div>

        </div>

    `;

}


// =========================================================
// OTHER USER BIRTHDAY CARD
// =========================================================

function createBirthdayCard(
    profile
) {

    const name =
        profile.full_name ||
        profile.username ||
        "SocialWiki User";


    const username =
        profile.username
            ? "@" + profile.username
            : "";


    const birthday =
        formatBirthday(
            profile.birth_date
        );


    const avatar =
        createAvatar(
            profile.avatar_url,
            name
        );


    return `

        <article
            class="birthday-card"
        >

            <div class="birthday-card-top">

                ${avatar}

                <div>

                    <div class="birthday-card-name">

                        ${escapeHtml(name)}

                    </div>


                    <div class="birthday-card-username">

                        ${escapeHtml(username)}

                    </div>

                </div>

            </div>


            <div class="birthday-date">

                🎂 ${birthday}

            </div>


            <button
                type="button"
                class="greeting-button"
                onclick="sendBirthdayGreeting('${escapeAttribute(profile.id)}')"
            >

                🎉 Send Birthday Greeting

            </button>

        </article>

    `;

}


// =========================================================
// CHECK IF BIRTHDAY IS TODAY
// =========================================================

function isBirthdayToday(
    birthDate
) {

    if (!birthDate) {
        return false;
    }


    const date =
        new Date(
            birthDate + "T00:00:00"
        );


    const now =
        new Date();


    return (

        date.getMonth()
        ===
        now.getMonth()

        &&

        date.getDate()
        ===
        now.getDate()

    );

}


// =========================================================
// UPCOMING BIRTHDAY SORT
// =========================================================

function compareUpcomingBirthdays(
    a,
    b
) {

    const daysA =
        daysUntilBirthday(
            a.birth_date
        );


    const daysB =
        daysUntilBirthday(
            b.birth_date
        );


    return daysA - daysB;

}


// =========================================================
// DAYS UNTIL NEXT BIRTHDAY
// =========================================================

function daysUntilBirthday(
    birthDate
) {

    if (!birthDate) {
        return 9999;
    }


    const birth =
        new Date(
            birthDate + "T00:00:00"
        );


    const now =
        new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    let birthdayThisYear =
        new Date(
            now.getFullYear(),
            birth.getMonth(),
            birth.getDate()
        );


    if (
        birthdayThisYear < today
    ) {

        birthdayThisYear =
            new Date(
                now.getFullYear() + 1,
                birth.getMonth(),
                birth.getDate()
            );

    }


    return Math.ceil(
        (
            birthdayThisYear
            -
            today
        )
        /
        (1000 * 60 * 60 * 24)
    );

}


// =========================================================
// FORMAT BIRTHDAY
// =========================================================

function formatBirthday(
    birthDate
) {

    if (!birthDate) {

        return "Birthday not set";

    }


    const date =
        new Date(
            birthDate + "T00:00:00"
        );


    return date.toLocaleDateString(
        undefined,
        {
            month: "long",
            day: "numeric"
        }
    );

}


// =========================================================
// CREATE AVATAR
// =========================================================

function createAvatar(
    avatarUrl,
    name
) {

    if (avatarUrl) {

        return `

            <div class="avatar">

                <img
                    src="${escapeAttribute(avatarUrl)}"
                    alt="${escapeAttribute(name)}"
                    onerror="
                        this.parentElement.innerHTML='👤'
                    "
                >

            </div>

        `;

    }


    return `

        <div class="avatar">

            👤

        </div>

    `;

}


// =========================================================
// SEND BIRTHDAY GREETING
// REAL NOTIFICATION
// =========================================================

async function sendBirthdayGreeting(
    userId
) {

    console.log(
        "🎂 Birthday greeting clicked:",
        userId
    );


    // =====================================================
    // CHECK SUPABASE
    // =====================================================

    if (!birthdaysSupabase) {

        alert(
            "❌ Supabase is not available."
        );

        return;

    }


    // =====================================================
    // CHECK CURRENT USER
    // =====================================================

    if (!birthdayCurrentUser) {

        birthdayCurrentUser =
            await getBirthdayCurrentUser();

    }


    if (!birthdayCurrentUser) {

        alert(
            "🔐 Please login first."
        );

        return;

    }


    // =====================================================
    // PREVENT SENDING TO YOURSELF
    // =====================================================

    if (
        birthdayCurrentUser.id ===
        userId
    ) {

        alert(
            "ℹ️ You cannot send a birthday greeting to yourself."
        );

        return;

    }


    // =====================================================
    // FIND TARGET PROFILE
    // =====================================================

    const targetProfile =
        birthdayProfiles.find(
            profile =>
                profile.id ===
                userId
        );


    const targetName =
        targetProfile?.full_name ||
        targetProfile?.username ||
        "your friend";


    // =====================================================
    // FIND SENDER PROFILE
    // =====================================================

    const senderProfile =
        birthdayProfiles.find(
            profile =>
                profile.id ===
                birthdayCurrentUser.id
        );


    const senderName =
        senderProfile?.full_name ||
        senderProfile?.username ||
        "Someone";


    console.log(
        "🎂 Sending birthday greeting",
        {
            receiver_id: userId,
            sender_id: birthdayCurrentUser.id,
            receiver_name: targetName,
            sender_name: senderName
        }
    );


    // =====================================================
    // INSERT NOTIFICATION
    // =====================================================

    const {
        data,
        error
    } =
        await birthdaysSupabase
            .from("notifications")
            .insert({

                receiver_id:
                    userId,

                sender_id:
                    birthdayCurrentUser.id,

                type:
                    "birthday",

                message:
                    `🎂 ${senderName} sent you a birthday greeting!`,

                is_read:
                    false

            })
            .select()
            .single();


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        console.error(
            "❌ Birthday notification error:",
            error
        );


        alert(
            "❌ Could not send birthday greeting.\n\n" +
            error.message
        );

        return;

    }


    // =====================================================
    // SUCCESS
    // =====================================================

    console.log(
        "✅ Birthday notification created:",
        data
    );


    alert(
        "🎉 Birthday greeting sent to " +
        targetName +
        "!"
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

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

function escapeAttribute(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );

}


// =========================================================
// ERROR
// =========================================================

function showBirthdayError(
    message
) {

    const errorBox =
        document.getElementById(
            "birthdayError"
        );


    if (!errorBox) {
        return;
    }


    errorBox.style.display =
        "block";


    errorBox.textContent =
        "❌ " + message;

}


// =========================================================
// START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "🎂 Starting Birthdays..."
        );

        loadBirthdays();

    }
);


// =========================================================
// MAKE FUNCTION AVAILABLE TO HTML ONCLICK
// =========================================================

window.sendBirthdayGreeting =
    sendBirthdayGreeting;


console.log(
    "✅ Birthdays system + real greetings ready"
);