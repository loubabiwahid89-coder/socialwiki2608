const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');
if (s.includes('MOVE-DRAWERS-TO-BODY')) { console.log('⚠️ ديجا تدار'); process.exit(); }

const block = `
<!-- MOVE-DRAWERS-TO-BODY -->
<script>
(function () {
    function moveDrawers() {
        if (!window.matchMedia('(max-width: 900px)').matches) return;
        ['.left-sidebar', '.right-sidebar'].forEach(function (sel) {
            var el = document.querySelector(sel);
            if (el && el.parentElement !== document.body) document.body.appendChild(el);
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', moveDrawers);
    else moveDrawers();
    window.addEventListener('load', moveDrawers);
})();
</script>
`;
const i = s.lastIndexOf('</body>');
if (i === -1) { console.log('❌ ما لقيتش </body>'); process.exit(); }
s = s.slice(0, i) + block + s.slice(i);
fs.writeFileSync('index.html', s);
console.log('✅ تزاد');
