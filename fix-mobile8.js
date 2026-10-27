const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
if (s.includes('NAVBAR-FIT-V8')) { console.log('⚠️ ديجا تدار'); process.exit(); }

const css = `
<!-- NAVBAR-FIT-V8 -->
<style>
@media (max-width: 768px) {
    .navbar { gap: 2px !important; padding: 0 6px !important; }
    .nav-left { gap: 4px !important; flex: 0 0 auto; }
    .logo span { display: none !important; }
    .logo-img { width: 34px !important; height: 34px !important; }
    .nav-profile { display: none !important; }
    .nav-right { gap: 4px !important; margin-left: auto; flex: 0 0 auto; }
    .nav-right .notification-btn { width: 36px !important; height: 36px !important; font-size: 18px !important; }
    .language-btn { width: 36px !important; height: 36px !important; font-size: 18px !important; }
    .logout-button { padding: 6px 8px !important; font-size: 11px !important; white-space: nowrap; }
    .language-menu { position: fixed !important; top: 60px !important; right: 8px !important; left: auto !important; max-width: 80vw; z-index: 100000 !important; }
}
</style>
`;
const i = s.indexOf('</head>');
if (i === -1) { console.log('❌ ما لقيتش </head>'); process.exit(); }
s = s.slice(0, i) + css + s.slice(i);
fs.writeFileSync('index.html', s);
console.log('✅ تزاد');
