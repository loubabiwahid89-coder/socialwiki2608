// =========================================================
// 🏅 BADGES SYSTEM + 🌍 FLAGS
// =========================================================

// دالة تحويل كود الدولة إلى emoji flag (احتياطية)
function countryFlagEmoji(code) {
    if (!code) return '';
    return code.toUpperCase().replace(/./g, c =>
        String.fromCodePoint(127397 + c.charCodeAt())
    );
}

// دالة إنشاء صورة الراية (الأفضل)
function flagImg(code, size = 20) {
    if (!code) return '';
    return `<img src="https://flagcdn.com/w${size}/${code.toLowerCase()}.png"
                 srcset="https://flagcdn.com/w${size * 2}/${code.toLowerCase()}.png 2x"
                 style="width:${size}px;height:${Math.round(size * 0.7)}px;
                        border-radius:2px;margin-left:6px;vertical-align:middle;
                        box-shadow:0 1px 2px rgba(0,0,0,0.15);"
                 alt="${code}">`;
}

// 🌍 قائمة دول كاملة
const COUNTRIES = {
    MA: 'Morocco', PH: 'Philippines', EG: 'Egypt', SA: 'Saudi Arabia',
    US: 'United States', FR: 'France', DZ: 'Algeria', TN: 'Tunisia',
    AE: 'UAE', JO: 'Jordan', IQ: 'Iraq', KW: 'Kuwait', QA: 'Qatar',
    TR: 'Turkey', IN: 'India', ID: 'Indonesia', MY: 'Malaysia',
    PK: 'Pakistan', NG: 'Nigeria', GB: 'United Kingdom', DE: 'Germany',
    ES: 'Spain', IT: 'Italy', CA: 'Canada', BR: 'Brazil', MX: 'Mexico',
    RU: 'Russia', CN: 'China', JP: 'Japan', KR: 'South Korea',
    AU: 'Australia', NL: 'Netherlands', BE: 'Belgium', SE: 'Sweden',
    NO: 'Norway', DK: 'Denmark', FI: 'Finland', PL: 'Poland',
    PT: 'Portugal', GR: 'Greece', IE: 'Ireland', CH: 'Switzerland',
    AT: 'Austria', CZ: 'Czechia', RO: 'Romania', HU: 'Hungary',
    UA: 'Ukraine', LB: 'Lebanon', SY: 'Syria', YE: 'Yemen',
    OM: 'Oman', BH: 'Bahrain', SD: 'Sudan', LY: 'Libya',
    MR: 'Mauritania', SO: 'Somalia', KE: 'Kenya', ET: 'Ethiopia',
    ZA: 'South Africa', GH: 'Ghana', SN: 'Senegal', CI: 'Ivory Coast',

};

