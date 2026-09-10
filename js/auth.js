console.log("🔥 AUTH.JS IS WORKING");

// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL = "https://hvslktufqrgdgrgxmvcm.supabase.co";
const SUPABASE_KEY = "sb_publishable_fm8uX1P8x0QyQEIb7VTDDA_27nNJBeT";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================================================
// ELEMENTS
// =====================================================

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupButton = document.getElementById("signupButton");
const loginButton = document.getElementById("loginButton");
const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const authMessage = document.getElementById("authMessage");

// =====================================================
// MESSAGE
// =====================================================

function showMessage(message, isError = false) {
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.style.color = isError ? '#ff4444' : '#00c851';
    }
    console.log(message);
}

// =====================================================
// CREATE PROFILE AFTER SIGNUP
// =====================================================

async function createUserProfile(user) {
    try {
        console.log('📝 Creating profile for user:', user.id);
        
        // استخراج الاسم من البريد الإلكتروني
        const emailParts = user.email.split('@');
        const username = emailParts[0];
        const fullName = username;
        
        const { data, error } = await supabaseClient
            .from('profiles')
            .insert({
                id: user.id,
                username: username,
                full_name: fullName,
                avatar_url: `https://ui-avatars.com/api/?name=${fullName}&background=1877f2&color=fff`,
                created_at: new Date()
            })
            .select()
            .single();
        
        if (error) {
            console.error('❌ Error creating profile:', error);
            
            // إذا كان الخطأ بسبب وجود الملف بالفعل
            if (error.code === '23505') {
                console.log('✅ Profile already exists, continuing...');
                return true;
            }
            
            return false;
        }
        
        console.log('✅ Profile created successfully:', data);
        return true;
        
    } catch (error) {
        console.error('❌ Error in createUserProfile:', error);
        return false;
    }
}

// =====================================================
// CHECK AND CREATE PROFILE IF NEEDED
// =====================================================

async function checkAndCreateProfile(user) {
    try {
        // التحقق من وجود ملف شخصي
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('id, username, full_name')
            .eq('id', user.id)
            .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
            console.error('❌ Error checking profile:', error);
            return false;
        }
        
        // إذا لم يوجد ملف شخصي، أنشئ واحداً
        if (!profile) {
            console.log('📝 Profile not found, creating...');
            return await createUserProfile(user);
        }
        
        console.log('✅ Profile exists:', profile.username);
        return true;
        
    } catch (error) {
        console.error('❌ Error in checkAndCreateProfile:', error);
        return false;
    }
}

// =====================================================
// HANDLE AUTH CALLBACK (لـ Google)
// =====================================================

async function handleAuthCallback() {
    try {
        // التحقق من وجود معلمات في URL
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
            console.log('🔄 Setting session from callback...');
            
            const { data, error } = await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (error) {
                console.error('❌ Error setting session:', error);
                return;
            }
            
            console.log('✅ Session set successfully');
            
            // إنشاء ملف شخصي إذا لزم الأمر
            if (data.user) {
                await checkAndCreateProfile(data.user);
            }
            
            // تنظيف URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // التوجيه إلى الصفحة الرئيسية
            window.location.href = 'index.html';
        }
        
    } catch (error) {
        console.error('❌ Error in handleAuthCallback:', error);
    }
}

// =====================================================
// LOGIN WITH GOOGLE
// =====================================================

async function loginWithGoogle() {
    try {
        console.log('🔄 Logging in with Google...');
        
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });
        
        if (error) {
            console.error('❌ Error signing in with Google:', error);
            showMessage('Error: ' + error.message, true);
            return;
        }
        
        console.log('✅ Redirecting to Google...');
        
    } catch (error) {
        console.error('❌ Error:', error);
        showMessage('Error: ' + error.message, true);
    }
}

// =====================================================
// SIGN UP
// =====================================================

if (signupButton) {
    signupButton.addEventListener("click", async function() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Please enter email and password.", true);
            return;
        }

        if (password.length < 6) {
            showMessage("Password must be at least 6 characters.", true);
            return;
        }

        showMessage("Creating account...");

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: email.split('@')[0],
                        full_name: email.split('@')[0]
                    }
                }
            });

            if (error) {
                console.error("❌ Sign Up error:", error);
                showMessage(error.message, true);
                return;
            }

            console.log("✅ Sign Up successful:", data);

            if (data.user) {
                // إنشاء ملف شخصي للمستخدم الجديد
                const profileCreated = await createUserProfile(data.user);
                
                if (profileCreated) {
                    showMessage("Account created successfully!");
                    
                    // إذا كان هناك جلسة، انتقل للصفحة الرئيسية
                    if (data.session) {
                        window.location.href = "index.html";
                    } else {
                        showMessage("Account created. Please check your email to confirm your account.");
                    }
                } else {
                    showMessage("Account created but profile creation failed. Please contact support.", true);
                }
            }
            
        } catch (error) {
            console.error("❌ Error:", error);
            showMessage(error.message, true);
        }
    });
}

// =====================================================
// LOGIN
// =====================================================

if (loginButton) {
    loginButton.addEventListener("click", async function() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Please enter email and password.", true);
            return;
        }

        showMessage("Logging in...");

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error("❌ Login error:", error);
                showMessage(error.message, true);
                return;
            }

            console.log("✅ Login successful:", data);

            if (data.user) {
                // التحقق من وجود ملف شخصي
                await checkAndCreateProfile(data.user);
            }

            showMessage("Login successful!");
            
            // تأخير بسيط قبل التوجيه للتأكد من حفظ البيانات
            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
            
        } catch (error) {
            console.error("❌ Error:", error);
            showMessage(error.message, true);
        }
    });
}

// =====================================================
// FORGOT PASSWORD
// =====================================================

if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener("click", async function() {
        const email = emailInput.value.trim();

        if (!email) {
            showMessage("Please enter your email address first.", true);
            return;
        }

        showMessage("Sending password reset email...");

        try {
            const resetPage = new URL("reset-password.html", window.location.href).href;

            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: resetPage
            });

            if (error) {
                console.error("❌ Password reset error:", error);
                showMessage(error.message, true);
                return;
            }

            console.log("✅ Password reset email sent.");
            showMessage("Password reset email sent. Please check your email.");
            
        } catch (error) {
            console.error("❌ Error:", error);
            showMessage(error.message, true);
        }
    });
}

// =====================================================
// CHECK SESSION ON PAGE LOAD
// =====================================================

async function checkSession() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            console.log('✅ Session found for user:', session.user.email);
            
            // التحقق من وجود ملف شخصي
            await checkAndCreateProfile(session.user);
        } else {
            console.log('ℹ️ No session found');
        }
        
    } catch (error) {
        console.error('❌ Error checking session:', error);
    }
}

// =====================================================
// LISTEN TO AUTH CHANGES
// =====================================================

supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event);
    
    if (event === 'SIGNED_IN') {
        console.log('✅ User signed in:', session?.user?.email);
        
        if (session?.user) {
            // إنشاء ملف شخصي إذا لزم الأمر
            setTimeout(() => {
                checkAndCreateProfile(session.user);
            }, 500);
        }
    }
    
    if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
    }
});

// =====================================================
// INITIALIZE
// =====================================================

// معالجة callback من Google
document.addEventListener('DOMContentLoaded', function() {
    console.log('📌 DOM loaded - auth.js');
    
    // معالجة callback
    handleAuthCallback();
    
    // التحقق من الجلسة
    setTimeout(checkSession, 500);
});

// =====================================================
// EXPORT FUNCTIONS
// =====================================================

window.loginWithGoogle = loginWithGoogle;
window.supabaseClient = supabaseClient;