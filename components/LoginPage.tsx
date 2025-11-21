import React, { useState, useEffect } from 'react';
import { Zap, UserCircle2, AlertTriangle, Loader } from 'lucide-react';
import { UserProfile } from '../types';
import { AuthService } from '../services/auth'; // Import AuthService

interface LoginProps {
    onLogin: (provider: 'google' | 'facebook') => Promise<UserProfile | null>;
    onGuestLogin?: () => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onLogin, onGuestLogin }) => {
    const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | 'guest' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false); // New state for Firebase readiness

    // Check auth readiness periodically or on mount
    useEffect(() => {
        // Since AuthService.initialize() is handled in App.tsx, we check if the auth instance is available here.
        if (AuthService.getAuthInstance()) {
            setIsAuthReady(true);
        } else {
            // Fallback check in case the component mounts before App.tsx completes initialization
            const checkInterval = setInterval(() => {
                if (AuthService.getAuthInstance()) {
                    setIsAuthReady(true);
                    clearInterval(checkInterval);
                }
            }, 500);
            return () => clearInterval(checkInterval);
        }
    }, []);


    const handleLogin = async (provider: 'google' | 'facebook') => {
        if (!isAuthReady) return;

        setError(null);
        setLoadingProvider(provider);
        
        // Brief asynchronous delay to help with potential race conditions before calling the popup
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        try {
            await onLogin(provider);
        } catch (e) {
            console.error(`Login failed for ${provider}`, e);
            // Display a user-friendly message for popup/security failures
            setError(`Login failed. If no popup appeared, please check your browser's security settings (Pop-up Blocker) or continue as a guest.`);
        } finally {
            setLoadingProvider(null);
        }
    };
    
    const handleGuestLogin = () => {
        setError(null);
        setLoadingProvider('guest');
        onGuestLogin?.(); 
    };

    const isLoginDisabled = !isAuthReady || !!loadingProvider;

    const renderLoadingState = (provider: 'google' | 'facebook') => (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-4 border-2 rounded-full animate-spin ${provider === 'google' ? 'border-slate-300 border-t-slate-600' : 'border-white/30 border-t-white'}`}></div>
            <span className="text-sm">Connecting...</span>
        </div>
    );


    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0f172a]">
            {/* Immersive Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black"></div>
            
            {/* Abstract Stadium Lights */}
            <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] opacity-50 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] opacity-50 animate-pulse delay-700"></div>
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="relative z-10 w-full max-w-[400px] p-6">
                
                {/* Brand Logo */}
                <div className="flex justify-center mb-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
                        <div className="relative w-20 h-20 bg-slate-900 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                            <Zap className="text-cyan-400" size={40} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">CrickPro <span className="text-cyan-400">3D</span></h1>
                        <p className="text-slate-400 text-sm">Sign in to sync your stats and teams</p>
                    </div>

                    {/* Readiness Indicator */}
                    {!isAuthReady && (
                         <div className="bg-slate-900/50 text-slate-400 p-3 rounded-lg text-sm mb-4 flex items-center justify-center gap-2 animate-pulse">
                            <Loader size={16} /> Initializing Authentication...
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/40 border border-red-500/50 text-red-300 p-3 rounded-lg text-xs mb-4 flex items-start gap-2 animate-fade-in">
                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button 
                        onClick={() => handleLogin('google')}
                        disabled={isLoginDisabled}
                        className="w-full bg-white hover:bg-slate-50 text-[#1f1f1f] font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group mb-3"
                    >
                        {loadingProvider === 'google' ? renderLoadingState('google') : (
                            <>
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full block">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    </svg>
                                </div>
                                <span className="font-roboto text-sm font-medium tracking-wide">Sign in with Google</span>
                            </>
                        )}
                    </button>

                    {/* Facebook Sign In Button */}
                    <button 
                        onClick={() => handleLogin('facebook')}
                        disabled={isLoginDisabled}
                        className="w-full bg-[#1877F2] hover:bg-[#1565c0] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group mb-4"
                    >
                        {loadingProvider === 'facebook' ? renderLoadingState('facebook') : (
                            <>
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.79-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                                <span className="font-roboto text-sm font-medium tracking-wide">Sign in with Facebook</span>
                            </>
                        )}
                    </button>

                    {onGuestLogin && (
                        <>
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                                <div className="h-px w-full bg-white/10"></div>
                                <span className="px-3 shrink-0">OR</span>
                                <div className="h-px w-full bg-white/10"></div>
                            </div>

                            <button 
                                onClick={() => handleGuestLogin()}
                                disabled={!!loadingProvider}
                                className={`w-full bg-slate-800 text-slate-300 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] border border-white/10 ${loadingProvider === 'guest' ? 'bg-cyan-900/50 border-cyan-500/50' : 'hover:bg-slate-700'}`}
                            >
                                {loadingProvider === 'guest' ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-cyan-300 border-t-cyan-600 rounded-full animate-spin"></div>
                                        <span className="text-sm">Joining...</span>
                                    </div>
                                ) : (
                                    <>
                                        <UserCircle2 size={20} />
                                        <span className="text-sm">Continue as Guest</span>
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-slate-500 mt-2">Recommended if social sign-in popups are blocked.</p>
                        </>
                    )}

                    <div className="mt-6 flex items-center justify-center text-xs text-slate-500 gap-2">
                        <span>Secured by</span> 
                        <span className="font-bold text-slate-400">Firebase Auth</span>
                    </div>
                </div>
                
                <div className="mt-6 text-center">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                        CrickPro v2.7 • Built with Gemini
                    </p>
                </div>
            </div>
        </div>
    );
};