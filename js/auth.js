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

function showMessage(message) {
    if (authMessage) {
        authMessage.textContent = message;
    }
    console.log(message);
}

// =====================================================
// LOGIN WITH GOOGLE
// =====================================================

async function loginWithGoogle() {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });
        
        if (error) {
            console.error('Error signing in with Google:', error);
            showMessage('Error: ' + error.message);
            return;
        }
        
        console.log('Redirecting to Google...');
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error: ' + error.message);
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
            showMessage("Please enter email and password.");
            return;
        }

        showMessage("Creating account...");

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            console.error("❌ Sign Up error:", error);
            showMessage(error.message);
            return;
        }

        console.log("✅ Sign Up successful:", data);

        if (data.session) {
            showMessage("Account created successfully!");
            window.location.href = "index.html";
        } else {
            showMessage("Account created. Please check your email to confirm your account.");
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
            showMessage("Please enter email and password.");
            return;
        }

        showMessage("Logging in...");

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error("❌ Login error:", error);
            showMessage(error.message);
            return;
        }

        console.log("✅ Login successful:", data);

        showMessage("Login successful!");
        window.location.href = "index.html";
    });
}

// =====================================================
// FORGOT PASSWORD
// =====================================================

if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener("click", async function() {
        const email = emailInput.value.trim();

        if (!email) {
            showMessage("Please enter your email address first.");
            return;
        }

        showMessage("Sending password reset email...");

        const resetPage = new URL("reset-password.html", window.location.href).href;

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: resetPage
        });

        if (error) {
            console.error("❌ Password reset error:", error);
            showMessage(error.message);
            return;
        }

        console.log("✅ Password reset email sent.");
        showMessage("Password reset email sent. Please check your email.");
    });
}

// =====================================================
// EXPORT FUNCTIONS
// =====================================================

window.loginWithGoogle = loginWithGoogle;