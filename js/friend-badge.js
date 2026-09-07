console.log("👥 Friend badge system starting...");

document.addEventListener("DOMContentLoaded", async function () {


console.log("👥 Checking friend request badge...");

// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://hvslktufqrgdgrgxmvcm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

if (!window.supabase) {

    console.error(
        "❌ Supabase library not found for friend badge"
    );

    return;
}

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// BADGE ELEMENT
// =====================================================

const badge =
    document.getElementById(
        "friendRequestBadge"
    );

if (!badge) {

    console.warn(
        "⚠️ friendRequestBadge not found"
    );

    return;
}


// =====================================================
// CURRENT USER
// =====================================================

const {
    data,
    error
} =
    await supabaseClient.auth.getUser();


if (error) {

    console.error(
        "❌ Could not get current user:",
        error
    );

    return;
}


const user =
    data?.user;


if (!user) {

    console.log(
        "ℹ️ No logged-in user"
    );

    badge.hidden = true;

    return;
}


// =====================================================
// COUNT PENDING FRIEND REQUESTS
// =====================================================

const {
    count,
    error: requestError
} =
    await supabaseClient
        .from("friend_requests")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "receiver_id",
            user.id
        )
        .eq(
            "status",
            "pending"
        );


if (requestError) {

    console.error(
        "❌ Friend request badge error:",
        requestError
    );

    return;
}


console.log(
    "👥 Pending friend requests:",
    count
);


// =====================================================
// UPDATE BADGE
// =====================================================

if (count && count > 0) {

    badge.textContent =
        count > 99
            ? "99+"
            : String(count);

    badge.hidden = false;

    console.log(
        "🔴 Friend badge:",
        count
    );

} else {

    badge.hidden = true;

    console.log(
        "⚪ No pending friend requests"
    );
}


});
