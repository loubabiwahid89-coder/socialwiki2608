(function () {
    const SUPABASE_URL = "https://zcffrkvxmxvojkbmtufe.supabase.co";
    const SUPABASE_KEY = "sb_publishable_lgKbPrSB163cJn-jNWAQCw_QdtqBvrG";

    function loadSupabaseLib() {
        return new Promise((resolve) => {
            if (window.supabase && window.supabase.createClient) return resolve();
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            s.onload = resolve; s.onerror = resolve;
            document.head.appendChild(s);
        });
    }

    async function fillNavUser() {
        const nameEl = document.getElementById('navProfileName');
        const imgEl = document.getElementById('navProfileImg');
        if (!nameEl && !imgEl) return;
        // إلا الصفحة ديجا عمرات الاسم بوحدها، ما نلمسوهاش
        if (nameEl && nameEl.textContent.trim() !== 'User') return;

        try {
            await loadSupabaseLib();
            const client = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data: { user } } = await client.auth.getUser();
            if (!user) return;
            const { data: p } = await client.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single();
            const name = p?.username || p?.full_name || 'User';
            const avatar = p?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=1877f2&color=fff';
            if (nameEl) nameEl.textContent = name;
            if (imgEl) imgEl.src = avatar;
        } catch (e) { console.error('nav-user error:', e); }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fillNavUser);
    else fillNavUser();
})();