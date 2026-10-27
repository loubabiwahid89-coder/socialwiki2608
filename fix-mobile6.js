const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
if (s.includes('NEW-DRAWERS-V6')) { console.log('⚠️ ديجا تدار'); process.exit(); }

const block = `
<!-- NEW-DRAWERS-V6 -->
<script>
(function () {
    function closeAll() {
        ['mDrawerL', 'mDrawerR', 'mDrawerOv'].forEach(function (id) {
            var e = document.getElementById(id); if (e) e.remove();
        });
        document.body.style.overflow = '';
    }
    function openDrawer(side, selector) {
        var exists = document.getElementById(side === 'left' ? 'mDrawerL' : 'mDrawerR');
        closeAll();
        if (exists) return;
        var src = document.querySelector(selector);
        if (!src) return;

        document.querySelectorAll('.sidebar-overlay,.left-overlay,.right-overlay').forEach(function (o) {
            o.classList.remove('show'); o.style.display = 'none';
        });
        document.body.classList.remove('sidebar-open');

        var ov = document.createElement('div');
        ov.id = 'mDrawerOv';
        ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:99990;';
        ov.onclick = closeAll;

        var d = document.createElement('div');
        d.id = side === 'left' ? 'mDrawerL' : 'mDrawerR';
        d.style.cssText = 'position:fixed;top:0;bottom:0;' + (side === 'left' ? 'left:0;' : 'right:0;') +
            'width:300px;max-width:85vw;background:#fff;z-index:99991;overflow-y:auto;padding:14px;box-sizing:border-box;' +
            'box-shadow:0 0 20px rgba(0,0,0,.4);display:block;';
        d.innerHTML = '<button onclick="document.getElementById(\\'mDrawerOv\\').click()" ' +
            'style="float:' + (side === 'left' ? 'right' : 'left') + ';border:none;background:#eee;border-radius:50%;width:34px;height:34px;font-size:18px;cursor:pointer;">✕</button>' +
            '<div style="clear:both"></div>' + src.innerHTML;

        d.addEventListener('click', function (e) { if (e.target.closest('a')) setTimeout(closeAll, 50); });

        document.body.appendChild(ov);
        document.body.appendChild(d);
        document.body.style.overflow = 'hidden';
    }
    window.toggleMobileSidebar = function () { openDrawer('left', '.left-sidebar'); };
    window.toggleRightSidebar  = function () { openDrawer('right', '.right-sidebar'); };
})();
</script>
`;
const i = s.lastIndexOf('</body>');
if (i === -1) { console.log('❌ ما لقيتش </body>'); process.exit(); }
s = s.slice(0, i) + block + s.slice(i);
fs.writeFileSync('index.html', s);
console.log('✅ تزاد');
