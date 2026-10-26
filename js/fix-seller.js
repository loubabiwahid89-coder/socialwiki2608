const fs = require('fs');
let s = fs.readFileSync('profile.html', 'utf8');

function rep(from, to, name) {
  if (!s.includes(from)) { console.log('❌ ما لقيتش: ' + name); return; }
  s = s.replace(from, to);
  console.log('✅ تبدل: ' + name);
}

rep('    </style>', `    .badge-seller {
        background-size:300% 300% !important;
        font-size:17px !important;
        padding:12px 28px !important;
        gap:10px !important;
        letter-spacing:.3px;
        animation: sellerFlow 4s ease infinite, sellerGlow 2s ease-in-out infinite;
    }
    .badge-seller > span:first-child { font-size:24px; }
    @keyframes sellerFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes sellerGlow { 0%,100%{box-shadow:0 0 8px rgba(16,185,129,.6)} 50%{box-shadow:0 0 22px rgba(6,182,212,1)} }
    </style>`, 'CSS');

rep("'gray-blue': 'linear-gradient(135deg,#8fa3b0,#6b7f8c)'", "'gray-blue': 'linear-gradient(135deg,#8fa3b0,#6b7f8c)',\n    'seller': 'linear-gradient(135deg,#10b981,#06b6d4,#8b5cf6,#10b981)'", 'BADGE_COLORS');
rep("'red-orange': '2px solid #ffd700' };", "'red-orange': '2px solid #ffd700', 'seller': '2px solid rgba(255,255,255,.8)' };", 'BADGE_BORDERS');

rep('<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:50px;font-weight:700;font-size:13px;color:white;background:${bg};border:${border};',
    '<span class="${b.badge_color === \'seller\' ? \'badge-seller\' : \'\'}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:50px;font-weight:700;font-size:13px;color:white;background:${bg};border:${border};', 'class');

fs.writeFileSync('profile.html', s);