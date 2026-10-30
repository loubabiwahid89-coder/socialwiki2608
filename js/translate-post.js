window.translatePost = async function (btn) {
  const post = btn.closest('.feed-post');
  const box = post && post.querySelector('.feed-content');
  if (!box) { alert('No text to translate'); return; }
  if (box.dataset.orig) {
    box.textContent = box.dataset.orig;
    delete box.dataset.orig;
    btn.textContent = '🌐 ' + t('translate_post');
    return;
  }
  const lang = localStorage.getItem('socialwiki_lang') || 'en';
  const tl = ({ zh: 'zh-CN', fil: 'tl' })[lang] || lang;
  const original = box.textContent;
  btn.textContent = '⏳';
  try {
    let out = '';
    for (let i = 0; i < original.length; i += 1000) {
      const p = original.slice(i, i + 1000);
      const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + tl + '&dt=t&q=' + encodeURIComponent(p));
      const j = await r.json();
      out += j[0].map(function (x) { return x[0]; }).join('');
    }
    box.dataset.orig = original;
    box.textContent = out;
    btn.textContent = '↩️ ' + t('show_original');
  } catch (e) {
    console.error(e);
    btn.textContent = '🌐 ' + t('translate_post');
    alert('Translation failed');
  }
};
