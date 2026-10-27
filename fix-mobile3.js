const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
if (s.includes('MOBILE-LAYOUT-FIX')) { console.log('⚠️ ديجا تدار'); process.exit(); }

const css = `
<!-- MOBILE-LAYOUT-FIX -->
<style>
@media (max-width: 768px) {
    html, body { overflow-x: hidden !important; max-width: 100vw !important; }
    body { padding-bottom: 62px !important; }

    .navbar { padding: 0 8px !important; gap: 6px !important; width: 100% !important; }
    .navbar-search { display: none !important; }
    .nav-profile #navProfileName { display: none !important; }
    .nav-right { gap: 4px !important; }
    .logo span { font-size: 16px !important; }
    .logout-button { padding: 5px 8px !important; font-size: 11px !important; }

    /* الأيقونات الخمسة كشريط سفلي */
    .nav-icons {
        position: fixed !important; bottom: 0; left: 0; right: 0; height: 54px;
        background: #fff !important; display: flex !important;
        justify-content: space-around; align-items: center;
        margin: 0 !important; padding: 0 !important; z-index: 1001;
        box-shadow: 0 -2px 8px rgba(0,0,0,.15);
    }
    .nav-icons li { list-style: none; }
    .nav-icons a { font-size: 24px !important; color: #333 !important; padding: 8px 12px !important; }

    /* المنشورات بالعرض كامل */
    .main-container { display: block !important; width: 100% !important; max-width: 100vw !important; padding: 8px !important; margin: 0 !important; }
    .content { width: 100% !important; max-width: 100% !important; margin: 0 !important; }
}
</style>
`;
const i = s.indexOf('</head>');
if (i === -1) { console.log('❌ ما لقيتش </head>'); process.exit(); }
s = s.slice(0, i) + css + s.slice(i);
fs.writeFileSync('index.html', s);
console.log('✅ تزاد');
