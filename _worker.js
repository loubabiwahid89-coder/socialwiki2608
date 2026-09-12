// =========================================================
// Cloudflare Worker - SocialWiki
// Handles: Signed Upload URLs + Static Assets
// =========================================================

const SUPABASE_URL = "https://hvslktufqrgdgrgxmvcm.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2c2xrdHVmcXJnZGdyZ3htdmNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.REPLACE_WITH_YOUR_SERVICE_ROLE_KEY";

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // =====================================================
        // CORS Preflight
        // =====================================================
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        // =====================================================
        // API: Get Signed Upload URL
        // =====================================================
        if (url.pathname === '/api/get-upload-url' && request.method === 'POST') {
            try {
                const { fileName, fileType } = await request.json();
                
                if (!fileName) {
                    return new Response(JSON.stringify({ error: 'fileName required' }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }
                
                console.log('📤 Creating signed URL for:', fileName);
                
                // استخدم Service Role Key من Cloudflare Secrets إن وُجد
                const serviceKey = env.SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY;
                
                // طلب الرابط الموقع من Supabase
                const response = await fetch(
                    `${SUPABASE_URL}/storage/v1/object/upload/sign/post-videos/${fileName}`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': serviceKey,
                            'Authorization': `Bearer ${serviceKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ expiresIn: 3600 })
                    }
                );
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Supabase error:', errorText);
                    return new Response(JSON.stringify({ 
                        error: 'Supabase error',
                        details: errorText
                    }), {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }
                
                const data = await response.json();
                console.log('✅ Signed URL created');
                
                return new Response(JSON.stringify({
                    signedUrl: data.signedURL,
                    path: fileName,
                    token: data.token
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
                
            } catch (error) {
                console.error('❌ Handler error:', error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }
        
        // =====================================================
        // Static Assets (HTML, CSS, JS)
        // =====================================================
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }
        
        // Fallback
        return new Response('Not Found', { status: 404 });
    }
};
