// =========================================================
// SOCIALWIKI - TRANSLATIONS
// =========================================================

const translations = {
    ar: {
        "search_placeholder": "ابحث في SocialWiki",
        "home": "الرئيسية",
        "friends": "الأصدقاء",
        "marketplace": "السوق",
        "events": "الأحداث",
        "notifications": "الإشعارات",
        "profile": "الملف الشخصي",
        "logout": "تسجيل الخروج"
    },
    fr: {
        "search_placeholder": "Rechercher sur SocialWiki",
        "home": "Accueil",
        "friends": "Amis",
        "marketplace": "Marketplace",
        "events": "Événements",
        "notifications": "Notifications",
        "profile": "Profil",
        "logout": "Déconnexion"
    },
    en: {
        "search_placeholder": "Search SocialWiki",
        "home": "Home",
        "friends": "Friends",
        "marketplace": "Marketplace",
        "events": "Events",
        "notifications": "Notifications",
        "profile": "Profile",
        "logout": "Log Out"
    }
};

// =========================================================
// LANGUAGE MANAGEMENT FUNCTIONS
// =========================================================

function getCurrentLanguage() {
    return localStorage.getItem("socialwiki_lang") || "en";
}

function setLanguage(lang) {
    localStorage.setItem("socialwiki_lang", lang);
    document.documentElement.lang = lang;
    
    if (lang === "ar") {
        document.documentElement.dir = "rtl";
    } else {
        document.documentElement.dir = "ltr";
    }
    
    applyTranslations();
}

function applyTranslations() {
    const lang = getCurrentLanguage();
    const t = translations[lang];
    
    if (!t) return;
    
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.getAttribute("data-i18n-placeholder");
        if (t[key]) {
            element.placeholder = t[key];
        }
    });
    
    updateLanguageButton();
}

function toggleLanguageMenu() {
    const menu = document.getElementById("languageMenu");
    if (menu) {
        menu.classList.toggle("show");
        menu.classList.toggle("open");
    }
}

function changeLanguage(lang) {
    setLanguage(lang);
    toggleLanguageMenu();
}

function updateLanguageButton() {
    const langButton = document.getElementById("languageButton");
    if (langButton) {
        const langNames = {
            ar: "🌐 العربية",
            fr: "🌐 Français",
            en: "🌐 English"
        };
        langButton.textContent = langNames[getCurrentLanguage()] || "🌐";
    }
}

// تعريض الدوال للنطاق العام
window.setLanguage = setLanguage;
window.changeLanguage = changeLanguage;
window.toggleLanguageMenu = toggleLanguageMenu;
window.applyTranslations = applyTranslations;
window.getCurrentLanguage = getCurrentLanguage;

// تشغيل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    const lang = getCurrentLanguage();
    setLanguage(lang);
    applyTranslations();
});