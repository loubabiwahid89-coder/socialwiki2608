(function () {
  var CATS = [['it','💻','IT & Software'],['marketing','📊','Marketing'],['design','🎨','Design'],['sales','🏢','Sales'],['education','🎓','Education'],['health','🏥','Health'],['engineering','⚙️','Engineering'],['construction','🏗️','Construction'],['finance','💰','Accounting & Finance'],['support','🎧','Customer Service'],['driver','🚚','Driver & Delivery'],['hospitality','🍽️','Restaurants, Hotels & Tourism'],['beauty','💇','Beauty & Care'],['legal','⚖️','Legal'],['agri','🌾','Agriculture'],['admin','🗂️','Admin & Secretary'],['writing','✍️','Translation & Writing'],['media','🎬','Video & Media'],['crafts','🔧','Maintenance & Crafts'],['other','📌','Other']];
  var cur = '';
  var box = document.querySelector('[data-i18n="job_categories"]').parentNode;
  function side() {
    box.innerHTML = '<h3 data-i18n="job_categories">💼 Job Categories</h3><a href="#" data-c="" style="' + (cur === '' ? 'font-weight:800;background:#e7f3ff;border-radius:8px;' : '') + '"><span class="emoji-icon">📋</span><span>All jobs</span></a>' + CATS.map(function (c) { return '<a href="#" data-c="' + c[0] + '" style="' + (cur === c[0] ? 'font-weight:800;background:#e7f3ff;border-radius:8px;' : '') + '"><span class="emoji-icon">' + c[1] + '</span><span>' + c[2] + '</span></a>'; }).join('');
    box.querySelectorAll('a').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); cur = a.getAttribute('data-c'); side(); window.renderJobs(allJobs); }; });
  }
  side();
  var orig = window.renderJobs;
  window.renderJobs = function (jobs) {
    var list = cur === '' ? jobs : jobs.filter(function (j) { return j.category === cur; });
    orig(list);
    var cards = document.getElementById('jobsList').children;
    list.forEach(function (j, i) { var c = CATS.filter(function (x) { return x[0] === j.category; })[0]; var t = cards[i] ? cards[i].querySelector('div') : null; if (c && t) { var b = document.createElement('div'); b.style.cssText = 'display:inline-block;background:#e7f3ff;color:#1877f2;border-radius:999px;padding:3px 12px;font-size:13px;font-weight:700;margin-bottom:8px;'; b.textContent = c[1] + ' ' + c[2]; cards[i].insertBefore(b, t); } });
  };
  var d = document.getElementById('jDesc');
  var sel = document.createElement('select');
  sel.id = 'jCat';
  sel.style.cssText = 'width:100%;padding:10px 12px;border:1px solid #ccd0d5;border-radius:8px;margin-bottom:10px;font-size:15px;box-sizing:border-box;background:#fff;';
  sel.innerHTML = '<option value="">Choose a specialty</option>' + CATS.map(function (c) { return '<option value="' + c[0] + '">' + c[1] + ' ' + c[2] + '</option>'; }).join('');
  d.parentNode.insertBefore(sel, d);
  window.loadJobs();
})();
