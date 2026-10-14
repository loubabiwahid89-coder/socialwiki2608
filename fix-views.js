const fs = require('fs');
const path = 'C:/xampp/htdocs/socialwiki-wiki2608/index.html';

let content = fs.readFileSync(path, 'utf8');
let fixes = 0;

console.log('📖 File loaded, size:', content.length, 'bytes');
console.log('');

// ============================================================
// FIX 1: تعديل select('*') → select('*, post_views(count)')
// ============================================================
const search1 = `.from('posts').select('*').order('created_at', { ascending: false })`;
const replace1 = `.from('posts').select(\`*, post_views(count)\`).order('created_at', { ascending: false })`;

if (content.includes(search1)) {
    content = content.replace(search1, replace1);
    fixes++;
    console.log('✅ Fix 1: select updated (post_views included)');
} else {
    console.log('⚠️ Fix 1: pattern NOT found');
    console.log('   Searching for:', search1);
}

// ============================================================
// FIX 2: عرض عدد المشاهدات تحت الفيديو
// ============================================================
const search2 = `if (post.video_url) {
    const videoId = \`video_\${post.id}\`;
    contentHTML += \`<video id="\${videoId}" src="\${post.video_url}" controls playsinline preload="metadata" class="feed-image" style="width:100%;max-height:500px;border-radius:8px;margin-bottom:10px;background:#000;" 
        onloadedmetadata="checkVideoDuration(this, '\${post.id}')"
        onplay="startVideoImpression('\${post.id}', this)"></video>\`;
}`;

const replace2 = `if (post.video_url) {
                    const videoId = \`video_\${post.id}\`;
                    const viewsCount = post.post_views?.[0]?.count || 0;
                    contentHTML += \`
                        <video id="\${videoId}" src="\${post.video_url}" controls playsinline preload="metadata" 
                            class="feed-image" style="width:100%;max-height:500px;border-radius:8px;margin-bottom:10px;background:#000;" 
                            onloadedmetadata="checkVideoDuration(this, '\${post.id}')"
                            onplay="startVideoImpression('\${post.id}', this)"></video>
                        <div style="font-size: 13px; color: #65676b; padding: 5px 10px; display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
                            👁️ <strong>\${viewsCount.toLocaleString()}</strong> views
                        </div>
                    \`;
                }`;

if (content.includes(search2)) {
    content = content.replace(search2, replace2);
    fixes++;
    console.log('✅ Fix 2: views display added under video');
} else {
    console.log('⚠️ Fix 2: pattern NOT found');
}

// ============================================================
// SAVE
// ============================================================
if (fixes > 0) {
    fs.writeFileSync(path, content, 'utf8');
    console.log('');
    console.log('💾 File saved!');
    console.log('🎉 Total fixes:', fixes + '/2');
} else {
    console.log('');
    console.log('❌ No fixes applied. File NOT modified.');
}