// قائمة الشارات الجاهزة
const BADGE_PRESETS = {
    verified:        { label: 'Verified Account',           icon: '✅', color: 'blue' },
    vip:             { label: 'VIP',                         icon: '💎', color: 'yellow' },
    early_member:    { label: 'Early Member',                icon: '🌱', color: 'green' },
    early_founder:   { label: 'Early Founder',               icon: '🎖️', color: 'orange' },
    top_contributor: { label: 'Top Contributor',             icon: '⭐', color: 'gray-blue' },
    diamond_member:  { label: 'Diamond Member',              icon: '💎', color: 'purple' },
    founder:         { label: 'Founder of SocialWiki',       icon: '🏆', color: 'orange' },
    owner:           { label: 'Owner of SocialWiki',         icon: '👑', color: 'red' },
    king_morocco:    { label: 'King of Morocco',             icon: '👑', color: 'red-orange', country: 'MA' },
    ph_ambassador:   { label: 'Philippines Ambassador',      icon: '🌟', color: 'red-gold',   country: 'PH' },
    ma_ambassador:   { label: 'Morocco Ambassador',          icon: '🌟', color: 'red-gold',   country: 'MA' },
    ph_vietnam:   { label: 'VIETNAM Ambassador',      icon: '🌟', color: 'red-gold',   country: 'VI' },
    first_ph:        { label: 'First Member from Philippines', icon: '🥇', color: 'blue-gold', country: 'PH' },
       first_ma:        { label: 'First Member from Morocco',   icon: '🥇', color: 'blue-gold', country: 'MA' },

    // ═══════════════════════════════════════════════
    // 👑 KINGS - كل الدول
    // ═══════════════════════════════════════════════
    king_philippines:   { label: 'King of Philippines',      icon: '👑', color: 'red-orange', country: 'PH' },
    king_india:         { label: 'King of India',            icon: '👑', color: 'red-orange', country: 'IN' },
    king_egypt:         { label: 'King of Egypt',            icon: '👑', color: 'red-orange', country: 'EG' },
    king_saudi:         { label: 'King of Saudi Arabia',     icon: '👑', color: 'red-orange', country: 'SA' },
    king_algeria:       { label: 'King of Algeria',          icon: '👑', color: 'red-orange', country: 'DZ' },
    king_tunisia:       { label: 'King of Tunisia',          icon: '👑', color: 'red-orange', country: 'TN' },
    king_uae:           { label: 'King of UAE',              icon: '👑', color: 'red-orange', country: 'AE' },
    king_jordan:        { label: 'King of Jordan',           icon: '👑', color: 'red-orange', country: 'JO' },
    king_usa:           { label: 'King of USA',              icon: '👑', color: 'red-orange', country: 'US' },
    king_france:        { label: 'King of France',           icon: '👑', color: 'red-orange', country: 'FR' },
    king_uk:            { label: 'King of UK',               icon: '👑', color: 'red-orange', country: 'GB' },
    king_spain:         { label: 'King of Spain',            icon: '👑', color: 'red-orange', country: 'ES' },
    king_germany:       { label: 'King of Germany',          icon: '👑', color: 'red-orange', country: 'DE' },
    king_italy:         { label: 'King of Italy',            icon: '👑', color: 'red-orange', country: 'IT' },
    king_turkey:        { label: 'King of Turkey',           icon: '👑', color: 'red-orange', country: 'TR' },
    king_pakistan:      { label: 'King of Pakistan',         icon: '👑', color: 'red-orange', country: 'PK' },
    king_indonesia:     { label: 'King of Indonesia',        icon: '👑', color: 'red-orange', country: 'ID' },
    king_malaysia:      { label: 'King of Malaysia',         icon: '👑', color: 'red-orange', country: 'MY' },
    king_nigeria:       { label: 'King of Nigeria',          icon: '👑', color: 'red-orange', country: 'NG' },
    king_south_africa:  { label: 'King of South Africa',     icon: '👑', color: 'red-orange', country: 'ZA' },
        king_bangladesh:    { label: 'King of Bangladesh',       icon: '👑', color: 'red-orange', country: 'BD' },
        king_vietnam:    { label: 'King of Vietnam',       icon: '👑', color: 'red-orange', country: 'VI' },

    // ═══════════════════════════════════════════════
    // 👸 QUEENS - كل الدول
    // ═══════════════════════════════════════════════
    queen_morocco:      { label: 'Queen of Morocco',         icon: '👸', color: 'purple', country: 'MA' },
    queen_philippines:  { label: 'Queen of Philippines',     icon: '👸', color: 'purple', country: 'PH' },
    queen_india:        { label: 'Queen of India',           icon: '👸', color: 'purple', country: 'IN' },
    queen_egypt:        { label: 'Queen of Egypt',           icon: '👸', color: 'purple', country: 'EG' },
    queen_saudi:        { label: 'Queen of Saudi Arabia',    icon: '👸', color: 'purple', country: 'SA' },
    queen_algeria:      { label: 'Queen of Algeria',         icon: '👸', color: 'purple', country: 'DZ' },
    queen_tunisia:      { label: 'Queen of Tunisia',         icon: '👸', color: 'purple', country: 'TN' },
    queen_uae:          { label: 'Queen of UAE',             icon: '👸', color: 'purple', country: 'AE' },
    queen_jordan:       { label: 'Queen of Jordan',          icon: '👸', color: 'purple', country: 'JO' },
    queen_usa:          { label: 'Queen of USA',             icon: '👸', color: 'purple', country: 'US' },
    queen_france:       { label: 'Queen of France',          icon: '👸', color: 'purple', country: 'FR' },
    queen_uk:           { label: 'Queen of UK',              icon: '👸', color: 'purple', country: 'GB' },
    queen_spain:        { label: 'Queen of Spain',           icon: '👸', color: 'purple', country: 'ES' },
    queen_germany:      { label: 'Queen of Germany',         icon: '👸', color: 'purple', country: 'DE' },
    queen_italy:        { label: 'Queen of Italy',           icon: '👸', color: 'purple', country: 'IT' },
    queen_turkey:       { label: 'Queen of Turkey',          icon: '👸', color: 'purple', country: 'TR' },
    queen_pakistan:     { label: 'Queen of Pakistan',        icon: '👸', color: 'purple', country: 'PK' },
    queen_indonesia:    { label: 'Queen of Indonesia',       icon: '👸', color: 'purple', country: 'ID' },
    queen_malaysia:     { label: 'Queen of Malaysia',        icon: '👸', color: 'purple', country: 'MY' },
    queen_nigeria:      { label: 'Queen of Nigeria',         icon: '👸', color: 'purple', country: 'NG' },
    queen_south_africa: { label: 'Queen of South Africa',    icon: '👸', color: 'purple', country: 'ZA' },

    // ═══════════════════════════════════════════════
    // 🌟 AMBASSADORS - كل الدول
    // ═══════════════════════════════════════════════
    amb_philippines:    { label: 'Philippines Ambassador',   icon: '🌟', color: 'red-gold', country: 'PH' },
    amb_india:          { label: 'India Ambassador',         icon: '🌟', color: 'red-gold', country: 'IN' },
    amb_egypt:          { label: 'Egypt Ambassador',         icon: '🌟', color: 'red-gold', country: 'EG' },
    amb_saudi:          { label: 'Saudi Arabia Ambassador',  icon: '🌟', color: 'red-gold', country: 'SA' },
    amb_algeria:        { label: 'Algeria Ambassador',       icon: '🌟', color: 'red-gold', country: 'DZ' },
    amb_tunisia:        { label: 'Tunisia Ambassador',       icon: '🌟', color: 'red-gold', country: 'TN' },
    amb_uae:            { label: 'UAE Ambassador',           icon: '🌟', color: 'red-gold', country: 'AE' },
    amb_jordan:         { label: 'Jordan Ambassador',        icon: '🌟', color: 'red-gold', country: 'JO' },
    amb_usa:            { label: 'USA Ambassador',           icon: '🌟', color: 'red-gold', country: 'US' },
    amb_france:         { label: 'France Ambassador',        icon: '🌟', color: 'red-gold', country: 'FR' },
    amb_uk:             { label: 'UK Ambassador',            icon: '🌟', color: 'red-gold', country: 'GB' },
    amb_spain:          { label: 'Spain Ambassador',         icon: '🌟', color: 'red-gold', country: 'ES' },
    amb_germany:        { label: 'Germany Ambassador',       icon: '🌟', color: 'red-gold', country: 'DE' },
    amb_italy:          { label: 'Italy Ambassador',         icon: '🌟', color: 'red-gold', country: 'IT' },
    amb_turkey:         { label: 'Turkey Ambassador',        icon: '🌟', color: 'red-gold', country: 'TR' },
    amb_pakistan:       { label: 'Pakistan Ambassador',      icon: '🌟', color: 'red-gold', country: 'PK' },
    amb_indonesia:      { label: 'Indonesia Ambassador',     icon: '🌟', color: 'red-gold', country: 'ID' },
    amb_malaysia:       { label: 'Malaysia Ambassador',      icon: '🌟', color: 'red-gold', country: 'MY' },
    amb_nigeria:        { label: 'Nigeria Ambassador',       icon: '🌟', color: 'red-gold', country: 'NG' },
    amb_south_africa:   { label: 'South Africa Ambassador',  icon: '🌟', color: 'red-gold', country: 'ZA' },
        amb_bangladesh:     { label: 'Bangladesh Ambassador',    icon: '🌟', color: 'red-gold', country: 'BD' },
         amb_vietnam:     { label: 'Vietnam Ambassador',    icon: '🌟', color: 'red-gold', country: 'VI' },

    // ═══════════════════════════════════════════════
    // 🥇 FIRST MEMBERS - كل الدول
    // ═══════════════════════════════════════════════
    first_india:        { label: 'First Member from India',       icon: '🥇', color: 'blue-gold', country: 'IN' },
    first_egypt:        { label: 'First Member from Egypt',       icon: '🥇', color: 'blue-gold', country: 'EG' },
    first_saudi:        { label: 'First Member from Saudi Arabia',icon: '🥇', color: 'blue-gold', country: 'SA' },
    first_algeria:      { label: 'First Member from Algeria',     icon: '🥇', color: 'blue-gold', country: 'DZ' },
    first_tunisia:      { label: 'First Member from Tunisia',     icon: '🥇', color: 'blue-gold', country: 'TN' },
    first_uae:          { label: 'First Member from UAE',         icon: '🥇', color: 'blue-gold', country: 'AE' },
    first_jordan:       { label: 'First Member from Jordan',      icon: '🥇', color: 'blue-gold', country: 'JO' },
    first_usa:          { label: 'First Member from USA',         icon: '🥇', color: 'blue-gold', country: 'US' },
    first_france:       { label: 'First Member from France',      icon: '🥇', color: 'blue-gold', country: 'FR' },
    first_uk:           { label: 'First Member from UK',          icon: '🥇', color: 'blue-gold', country: 'GB' },
    first_spain:        { label: 'First Member from Spain',       icon: '🥇', color: 'blue-gold', country: 'ES' },
    first_germany:      { label: 'First Member from Germany',     icon: '🥇', color: 'blue-gold', country: 'DE' },
    first_italy:        { label: 'First Member from Italy',       icon: '🥇', color: 'blue-gold', country: 'IT' },
    first_turkey:       { label: 'First Member from Turkey',      icon: '🥇', color: 'blue-gold', country: 'TR' },
    first_pakistan:     { label: 'First Member from Pakistan',    icon: '🥇', color: 'blue-gold', country: 'PK' },
    first_indonesia:    { label: 'First Member from Indonesia',   icon: '🥇', color: 'blue-gold', country: 'ID' },
    first_malaysia:     { label: 'First Member from Malaysia',    icon: '🥇', color: 'blue-gold', country: 'MY' },
    first_nigeria:      { label: 'First Member from Nigeria',     icon: '🥇', color: 'blue-gold', country: 'NG' },
    first_south_africa: { label: 'First Member from South Africa',icon: '🥇', color: 'blue-gold', country: 'ZA' },
};

