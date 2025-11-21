
import React, { useEffect } from 'react';
import { Player } from '../types';
import { Star, Trophy, Sparkles, Crown } from 'lucide-react';

interface MilestoneProps {
    player: Player;
    type: '50' | '100' | '5W' | 'MOM'; // MOM = Man of the Match
    onClose: () => void;
}

export const MilestoneCelebration: React.FC<MilestoneProps> = ({ player, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    const getTitle = () => {
        switch(type) {
            case '50': return "HALF CENTURY!";
            case '100': return "CENTURY!";
            case '5W': return "5 WICKET HAUL!";
            case 'MOM': return "PLAYER OF THE MATCH";
            default: return "MILESTONE!";
        }
    };

    const getColor = () => {
        switch(type) {
            case '50': return "text-blue-400";
            case '100': return "text-amber-400";
            case '5W': return "text-red-500";
            case 'MOM': return "text-cyan-400";
            default: return "text-white";
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-pointer" onClick={onClose}>
             <style>{`
                @keyframes firework {
                    0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
                    50% { width: 0.5vmin; opacity: 1; }
                    100% { width: var(--finalSize); opacity: 0; }
                }
                .firework,
                .firework::before,
                .firework::after {
                    --initialSize: 0.5vmin;
                    --finalSize: 45vmin;
                    --particleSize: 0.2vmin;
                    --color1: yellow;
                    --color2: khaki;
                    --color3: white;
                    --color4: lime;
                    --color5: gold;
                    --color6: mediumseagreen;
                    --y: -30vmin;
                    --x: -50%;
                    --initialY: 60vmin;
                    content: "";
                    animation: firework 2s infinite;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, var(--y));
                    width: var(--initialSize);
                    aspect-ratio: 1;
                    background: 
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 50% 0%,
                        radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 50%,
                        radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 50% 100%,
                        radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 0% 50%,
                        radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 80% 90%,
                        radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 95% 90%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 90% 70%,
                        radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 60%,
                        radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 55% 80%,
                        radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 70% 77%,
                        radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 22% 90%,
                        radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 45% 90%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 33% 70%,
                        radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 10% 60%,
                        radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 31% 80%,
                        radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 28% 77%,
                        radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 13% 72%,
                        radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 80% 10%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 95% 14%,
                        radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 90% 23%,
                        radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 100% 43%,
                        radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 85% 27%,
                        radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 77% 37%,
                        radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 60% 7%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 22% 14%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 45% 20%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 33% 34%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 10% 29%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 31% 37%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 28% 7%,
                        radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 13% 42%;
                }
                .firework::before { transform: translate(-50%, -50%) rotate(25deg) !important; }
                .firework::after { transform: translate(-50%, -50%) rotate(-37deg) !important; }
            `}</style>

            {/* Fireworks Instances */}
            <div className="firework" style={{ left: '25%', top: '40%' } as any}></div>
            <div className="firework" style={{ left: '75%', top: '30%', animationDelay: '0.5s' } as any}></div>
            <div className="firework" style={{ left: '50%', top: '20%', animationDelay: '1s' } as any}></div>

            <div className="relative z-10 text-center p-8 rounded-3xl bg-slate-900/80 border border-white/20 backdrop-blur-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-bounce">
                
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    {type === 'MOM' ? (
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.5)]">
                            <Crown size={48} className="text-white" />
                        </div>
                    ) : type === '5W' ? (
                        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)]">
                            <Sparkles size={48} className="text-white" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.5)]">
                            <Trophy size={48} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Text */}
                <h2 className={`text-4xl md:text-6xl font-black font-display italic uppercase mb-2 drop-shadow-2xl ${getColor()}`}>
                    {getTitle()}
                </h2>
                
                {/* Player Info */}
                <div className="mt-6 flex flex-col items-center">
                    {player.photo ? (
                        <img src={player.photo} alt={player.name} className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl mb-4" />
                    ) : (
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 border-2 border-white/10 mb-4">
                            {player.name.charAt(0)}
                        </div>
                    )}
                    <h3 className="text-3xl font-bold text-white">{player.name}</h3>
                    
                    <div className="mt-2 text-xl text-slate-300 font-medium">
                        {type === '50' && `${player.stats.runs} Runs (${player.stats.balls})`}
                        {type === '100' && `${player.stats.runs} Runs (${player.stats.balls})`}
                        {type === '5W' && `${player.stats.wickets}-${player.stats.runsConceded}`}
                        {type === 'MOM' && "Match Hero"}
                    </div>
                </div>

                <div className="mt-8 text-sm text-slate-500 uppercase tracking-widest">
                    Tap to Continue
                </div>
            </div>
        </div>
    );
};
