// =========================================================
// MESSENGER GLOBAL NOTIFICATIONS
// Sound + Browser notification on new message
// =========================================================

(function() {
    if (!window.supabaseClient) return;

    const sb = window.supabaseClient;
    let notifyChannel = null;

    // صوت تنبيه (base64 صغير)
    const NOTIFY_SOUND = "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA..."; 
    // ↑ ضع رابط صوت حقيقي أو base64

    function playSound() {
        try {
            const audio = new Audio("/sounds/notification.mp3");
            audio.volume = 0.6;
            audio.play().catch(e => console.warn("sound blocked:", e));
        } catch (e) {
            console.warn("sound error:", e);
        }
    }

    async function requestBrowserPermission() {
        if (!("Notification" in window)) return false;
        if (Notification.permission === "granted") return true;
        if (Notification.permission === "denied") return false;
        const result = await Notification.requestPermission();
        return result === "granted";
    }

    async function showBrowserNotification(title, body) {
        if (!("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        try {
            new Notification(title, {
                body: body,
                icon: "/images/iconprofile.png"
            });
        } catch (e) {
            console.warn("notification error:", e);
        }
    }

    async function setupNotify() {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;

        await requestBrowserPermission();

        if (notifyChannel) sb.removeChannel(notifyChannel);

        notifyChannel = sb
            .channel("global-notify")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `receiver_id=eq.${user.id}`
                },
                async (payload) => {
                    const msg = payload.new;
                    if (!msg) return;

                    // احصل على اسم المرسل
                    const { data: profile } = await sb
                        .from("profiles")
                        .select("username, full_name")
                        .eq("id", msg.sender_id)
                        .maybeSingle();

                    const senderName = profile?.full_name ||
                                       profile?.username ||
                                       "Someone";

                    // صوت
                    playSound();

                    // إشعار المتصفح
                    showBrowserNotification(
                        `💬 ${senderName}`,
                        msg.message || "New message"
                    );
                }
            )
            .subscribe();
    }

    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupNotify, 2000);
    });
})();