let allUsersForBadges = [];
let currentBadgeUserId = null;

async function loadBadgesTab() {
    const container = document.getElementById('dashboardContent');
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner">🏅</div>
            <p>Loading badges...</p>
        </div>
    `;

    try {
        const { data: profiles, error } = await supabaseClient
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .order('created_at', { ascending: false });

        if (error) {
            container.innerHTML = `<div class="data-table" style="padding:20px;text-align:center;">Error: ${error.message}</div>`;
            return;
        }

        const { data: badges } = await supabaseClient
            .from('user_badges')
            .select('*');

        const badgesMap = {};
        (badges || []).forEach(b => {
            if (!badgesMap[b.user_id]) badgesMap[b.user_id] = [];
            badgesMap[b.user_id].push(b);
        });

        allUsersForBadges = (profiles || []).map(p => ({
            ...p,
            badges: badgesMap[p.id] || []
        }));

        renderBadgesTab(allUsersForBadges);

    } catch (err) {
        console.error('Badges error:', err);
        container.innerHTML = `<div class="data-table" style="padding:20px;text-align:center;">Error loading badges</div>`;
    }
}

function renderBadgesTab(users) {
    const container = document.getElementById('dashboardContent');

    // خيارات الدول
    const countryOptions = Object.entries(COUNTRIES)
        .map(([code, name]) =>
            `<option value="${code}">${countryFlagEmoji(code)} ${name}</option>`
        ).join('');

    container.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="margin: 0 0 20px 0;">🏅 Badges Management</h2>

            <div style="background: #e7f3ff; padding: 15px; border-radius: 12px; margin-bottom: 20px; border-right: 4px solid #1877f2;">
                <strong>💡 How it works:</strong>
                <p style="margin: 8px 0 0 0; color: #65676b; font-size: 14px;">
                    اضغط <strong>🏅 Manage</strong> لمنح شارة. الشارات الجاهزة مع راية الدولة تُضاف تلقائياً 🇲🇦 🇵🇭
                </p>
            </div>

            <input type="text" class="search-tier-box" id="badgeSearch"
                   placeholder="🔍 Search user by name or username..."
                   oninput="filterBadgesUsers()">

            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Badges</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="badgesTableBody">
                        ${renderBadgesRows(users)}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <div id="badgeModal" style="
            display:none; position:fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.6); z-index:99999;
            align-items:center; justify-content:center;">
            <div style="
                background:white; border-radius:16px; padding:25px;
                max-width:520px; width:90%; max-height:85vh; overflow-y:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="margin:0;">🏅 Grant Badge</h3>
                    <button onclick="closeBadgeModal()" style="
                        background:none; border:none; font-size:24px; cursor:pointer;">✕</button>
                </div>

                <p style="color:#65676b; font-size:14px; margin:0 0 15px 0;">
                    User: <strong id="badgeModalUser">—</strong>
                </p>

                <label style="display:block; font-weight:600; margin-bottom:8px; font-size:14px;">
                    Choose a badge:
                </label>
                <div id="badgePresetsList" style="
                    display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
                    gap:8px; margin-bottom:20px;">
                    ${Object.entries(BADGE_PRESETS).map(([key, b]) => `
                        <button onclick="grantBadge('${key}')" style="
                            padding:10px; border:2px solid #e4e6eb; background:white;
                            border-radius:10px; cursor:pointer; font-size:13px;
                            font-weight:600; text-align:left; transition:0.2s;
                            display:flex; align-items:center; gap:6px;"
                            onmouseover="this.style.borderColor='#1877f2'"
                            onmouseout="this.style.borderColor='#e4e6eb'">
                            <span>${b.icon}</span>
                            <span style="flex:1;">${b.label}</span>
                            ${b.country ? flagImg(b.country, 20) : ''}
                        </button>
                    `).join('')}
                </div>

                <hr style="border:none; border-top:1px solid #e4e6eb; margin:20px 0;">

                <label style="display:block; font-weight:600; margin-bottom:8px; font-size:14px;">
                    ✨ Custom Badge:
                </label>
                <input type="text" id="customBadgeLabel" placeholder="Badge label (e.g. Legend Member)"
                       style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-bottom:8px; box-sizing:border-box;">
                <input type="text" id="customBadgeIcon" placeholder="Icon (emoji)" value="🏅"
                       style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-bottom:8px; box-sizing:border-box;">

                <label style="display:block; font-weight:600; margin-bottom:6px; font-size:13px;">
                    🌍 Country (اختياري - لإظهار الراية):
                </label>
                <select id="customBadgeCountry" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-bottom:8px; box-sizing:border-box;">
                    <option value="">— No Flag —</option>
                    ${countryOptions}
                </select>

                <select id="customBadgeColor" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-bottom:12px; box-sizing:border-box;">
                    <option value="blue">🔵 Blue</option>
                    <option value="blue-gold">🔵 Blue + Gold</option>
                    <option value="green">🟢 Green</option>
                    <option value="red">🔴 Red</option>
                    <option value="red-gold">🔴 Red + Gold</option>
                    <option value="red-orange">🔴 Red + Orange</option>
                    <option value="yellow">🟡 Yellow</option>
                    <option value="orange">🟠 Orange</option>
                    <option value="purple">🟣 Purple</option>
                    <option value="gray-blue">⚪ Gray + Blue</option>
                </select>

                <button onclick="grantCustomBadge()" style="
                    width:100%; padding:12px; background:#1877f2; color:white;
                    border:none; border-radius:10px; font-weight:700; cursor:pointer;">
                    ➕ Grant Custom Badge
                </button>
            </div>
        </div>
    `;

    if (!document.getElementById('badgeStyles')) {
        const style = document.createElement('style');
        style.id = 'badgeStyles';
        style.textContent = `
            .badge-pill {
                display:inline-flex; align-items:center; gap:6px;
                padding:6px 14px; border-radius:50px;
                font-weight:700; font-size:12px; color:white;
                box-shadow:0 2px 6px rgba(0,0,0,0.15);
                margin:2px;
            }
            .badge-pill.blue { background:linear-gradient(135deg,#2da9e8,#1e8fd0); }
            .badge-pill.blue-gold { background:linear-gradient(135deg,#1e3cba,#1e3cba); border:2px solid #ffd700; }
            .badge-pill.green { background:linear-gradient(135deg,#2ecc71,#27ae60); }
            .badge-pill.red { background:linear-gradient(135deg,#e74c3c,#c0392b); }
            .badge-pill.red-gold { background:linear-gradient(135deg,#c0392b,#8e1b1b); border:2px solid #ffd700; }
            .badge-pill.red-orange { background:linear-gradient(135deg,#e74c3c,#f39c12); border:2px solid #ffd700; }
            .badge-pill.yellow { background:linear-gradient(135deg,#f1c40f,#e67e22); }
            .badge-pill.orange { background:linear-gradient(135deg,#f39c12,#e67e22); }
            .badge-pill.purple { background:linear-gradient(135deg,#8e44ad,#6c3483); }
            .badge-pill.gray-blue { background:linear-gradient(135deg,#8fa3b0,#6b7f8c); }
            .badge-remove {
                background:none; border:none; color:white;
                cursor:pointer; font-weight:900; margin-left:4px;
                font-size:14px; padding:0;
            }
        `;
        document.head.appendChild(style);
    }
}

