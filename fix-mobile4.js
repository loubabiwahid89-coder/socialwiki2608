const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
if (s.includes('MOBILE-DRAWERS-FIX')) { console.log('⚠️ ديجا تدار'); process.exit(); }

const css = `
<!-- MOBILE-DRAWERS-FIX -->
<style>
@media (max-width: 900px) {
    .left-sidebar, .right-sidebar {
        display: block !important;
        position: fixed !important;
        top: 0 !important;
        height: calc(100% - 54px) !important;
        width: 290px !important; max-width: 85vw !important;
        background: #fff !important;
        overflow-y: auto !important;
        z-index: 1100 !important;
        padding: 15px !important;
        margin: 0 !important;
        transition: left .3s ease, right .3s ease;
    }
    .left-sidebar { left: -320px !important; right: auto !important; box-shadow: 2px 0 12px rgba(0,0,0,.25); }
    .left-sidebar.mobile-open { left: 0 !important; }
    .right-sidebar { right: -320px !important; left: auto !important; box-shadow: -2px 0 12px rgba(0,0,0,.25); }
    .right-sidebar.mobile-open { right: 0 !important; }
    .left-overlay, .right-overlay, .sidebar-overlay { top: 0 !important; bottom: 54px !important; z-index: 1090 !important; }
}
</style>
`;
const i = s.indexOf('</head>');
if (i === -1) { console.log('❌ ما لقيتش </head>'); process.exit(); }
s = s.slice(0, i) + css + s.slice(i);
fs.writeFileSync('index.html', s);
console.log('✅ تزاد');
