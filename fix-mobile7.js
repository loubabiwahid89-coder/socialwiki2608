const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
if (s.includes('DRAWER-STYLE-V7')) { console.log('⚠️ ديجا تدار'); process.exit(); }

const css = `
<!-- DRAWER-STYLE-V7 -->
<style>
#mDrawerL a, #mDrawerR a {
    display: flex !important;
    align-items: center;
    gap: 12px;
    padding: 12px 10px !important;
    margin: 2px 0;
    border-radius: 10px;
    color: #1c1e21 !important;
    text-decoration: none !important;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
}
#mDrawerL a:active, #mDrawerR a:active { background: #e7f3ff; }
#mDrawerL a img, #mDrawerR a img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
#mDrawerL, #mDrawerR { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
#mDrawerL hr, #mDrawerR hr { border: none; border-top: 1px solid #e4e6eb; margin: 8px 0; }
#mDrawerL div, #mDrawerR div { max-width: 100%; }
</style>
`;
const i = s.indexOf('</head>');
if (i === -1) { console.log('❌ ما لقيتش </head>'); process.exit(); }
s = s.slice(0, i) + css + s.slice(i);
fs.writeFileSync('index.html', s);
console.log('✅ تزاد');
