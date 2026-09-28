// =========================================================
// 🔍 DEVICE FINGERPRINT - بصمة الجهاز
// =========================================================
// ينشئ بصمة فريدة للجهاز لمنع تكرار المشاهدات
// =========================================================

(function() {
    'use strict';

    // =========================================================
    // 🎨 Canvas Fingerprint
    // =========================================================
    function getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;

            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('SocialWiki🔒', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('SocialWiki🔒', 4, 17);

            return canvas.toDataURL();
        } catch (e) {
            return 'canvas-error';
        }
    }

    // =========================================================
    // 🖥️ WebGL Fingerprint
    // =========================================================
    function getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return 'no-webgl';

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
            }
            return 'no-debug-info';
        } catch (e) {
            return 'webgl-error';
        }
    }

    // =========================================================
    // 🎯 توليد بصمة فريدة
    // =========================================================
    function generateFingerprint() {
        const components = [
            navigator.userAgent || '',
            navigator.language || '',
            navigator.languages ? navigator.languages.join(',') : '',
            screen.width + 'x' + screen.height,
            screen.colorDepth || '',
            new Date().getTimezoneOffset(),
            Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            navigator.platform || '',
            navigator.hardwareConcurrency || '',
            navigator.maxTouchPoints || '',
            navigator.deviceMemory || '',
            getCanvasFingerprint(),
            getWebGLFingerprint()
        ];

        const raw = components.join('|||');
        return hashString(raw);
    }

    // =========================================================
    // 🔢 Hash Function (FNV-1a)
    // =========================================================
    function hashString(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = (hash * 16777619) >>> 0;
        }
        return hash.toString(36) + '-' + str.length.toString(36);
    }

    // =========================================================
    // 💾 الحصول على بصمة الجهاز
    // =========================================================
    function getDeviceFingerprint() {
        const STORAGE_KEY = 'socialwiki_device_fp';
        
        let fingerprint = localStorage.getItem(STORAGE_KEY);
        
        if (!fingerprint) {
            fingerprint = generateFingerprint();
            localStorage.setItem(STORAGE_KEY, fingerprint);
            console.log('🔍 New device fingerprint created:', fingerprint);
        }
        
        return fingerprint;
    }

    // =========================================================
    // 🌐 متاح عالمياً
    // =========================================================
    window.getDeviceFingerprint = getDeviceFingerprint;
    window.__deviceFingerprint = getDeviceFingerprint();

    console.log('✅ Device Fingerprint module loaded');
    console.log('🔍 Your fingerprint:', window.__deviceFingerprint);
})();