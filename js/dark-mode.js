// =========================================================
// 🌙 DARK MODE
// =========================================================
(function() {
    'use strict';

    const KEY = 'socialwiki-dark-mode';

    // تفعيل فوري (قبل ما الصفحة تحمّل)
    if (localStorage.getItem(KEY) === 'true') {
        document.documentElement.classList.add('dark-mode');
    }

    window.toggleDarkMode = function() {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        localStorage.setItem(KEY, isDark);
        updateDarkModeButtons();
        console.log(isDark ? '🌙 Dark mode ON' : '☀️ Light mode ON');
    };

    function updateDarkModeButtons() {
        const isDark = document.documentElement.classList.contains('dark-mode');
        document.querySelectorAll('.dark-mode-btn').forEach(btn => {
            btn.textContent = isDark ? '☀️' : '🌙';
            btn.title = isDark ? 'Light Mode' : 'Dark Mode';
        });
    }

    // إضافة الزر تلقائياً بعد تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        const navRight = document.querySelector('.nav-right') || 
                         document.querySelector('.navbar .nav-right');
        
        if (navRight && !navRight.querySelector('.dark-mode-btn')) {
            const btn = document.createElement('button');
            btn.className = 'dark-mode-btn';
            btn.type = 'button';
            btn.textContent = document.documentElement.classList.contains('dark-mode') ? '☀️' : '🌙';
            btn.title = 'Toggle Dark Mode';
            btn.style.cssText = `
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                background: rgba(255,255,255,0.2);
                color: white;
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
                flex-shrink: 0;
            `;
            btn.onmouseover = () => btn.style.background = 'rgba(255,255,255,0.35)';
            btn.onmouseout = () => btn.style.background = 'rgba(255,255,255,0.2)';
            btn.onclick = () => window.toggleDarkMode();
            
            // ضيفه قبل زر اللغة أو قبل الـ Logout
            const beforeEl = navRight.querySelector('.language-selector') || 
                             navRight.querySelector('.logout-button');
            if (beforeEl) {
                navRight.insertBefore(btn, beforeEl);
            } else {
                navRight.appendChild(btn);
            }
        }
    });

})();