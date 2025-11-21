
import React from 'react';
import { Trophy, Zap, BarChart3, PlayCircle, Users, LogOut } from 'lucide-react';
import { AuthService } from '../services/auth';

interface LandingProps {
    onStart: () => void;
    onOpenStats: () => void;
    onLogout: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onStart, onOpenStats, onLogout }) => {
    const user = AuthService.getUser();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
            {/* Header User Profile */}
            {user && (
                <div className="absolute top-6 right-6 z-50 flex items-center gap-3 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-full pl-2 pr-4 py-2 hover:bg-slate-900/80 transition-colors">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/20" />
                    <div className="hidden md:block text-left">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Welcome</div>
                        <div className="text-xs font-bold text-white">{user.name}</div>
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <button 
                        onClick={onLogout}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/5"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            )}

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black z-0"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <div className="z-10 max-w-4xl w-full text-center space-y-12">
                {/* Hero Section */}
                <div className="space-y-6 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-sm font-medium mb-4">
                        <Zap size={16} className="fill-current" />
                        <span>AI-Powered Cricket Experience</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 drop-shadow-2xl">
                        CRICKPRO <span className="text-cyan-500">3D</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        The next generation of cricket scoring. Real-time AI commentary, immersive stats, and professional analytics for your local matches.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div 
                        onClick={onOpenStats}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-cyan-500/30 transition-all cursor-pointer hover:-translate-y-1 group"
                    >
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="text-cyan-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            Player Hub
                            <span className="text-[10px] bg-cyan-500 text-white px-1.5 py-0.5 rounded">NEW</span>
                        </h3>
                        <p className="text-slate-400 text-sm">Manage your squad and view career statistics across all matches.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Trophy className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Tournament Mode</h3>
                        <p className="text-slate-400 text-sm">Manage teams, customize overs, and run full tournaments with ease.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm hover:border-pink-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="text-pink-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">AI Commentary</h3>
                        <p className="text-slate-400 text-sm">Live ball-by-ball commentary powered by Gemini AI that adapts to the match situation.</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="pt-8">
                    <button 
                        onClick={onStart}
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-cyan-600 font-display rounded-xl hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 hover:scale-105 shadow-lg shadow-cyan-500/25"
                    >
                        <span className="mr-2 text-lg">Start New Match</span>
                        <PlayCircle size={24} className="group-hover:translate-x-1 transition-transform" />
                        <div className="absolute -inset-3 rounded-xl bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest">Powered by Google Gemini</p>
                </div>
            </div>
        </div>
    );
};