function renderBadgesRows(users) {
    if (users.length === 0) {
        return '<tr><td colspan="4" style="text-align:center;padding:30px;color:#65676b;">No users found</td></tr>';
    }

    return users.map((u, i) => {
        const name = u.full_name || u.username || 'User';
        const avatar = u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1877f2&color=fff`;

        const badgesHtml = u.badges.length === 0
            ? '<span style="color:#aaa;font-size:13px;">No badges</span>'
            : u.badges.map(b => `
                <span class="badge-pill ${b.badge_color || 'blue'}">
                    ${b.badge_icon || '🏅'} ${escapeHtml(b.badge_label)}
                    ${b.country_code ? flagImg(b.country_code, 20) : ''}
                    <button class="badge-remove" onclick="removeBadge('${b.id}')" title="Remove">✕</button>
                </span>
            `).join('');

        return `
            <tr>
                <td>${i + 1}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <img src="${avatar}" style="width:36px;height:36px;border-radius:50%;">
                        <div>
                            <div style="font-weight:600;">${escapeHtml(name)}</div>
                            <div style="font-size:12px;color:#65676b;">@${escapeHtml(u.username || 'user')}</div>
                        </div>
                    </div>
                </td>
                <td style="max-width:400px;">${badgesHtml}</td>
                <td>
                    <button class="action-btn resolve-btn" onclick="openBadgeModal('${u.id}', '${escapeHtml(name).replace(/'/g, "\\'")}')">
                        🏅 Manage
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

window.openBadgeModal = function(userId, userName) {
    currentBadgeUserId = userId;
    document.getElementById('badgeModalUser').textContent = userName;
    document.getElementById('badgeModal').style.display = 'flex';
};

window.closeBadgeModal = function() {
    document.getElementById('badgeModal').style.display = 'none';
    currentBadgeUserId = null;
};

// منح شارة جاهزة
window.grantBadge = async function(badgeKey) {
    if (!currentBadgeUserId) return;

    const preset = BADGE_PRESETS[badgeKey];
    if (!preset) return;

    await insertBadge({
        user_id: currentBadgeUserId,
        badge_key: badgeKey,
        badge_label: preset.label,
        badge_icon: preset.icon,
        badge_color: preset.color,
        country_code: preset.country || null
    });
};

// منح شارة مخصصة
window.grantCustomBadge = async function() {
    if (!currentBadgeUserId) return;

    const label = document.getElementById('customBadgeLabel').value.trim();
    const icon = document.getElementById('customBadgeIcon').value.trim() || '🏅';
    const color = document.getElementById('customBadgeColor').value;
    const country = document.getElementById('customBadgeCountry').value || null;

    if (!label) {
        alert('❌ Please enter a badge label');
        return;
    }

    await insertBadge({
        user_id: currentBadgeUserId,
        badge_key: 'custom_' + Date.now(),
        badge_label: label,
        badge_icon: icon,
        badge_color: color,
        country_code: country
    });
};

async function insertBadge(badgeData) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        const { error } = await supabaseClient
            .from('user_badges')
            .insert({
                ...badgeData,
                granted_by: user.id
            });

        if (error) {
            if (error.code === '23505') {
                alert('⚠️ User already has this badge');
            } else {
                alert('❌ Error: ' + error.message);
            }
            return;
        }

        await supabaseClient.from('notifications').insert({
            receiver_id: badgeData.user_id,
            sender_id: user.id,
            type: 'badge_granted',
            message: `${badgeData.badge_icon} Congratulations! You earned a new badge: ${badgeData.badge_label}`,
            is_read: false,
            created_at: new Date()
        });

        closeBadgeModal();
        alert('✅ Badge granted!');
        loadBadgesTab();

    } catch (err) {
        console.error('Badge error:', err);
        alert('❌ Error: ' + err.message);
    }
}

window.removeBadge = async function(badgeId) {
    if (!confirm('Remove this badge from the user?')) return;

    try {
        const { error } = await supabaseClient
            .from('user_badges')
            .delete()
            .eq('id', badgeId);

        if (error) {
            alert('❌ Error: ' + error.message);
            return;
        }

        alert('✅ Badge removed!');
        loadBadgesTab();

    } catch (err) {
        console.error('Error:', err);
    }
};

window.filterBadgesUsers = function() {
    const query = document.getElementById('badgeSearch').value.toLowerCase();
    const filtered = query
        ? allUsersForBadges.filter(u =>
            (u.full_name || '').toLowerCase().includes(query) ||
            (u.username || '').toLowerCase().includes(query)
          )
        : allUsersForBadges;

    document.getElementById('badgesTableBody').innerHTML = renderBadgesRows(filtered);
};

window.loadBadgesTab = loadBadgesTab;