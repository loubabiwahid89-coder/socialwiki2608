// =========================================================
// MONETAG ADS LOADER — Minimal (1 ad only)
// =========================================================
(function() {
    'use strict';

    // =========================================================
    // 👑 OWNER MODE — Skip ads for owner
    // =========================================================
    if (localStorage.getItem('isOwner') === '1' || 
        window.location.search.includes('noAds=1')) {
        console.log('👑 Owner mode - ads skipped');
        return;
    }

    const host = window.location.hostname;
    if (host !== 'wikidogo.com' && host !== 'www.wikidogo.com') {
        console.log('⏭️ Monetag skipped (non-production)');
        return;
    }

    if (window.__monetagLoaded) return;
    window.__monetagLoaded = true;

    console.log('📢 Monetag: initializing (minimal mode — 1 ad)...');

    function injectWithZone(config) {
        const script = document.createElement('script');
        script.dataset.zone = config.zone;
        script.src = config.src;
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.onload = () => console.log(`✅ ${config.name} loaded`);
        script.onerror = () => console.warn(`⚠️ ${config.name} failed`);
        (config.target === 'body' ? document.body : document.head).appendChild(script);
    }

    // ==========================================================
    // ✅ Vignette Banner — إعلان واحد فقط (الأقل إزعاجاً)
    // ==========================================================
    injectWithZone({
        name: 'Vignette Banner',
        src: 'https://nap5k.com/tag.min.js',
        zone: '11922559',
        target: 'body'
    });

    // ==========================================================
    // ⛔ معطّل لتقليل الإزعاج:
    // - Multitag (يحتوي Popunder + Push)
    // - Push Notifications
    // - In-Page Push
    // - OnClick Popunder
    // ==========================================================

    // Direct Link (للاستخدام في الأزرار فقط — اختياري)
    window.MONETAG_DIRECT_LINK = null;

    console.log('✅ Monetag: minimal mode — 1 ad loaded (Vignette only)');
})();