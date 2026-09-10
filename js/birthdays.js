// =========================================================
// BIRTHDAYS.JS - CORRECTED
// =========================================================

console.log('🎂 birthdays.js started');

// =========================================================
// SUPABASE SETUP
// =========================================================

const SUPABASE_URL = "https://hvslktufqrgdgrgxmvcm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Birthdays Supabase client ready');

// =========================================================
// GET CURRENT USER (مع التحقق من الجلسة)
// =========================================================

async function getBirthdayCurrentUser() {
    try {
        // ✅ التحقق من وجود جلسة
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError || !session) {
            console.log('⚠️ No active session, skipping birthday check');
            return null;
        }
        
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error || !user) {
            console.log('⚠️ No user logged in');
            return null;
        }
        
        return user;
        
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// =========================================================
// LOAD BIRTHDAYS (مع التحقق)
// =========================================================

async function loadBirthdays() {
    try {
        console.log('🎂 Loading birthdays...');
        
        // ✅ التحقق من المستخدم أولاً
        const user = await getBirthdayCurrentUser();
        
        if (!user) {
            console.log('⚠️ Skipping birthdays - user not logged in');
            return;
        }
        
        // جلب المستخدمين الذين لديهم أعياد ميلاد اليوم
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        const { data: profiles, error } = await supabaseClient
            .from('profiles')
            .select('id, username, full_name, avatar_url, birth_date')
            .not('birth_date', 'is', null);
        
        if (error) {
            console.error('Error loading profiles:', error);
            return;
        }
        
        if (!profiles || profiles.length === 0) {
            console.log('🎂 Profiles with birthdays: 0');
            return;
        }
        
        // تصفية المستخدمين الذين لديهم أعياد ميلاد اليوم
        const birthdayUsers = profiles.filter(profile => {
            if (!profile.birth_date) return false;
            const birthDate = new Date(profile.birth_date);
            return birthDate.getMonth() + 1 === month && birthDate.getDate() === day;
        });
        
        console.log(`🎂 Today's birthdays: ${birthdayUsers.length}`);
        
        // عرض أعياد الميلاد
        const birthdayContainer = document.getElementById('birthdayContainer');
        if (!birthdayContainer) {
            console.log('❌ Birthday containers not found');
            return;
        }
        
        if (birthdayUsers.length === 0) {
            birthdayContainer.innerHTML = '<p style="color: #65676b; font-size: 13px;">No birthdays today</p>';
            return;
        }
        
        birthdayContainer.innerHTML = '';
        birthdayUsers.forEach(user => {
            const displayName = user.full_name || user.username || 'User';
            const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=1877f2&color=fff`;
            
            const div = document.createElement('div');
            div.className = 'birthday-item';
            div.innerHTML = `
                <img src="${avatarUrl}" alt="Profile" style="width: 30px; height: 30px; border-radius: 50%;">
                <span style="font-weight: 600; font-size: 13px;">${displayName}</span>
                <span style="color: #65676b; font-size: 12px;">🎂</span>
            `;
            birthdayContainer.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error loading birthdays:', error);
    }
}

// =========================================================
// START
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    // تأخير تحميل أعياد الميلاد حتى يتم التحقق من الجلسة
    setTimeout(loadBirthdays, 1000);
});

console.log('✅ Birthdays system + real greetings ready');