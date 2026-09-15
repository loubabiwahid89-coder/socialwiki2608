// =========================================================
// MESSENGER GLOBAL BADGE
// Shows unread count on messenger link in every page
// =========================================================

(function() {
    if (!window.supabaseClient) {
        console.warn("messenger-badge: Supabase not ready");
        return;
    }

    const sb = window.supabaseClient;
    let badgeChannel = null;

    async function updateBadge() {
        try {
            const { data: { user } } = await sb.auth.getUser();
            if (!user) return;

            const { count, error } = await sb
                .from("chat_messages")
                .select("id", { count: "exact", head: true })
                .eq("receiver_id", user.id)
                .eq("is_read", false);

            if (error) {
                console.error("badge error:", error);
                return;
            }

            // اعرض العدد على كل رابط messenger
            const links = document.querySelectorAll(
                'a[href*="messenger.html"], a[href*="messenger"]'
            );

            links.forEach(link => {
                let badge = link.querySelector(".messenger-unread-badge");
                if (!badge) {
                    badge = document.createElement("span");
                    badge.className = "messenger-unread-badge";
                    link.style.position = "relative";
                    link.appendChild(badge);
                }

                if (count && count > 0) {
                    badge.textContent = count > 99 ? "99+" : count;
                    badge.style.display = "flex";
                } else {
                    badge.style.display = "none";
                }
            });

            console.log("🔴 Unread messages:", count || 0);
        } catch (error) {
            console.error("badge update error:", error);
        }
    }

    function setupRealtime() {
        if (badgeChannel) sb.removeChannel(badgeChannel);

        badgeChannel = sb
            .channel("global-badge-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "chat_messages" },
                () => {
                    updateBadge();
                }
            )
            .subscribe();
    }

    // شغّل عند تحميل الصفحة
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            updateBadge();
            setupRealtime();
        }, 1500);
    });

    // تحديث كل 30 ثانية
    setInterval(updateBadge, 30000);
})();