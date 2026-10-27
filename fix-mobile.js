const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');

if (s.includes('toggleRightSidebar')) { console.log('⚠️ ديجا تدار'); process.exit(); }

function rep(from, to, name) {
  if (!s.includes(from)) { console.log('❌ ما لقيتش: ' + name); return; }
  s = s.replace(from, to);
  console.log('✅ تبدل: ' + name);
}

rep('<button id="hamburgerBtn" onclick="toggleMobileSidebar()" class="hamburger-btn">☰</button>',
    '<button id="hamburgerBtn" onclick="toggleMobileSidebar()" class="hamburger-btn">☰</button>\n            <button id="rightSidebarBtn" onclick="toggleRightSidebar()" class="hamburger-btn">👥</button>',
    'الزر');

rep('/* ========== MOBILE SIDEBAR ========== */', `/* ===== RIGHT SIDEBAR MOBILE ===== */
@media (max-width: 900px) {
    .right-sidebar {
        display: block !important;
        position: fixed !important;
        top: 56px; right: -300px; left: auto;
        width: 290px; max-width: 85vw;
        height: calc(100vh - 56px);
        background: white; z-index: 999;
        transition: right .3s ease;
        overflow-y: auto; padding: 15px;
        box-shadow: -2px 0 10px rgba(0,0,0,.15);
    }
    .right-sidebar.mobile-open { right: 0 !important; }
    .right-overlay { display:none; position:fixed; inset:0; top:56px; background:rgba(0,0,0,.5); z-index:998; }
    .right-overlay.show { display:block; }
    #rightSidebarBtn { display:block !important; background:rgba(255,255,255,.2); border:none; color:#fff; font-size:20px; padding:8px 12px; border-radius:8px; cursor:pointer; }
}
@media (min-width: 901px) {
    #rightSidebarBtn { display:none !important; }
}
/* ========== MOBILE SIDEBAR ========== */`, 'CSS');

rep('window.toggleMobileSidebar = function() {', `window.toggleRightSidebar = function() {
    const sb = document.querySelector('.right-sidebar');
    if (!sb) return;
    sb.classList.toggle('mobile-open');
    let ov = document.querySelector('.right-overlay');
    if (!ov) {
        ov = document.createElement('div');
        ov.className = 'right-overlay';
        ov.onclick = window.toggleRightSidebar;
        document.body.appendChild(ov);
    }
    ov.classList.toggle('show');
};

window.toggleMobileSidebar = function() {`, 'JS');

fs.writeFileSync('index.html', s);
