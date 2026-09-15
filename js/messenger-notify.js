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
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // نغمة ding (نغمتان قصيرتان)
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);

        // النغمة الأولى: 880Hz (A5)
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime);

        // النغمة الثانية: 1174Hz (D6)
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1174, audioCtx.currentTime + 0.1);

        // التحكم بالصوت (fade out)
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        osc1.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.15);
        osc2.start(audioCtx.currentTime + 0.1);
        osc2.stop(audioCtx.currentTime + 0.4);

        console.log("🔊 Sound played (Web Audio API)");
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