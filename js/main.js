// =========================================================
// SOCIALWIKI - MAIN.JS
// =========================================================

console.log("✅ main.js is working");

// =========================================================
// SUPABASE SETUP
// =========================================================

const SUPABASE_URL = "https://hvslktufqrgdgrgxmvcm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("✅ Supabase client created");

// =========================================================
// GET CURRENT USER
// =========================================================

async function getCurrentUser() {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    return user;
}

// =========================================================
// LOGOUT
// =========================================================

async function logout() {
    await window.supabaseClient.auth.signOut();
    window.location.href = "auth.html";
}

// =========================================================
// SEARCH USERS
// =========================================================

async function searchUsers(query) {
    if (!query || query.length < 2) {
        const results = document.getElementById('searchResults');
        if (results) results.style.display = 'none';
        return;
    }
    
    const { data: users, error } = await window.supabaseClient
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);
    
    if (error) {
        console.error('Search error:', error);
        return;
    }
    
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '';
    resultsDiv.style.display = 'block';
    
    if (!users || users.length === 0) {
        resultsDiv.innerHTML = '<div class="search-no-results">No results found</div>';
        return;
    }
    
    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.onclick = () => window.location.href = `profile.html?id=${user.id}`;
        
        const avatar = user.avatar_url 
            ? `<img src="${user.avatar_url}" alt="Profile">`
            : `<img src="https://ui-avatars.com/api/?name=${user.username || 'User'}&background=1877f2&color=fff" alt="Profile">`;
        
        item.innerHTML = `
            ${avatar}
            <div class="search-result-info">
                <div class="search-result-name">${user.full_name || user.username}</div>
                <div class="search-result-username">@${user.username}</div>
            </div>
        `;
        
        resultsDiv.appendChild(item);
    });
}

// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener("DOMContentLoaded", async function() {
    console.log("📌 DOM loaded - main.js");
});

// تعريض الدوال للنطاق العام
window.logout = logout;
window.searchUsers = searchUsers;
window.getCurrentUser = getCurrentUser;