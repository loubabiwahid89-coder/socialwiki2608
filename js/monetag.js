// =========================================================
// MONETAG ADS LOADER — Non-intrusive only
// =========================================================
(function() {
    'use strict';

    // 👑 OWNER MODE
    if (localStorage.getItem('isOwner') === '1' || 
        window.location.search.includes('noAds=1')) {
        console.log('👑 Owner mode - ads skipped');
        return;
    }

    const host = window.location.hostname;
    if (host !== 'wikidoogo.com' && host !== 'www.wikidoogo.com') {
        console.log('⏭️ Monetag skipped (non-production)');
        return;
    }

    if (window.__monetagLoaded) return;
    window.__monetagLoaded = true;

    console.log('📢 Monetag: loading non-intrusive ads only...');

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
    // ✅ Vignette Banner — إعلان بين الصفحات (غير مزعج)
    // ==========================================================
    injectWithZone({
        name: 'Vignette Banner',
        src: 'https://nap5k.com/tag.min.js',
        zone: '11922559',
        target: 'body'
    });

    // ==========================================================
    // ⛔ معطّل (إعلانات مزعجة):
    // - Multitag (يحتوي Popunder + Push)
    // - Push Notifications
    // - In-Page Push
    // - OnClick Popunder
    // ==========================================================

    // Direct Link — للاستخدام في الأزرار فقط (اختياري)
    window.MONETAG_DIRECT_LINK = 'https://omg10.com/4/11922560';

    console.log('✅ Monetag: only Vignette Banner loaded');
})();