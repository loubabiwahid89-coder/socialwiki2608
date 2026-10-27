const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
if (s.includes('MOBILE-SIDEBARS-SAFE')) { console.log('⚠️ ديجا تدار'); process.exit(); }

const block = `
<!-- MOBILE-SIDEBARS-SAFE -->
<script>
(function () {
    function overlay(cls, handler) {
        let ov = document.querySelector('.' + cls);
        if (!ov) {
            ov = document.createElement('div');
            ov.className = cls;
            ov.style.cssText = 'display:none;position:fixed;inset:0;top:56px;background:rgba(0,0,0,.5);z-index:998;';
            ov.onclick = handler;
            document.body.appendChild(ov);
        }
        return ov;
    }
    window.toggleRightSidebar = function () {
        const sb = document.querySelector('.right-sidebar');
        if (!sb) return;
        const open = sb.classList.toggle('mobile-open');
        overlay('right-overlay', window.toggleRightSidebar).style.display = open ? 'block' : 'none';
    };
    window.toggleMobileSidebar = function () {
        const sb = document.querySelector('.left-sidebar');
        if (!sb) return;
        const open = sb.classList.toggle('mobile-open');
        document.body.classList.toggle('sidebar-open', open);
        overlay('left-overlay', window.toggleMobileSidebar).style.display = open ? 'block' : 'none';
    };
})();
</script>
`;
const i = s.lastIndexOf('</body>');
if (i === -1) { console.log('❌ ما لقيتش </body>'); process.exit(); }
s = s.slice(0, i) + block + s.slice(i);
fs.writeFileSync('index.html', s);
console.log('✅ تزاد');
