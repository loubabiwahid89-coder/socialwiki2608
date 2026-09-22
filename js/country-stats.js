// =========================================================
// 🌍 COUNTRY STATS - إحصائيات المستخدمين حسب الدولة
// =========================================================

(function() {
    'use strict';

    // قائمة الدول مع رموزها وأسمائها
    var COUNTRY_DATA = {
        'PH': { name: 'Philippines', flag: '🇵🇭', lat: 12.8797, lng: 121.7740, flag_url: 'https://flagcdn.com/w40/ph.png' },
        'CM': { name: 'Cameroon',    flag: '🇨🇲', lat: 7.3697,  lng: 12.3547,  flag_url: 'https://flagcdn.com/w40/cm.png' },
        'MA': { name: 'Morocco',     flag: '🇲🇦', lat: 31.7917, lng: -7.0926,  flag_url: 'https://flagcdn.com/w40/ma.png' },
        'EG': { name: 'Egypt',       flag: '🇪🇬', lat: 26.8206, lng: 30.8025,  flag_url: 'https://flagcdn.com/w40/eg.png' },
        'SA': { name: 'Saudi Arabia',flag: '🇸🇦', lat: 23.8859, lng: 45.0792,  flag_url: 'https://flagcdn.com/w40/sa.png' },
        'DZ': { name: 'Algeria',     flag: '🇩🇿', lat: 28.0339, lng: 1.6596,   flag_url: 'https://flagcdn.com/w40/dz.png' },
        'TN': { name: 'Tunisia',     flag: '🇹🇳', lat: 33.8869, lng: 9.5375,   flag_url: 'https://flagcdn.com/w40/tn.png' },
        'NG': { name: 'Nigeria',     flag: '🇳🇬', lat: 9.0820,  lng: 8.6753,   flag_url: 'https://flagcdn.com/w40/ng.png' },
        'IN': { name: 'India',       flag: '🇮🇳', lat: 20.5937, lng: 78.9629,  flag_url: 'https://flagcdn.com/w40/in.png' },
        'ID': { name: 'Indonesia',   flag: '🇮🇩', lat: -0.7893, lng: 113.9213, flag_url: 'https://flagcdn.com/w40/id.png' },
        'US': { name: 'United States',flag:'🇺🇸', lat: 37.0902, lng: -95.7129, flag_url: 'https://flagcdn.com/w40/us.png' },
        'FR': { name: 'France',      flag: '🇫🇷', lat: 46.2276, lng: 2.2137,   flag_url: 'https://flagcdn.com/w40/fr.png' },
        'GB': { name: 'United Kingdom', flag:'🇬🇧', lat: 55.3781, lng: -3.4360, flag_url: 'https://flagcdn.com/w40/gb.png' },
        'DE': { name: 'Germany',     flag: '🇩🇪', lat: 51.1657, lng: 10.4515,  flag_url: 'https://flagcdn.com/w40/de.png' },
        'ES': { name: 'Spain',       flag: '🇪🇸', lat: 40.4637, lng: -3.7492,  flag_url: 'https://flagcdn.com/w40/es.png' }
        // أضف دولاً أخرى حسب حاجتك
    };

    // =========================================================
    // 🚀 التحميل الرئيسي
    // =========================================================
    window.loadCountryStats = async function() {
        var container = document.getElementById('countryStatsContainer');
        if (!container) {
            console.warn('⚠️ countryStatsContainer not found');
            return;
        }

        if (!window.supabaseClient) {
            container.innerHTML = '<p style="color:#f44336;">❌ Supabase not ready</p>';
            return;
        }

        container.innerHTML = '<p style="color:#65676b; text-align:center;">⏳ Loading stats...</p>';

        try {
            // 1. جلب جميع المستخدمين مع دولهم
            var { data: profiles, error } = await window.supabaseClient
                .from('profiles')
                .select('id, country')
                .not('country', 'is', null);

            if (error) throw error;

            // 2. تجميع البيانات حسب الدولة
            var stats = {};
            (profiles || []).forEach(function(p) {
                var code = (p.country || 'unknown').toUpperCase();
                if (!stats[code]) stats[code] = 0;
                stats[code]++;
            });

            // 3. ترتيب الدول حسب عدد المستخدمين
            var sortedCountries = Object.keys(stats)
                .map(function(code) {
                    return {
                        code: code,
                        count: stats[code],
                        info: COUNTRY_DATA[code] || { name: code, flag: '🏳️', lat: 0, lng: 0 }
                    };
                })
                .sort(function(a, b) { return b.count - a.count; });

            var total = profiles.length || 0;

            // 4. بناء الواجهة
            renderStatsUI(container, sortedCountries, total);

        } catch (err) {
            console.error('❌ Error:', err);
            container.innerHTML = '<p style="color:#f44336;">❌ Error: ' + err.message + '</p>';
        }
    };

    // =========================================================
    // 🎨 بناء الواجهة
    // =========================================================
    function renderStatsUI(container, countries, total) {
        var html = '';

        // ============ Header ============
        html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">';
        html += '<h2 style="margin:0; color:#fff; font-size:24px;">🌍 Countries</h2>';
        html += '<div style="color:#94a3b8; font-size:14px;">Total users: <strong style="color:#fff;">' + total + '</strong></div>';
        html += '</div>';

        // ============ Grid: Map + Top Countries ============
        html += '<div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:20px; margin-bottom:20px;">';

        // ============ Left: Map ============
        html += '<div style="background:#1e293b; border-radius:12px; padding:20px; border:1px solid #334155;">';
        html += '<h3 style="margin:0 0 15px; color:#fff;">World Map — User Concentration</h3>';
        html += '<div id="worldMap" style="height:400px; border-radius:8px; overflow:hidden;"></div>';
        html += '</div>';

        // ============ Right: Top Countries ============
        html += '<div style="background:#1e293b; border-radius:12px; padding:20px; border:1px solid #334155;">';
        html += '<h3 style="margin:0 0 15px; color:#fff;">Top Countries</h3>';
        html += '<div style="color:#94a3b8; font-size:13px; margin-bottom:15px;">Ranked by active users</div>';

        if (countries.length === 0) {
            html += '<p style="color:#94a3b8; text-align:center; padding:40px 0;">No data yet</p>';
        } else {
            var top = countries.slice(0, 5);
            top.forEach(function(c, i) {
                var percent = total > 0 ? ((c.count / total) * 100).toFixed(1) : 0;
                var rankColors = ['#10b981', '#64748b', '#94a3b8', '#475569', '#334155'];
                html += '<div style="display:flex; align-items:center; gap:12px; padding:12px; background:#0f172a; border-radius:8px; margin-bottom:8px;">';
                html += '<div style="width:36px; height:36px; border-radius:8px; background:' + (rankColors[i] || '#334155') + '; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700;">' + String(i + 1).padStart(2, '0') + '</div>';
                html += '<div style="flex:1; display:flex; align-items:center; gap:8px;">';
                if (c.info.flag_url) {
                    html += '<img src="' + c.info.flag_url + '" style="width:24px; height:auto; border-radius:3px;">';
                } else {
                    html += '<span style="font-size:20px;">' + c.info.flag + '</span>';
                }
                html += '<span style="color:#fff; font-weight:600;">' + c.info.name + '</span>';
                html += '</div>';
                html += '<div style="text-align:right;">';
                html += '<div style="color:#fff; font-weight:700;">' + c.count + ' users</div>';
                html += '<div style="color:#10b981; font-size:12px;">' + percent + '%</div>';
                html += '</div>';
                html += '</div>';
            });
        }

        html += '</div>'; // end right box
        html += '</div>'; // end grid

        // ============ Bottom Stats ============
        html += '<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px;">';
        html += '<div style="background:#1e293b; border-radius:12px; padding:20px; border:1px solid #334155;">';
        html += '<div style="color:#94a3b8; font-size:12px; margin-bottom:8px;">TOTAL ACTIVE USERS</div>';
        html += '<div style="color:#fff; font-size:28px; font-weight:700;">' + total + '</div>';
        html += '</div>';
        html += '<div style="background:#1e293b; border-radius:12px; padding:20px; border:1px solid #334155;">';
        html += '<div style="color:#94a3b8; font-size:12px; margin-bottom:8px;">COUNTRIES</div>';
        html += '<div style="color:#fff; font-size:28px; font-weight:700;">' + countries.length + '</div>';
        html += '</div>';
        html += '<div style="background:#1e293b; border-radius:12px; padding:20px; border:1px solid #334155;">';
        html += '<div style="color:#94a3b8; font-size:12px; margin-bottom:8px;">AVG. PER COUNTRY</div>';
        html += '<div style="color:#fff; font-size:28px; font-weight:700;">' + (countries.length > 0 ? Math.round(total / countries.length) : 0) + '</div>';
        html += '</div>';
        html += '</div>';

        container.innerHTML = html;

        // 5. رسم الخريطة
        renderMap(countries);
    }

    // =========================================================
    // 🗺️ رسم الخريطة باستخدام Leaflet
    // =========================================================
    function renderMap(countries) {
        var mapContainer = document.getElementById('worldMap');
        if (!mapContainer) return;

        // إذا كانت Leaflet محمّلة
        if (typeof L === 'undefined') {
            mapContainer.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:100px;">🗺️ Loading map...</p>';
            return;
        }

        // إنشاء الخريطة
        var map = L.map('worldMap').setView([20, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

        // إضافة علامات للدول
        var maxCount = Math.max.apply(null, countries.map(function(c) { return c.count; })) || 1;

        countries.forEach(function(c) {
            if (!c.info.lat || !c.info.lng) return;

            var radius = 10 + (c.count / maxCount) * 30; // حجم الدائرة حسب العدد

            L.circleMarker([c.info.lat, c.info.lng], {
                radius: radius,
                fillColor: '#10b981',
                color: '#10b981',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.4
            }).addTo(map)
            .bindPopup(
                '<div style="text-align:center;">' +
                (c.info.flag_url ? '<img src="' + c.info.flag_url + '" style="width:32px;"><br>' : '') +
                '<strong>' + c.info.name + '</strong><br>' +
                '<span style="color:#10b981;">' + c.count + ' users</span>' +
                '</div>'
            );
        });
    }

})();