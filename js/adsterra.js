// =========================================================
// ADSTERRA ADS LOADER — Full Integration
// Native Banner + Social Bar + Banner 300x250
// =========================================================
  (function() {
    'use strict';

    // 👑 Owner Mode
    if (localStorage.getItem('isOwner') === '1' || 
        window.location.search.includes('noAds=1')) {
        console.log('👑 Owner mode - ads skipped');
        return;
    }

    const host = window.location.hostname;
    if (host !== 'wikidoogo.com' && host !== 'www.wikidoogo.com') {
        console.log('⏭️ Adsterra skipped (non-production)');
        return;
    }

    if (window.__adsterraLoaded) return;
    window.__adsterraLoaded = true;

    console.log('📢 Adsterra: initializing...');

    // ==========================================================
    // 1. SOCIAL BAR (تلقائي أسفل الصفحة)
    // ==========================================================
    const socialBarScript = document.createElement('script');
    socialBarScript.src = 'https://pl31577800.profitableratecpmnetwork.com/2a/23/9a/2a239aea4f9131ca3cae4f3c8386c16b.js';
    socialBarScript.async = true;
    socialBarScript.setAttribute('data-cfasync', 'false');
    document.body.appendChild(socialBarScript);
    console.log('✅ Social Bar injected');

    // ==========================================================
    // 2. NATIVE BANNER (مكاني — يحتاج <div class="adsterra-native">)
    // ==========================================================
    function loadNativeBanner(container) {
        if (!container || container.dataset.loaded) return;
        container.dataset.loaded = '1';

        // script tag
        const s1 = document.createElement('script');
        s1.async = true;
        s1.setAttribute('data-cfasync', 'false');
        s1.src = 'https://pl31577799.profitableratecpmnetwork.com/1af43291506a9f729cf5b2e0c450d957/invoke.js';
        container.appendChild(s1);

        // div tag
        const d = document.createElement('div');
        d.id = 'container-1af43291506a9f729cf5b2e0c450d957';
        container.appendChild(d);

        console.log('✅ Native Banner loaded in container');
    }

    // ==========================================================
    // 3. BANNER 300x250 (مكاني — يحتاج <div class="adsterra-300x250">)
    // ==========================================================
    function loadBanner300x250(container) {
        if (!container || container.dataset.loaded) return;
        container.dataset.loaded = '1';

        // atOptions
        const opts = document.createElement('script');
        opts.type = 'text/javascript';
        opts.text = `
            atOptions = {
                'key' : '60a410b9eda0bf94f4d6581db1cc321f',
                'format' : 'iframe',
                'height' : 250,
                'width' : 300,
                'params' : {}
            };
        `;
        container.appendChild(opts);

        // invoke
        const inv = document.createElement('script');
        inv.src = 'https://www.highrevenueformat.com/60a410b9eda0bf94f4d6581db1cc321f/invoke.js';
        inv.async = true;
        inv.setAttribute('data-cfasync', 'false');
        container.appendChild(inv);

        console.log('✅ Banner 300x250 loaded in container');
    }

    // ==========================================================
    // 4. AUTO-INJECT في كل الأماكن المحددة
    // ==========================================================
    function injectAllAds() {
        // Native Banners
        document.querySelectorAll('.adsterra-native').forEach(loadNativeBanner);

        // Banner 300x250
        document.querySelectorAll('.adsterra-300x250').forEach(loadBanner300x250);
    }

    // شغّل عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectAllAds);
    } else {
        injectAllAds();
    }

    // راقب الـ DOM لو في عناصر جديدة اتضافت (زي المنشورات)
    const observer = new MutationObserver(() => {
        injectAllAds();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('✅ Adsterra: ready & watching DOM');
})();