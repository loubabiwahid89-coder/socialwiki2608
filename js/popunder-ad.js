// =========================================================
// 💰 POPUNDER AD - يظهر مرة واحدة فقط لكل مستخدم
// يعمل على جميع الصفحات
// =========================================================

(function() {
    'use strict';

    // =========================================================
    // ⚙️ الإعدادات
    // =========================================================
    var AD_URL = "https://data527.click/e425f4e70b2f3179c0a9/1925225afb/?placementName=default";
    var STORAGE_KEY = 'popunder_shown_v1';

    // =========================================================
    // 🔍 التحقق: هل تم عرض الإعلان من قبل؟
    // =========================================================
    function hasBeenShown() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }

    // =========================================================
    // ✅ تعليم الإعلان كمُعروض
    // =========================================================
    function markAsShown() {
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {
            console.warn('⚠️ Could not save popunder state:', e);
        }
    }

    // =========================================================
    // 🚀 فتح الإعلان في نافذة خلفية
    // =========================================================
    function openPopunder() {
        try {
            var adWindow = window.open(AD_URL, '_blank', 'noopener,noreferrer');
            if (adWindow) {
                adWindow.blur();
                window.focus();
            }
            return true;
        } catch (e) {
            console.warn('⚠️ window.open failed:', e);
            return false;
        }
    }

    // =========================================================
    // 🎯 المحاولة الرئيسية (مع النقرة الأولى + احتياطي)
    // =========================================================
    function tryShowPopunder() {
        if (hasBeenShown()) {
            console.log('ℹ️ Popunder: already shown, skipping.');
            return;
        }

        // محاولة الفتح عند أول نقرة على الصفحة
        var handler = function() {
            if (hasBeenShown()) return;
            var success = openPopunder();
            if (success) {
                markAsShown();
                console.log('✅ Popunder opened on first click.');
            }
            document.removeEventListener('click', handler);
        };

        document.addEventListener('click', handler, { once: true });

        // احتياطي: محاولة الفتح بعد 5 ثواني حتى بدون نقرة
        setTimeout(function() {
            if (hasBeenShown()) return;
            var success = openPopunder();
            if (success) {
                markAsShown();
                console.log('✅ Popunder opened on timeout.');
            }
        }, 5000);
    }

    // =========================================================
    // 🎬 تشغيل عند تحميل الصفحة
    // =========================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryShowPopunder);
    } else {
        tryShowPopunder();
    }

    // =========================================================
    // 🛠️ دوال مساعدة (من Console)
    // =========================================================
    window.resetPopunder = function() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🔄 Popunder reset. Will show on next page load.');
    };

    window.showPopunderNow = function() {
        openPopunder();
        markAsShown();
        console.log('✅ Popunder opened manually.');
    };

})();