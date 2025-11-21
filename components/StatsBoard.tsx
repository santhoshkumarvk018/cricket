
import React from 'react';
import { MatchState, Player } from '../types';
import { User, RefreshCcw, Hand, Timer, BoxSelect, Zap, ChevronUp } from 'lucide-react';

interface StatsBoardProps {
    matchState: MatchState;
    players: {
        striker: Player | undefined;
        nonStriker: Player | undefined;
        bowler: Player | undefined;
    };
    onSwapPlayer: (role: 'striker' | 'nonStriker' | 'bowler') => void;
}

export const StatsBoard: React.FC<StatsBoardProps> = ({ matchState, players, onSwapPlayer }) => {
    const { striker, nonStriker, bowler } = players;

    const getStrikeRate = (p: Player) => p.stats.balls > 0 ? ((p.stats.runs / p.stats.balls) * 100).toFixed(1) : "0.0";
    const getEconomy = (p: Player) => {
        const overs = p.stats.oversBowled + (p.stats.balls % 6) / 6;
        return overs > 0 ? (p.stats.runsConceded / overs).toFixed(1) : "0.0";
    };
    const getDotPercentage = (p: Player) => p.stats.balls > 0 ? ((p.stats.dotBalls / p.stats.balls) * 100).toFixed(0) : "0";
    const getBoundaryPercentage = (p: Player) => p.stats.balls > 0 ? (((p.stats.fours + p.stats.sixes) / p.stats.balls) * 100).toFixed(0) : "0";

    const PlayerCard = ({ player, label, role, isActive, align = 'left' }: { player?: Player, label: string, role: 'striker' | 'nonStriker' | 'bowler', isActive?: boolean, align?: 'left' | 'right' }) => {
        const isBowler = role === 'bowler';
        const hasFieldingStats = player && (player.stats.catches > 0 || player.stats.runOuts > 0 || player.stats.stumpings > 0);

        return (
            <div className={`
                relative overflow-hidden rounded-2xl transition-all duration-300 group flex flex-col h-full
                ${isActive 
                    ? 'bg-slate-800/80 border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-900/50 border border-white/5 hover:border-white/10'}
            `}>
                {/* Active Glow Line */}
                {isActive && <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>}

                <div className="p-4 flex-1 flex flex-col">
                    {/* Header */}
                    <div className={`flex items-center gap-2 mb-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                        <div className={`
                            flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md
                            ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-500 border border-white/5'}
                        `}>
                            {isActive && <Zap size={10} className="fill-current animate-pulse" />}
                            {label}
                        </div>
                        <div className="flex-1"></div>
                        <button 
                            onClick={() => onSwapPlayer(role)}
                            className="text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 p-1.5 rounded-full transition-all"
                            title="Swap Player"
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>

                    {/* Player Details */}
                    <div className={`flex gap-3 mb-4 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
                         {/* Player Photo / Avatar */}
                         <div className="flex-shrink-0">
                             {player?.photo ? (
                                 <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-lg" />
                             ) : (
                                 <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-lg border border-white/10">
                                     {player ? player.name.charAt(0) : <User size={20} />}
                                 </div>
                             )}
                         </div>

                         <div className="flex-1 min-w-0">
                            <div className={`text-lg font-display font-bold text-white leading-tight mb-0.5 truncate ${!player && 'text-slate-600 italic'}`}>
                                {player?.name || 'Select Player'}
                            </div>
                            {player && (
                                <div className="text-[10px] text-slate-400 font-medium">
                                    {isBowler ? 'Right-Arm Fast' : 'Right-Hand Bat'}
                                </div>
                            )}
                         </div>
                         
                         {/* Big Number */}
                         <div className="flex flex-col justify-center">
                            {isBowler ? (
                                <div className={`text-2xl font-display font-bold text-white leading-none ${align === 'right' ? 'text-right' : ''}`}>
                                    {player?.stats.wickets}<span className="text-slate-500 mx-0.5">-</span>{player?.stats.runsConceded}
                                </div>
                            ) : (
                                <div className={`text-2xl font-display font-bold text-white leading-none ${align === 'right' ? 'text-right' : ''}`}>
                                    {player?.stats.runs}<span className="text-sm text-slate-500 font-sans ml-1">({player?.stats.balls})</span>
                                </div>
                            )}
                         </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-auto">
                        {isBowler ? (
                            <>
                                <div className="bg-slate-950/30 rounded-lg p-2 border border-white/5 text-center">
                                    <div className="text-[9px] text-slate-500 uppercase font-bold">Overs</div>
                                    <div className="text-sm font-mono font-bold text-white">{player?.stats.oversBowled}.{player ? player.stats.balls % 6 : 0}</div>
                                </div>
                                <div className="bg-slate-950/30 rounded-lg p-2 border border-white/5 text-center">
                                    <div className="text-[9px] text-slate-500 uppercase font-bold">Dots</div>
                                    <div className="text-sm font-mono font-bold text-white">{player?.stats.dotBalls}</div>
                                </div>
                                <div className="bg-slate-950/30 rounded-lg p-2 border border-white/5 text-center">
                                    <div className="text-[9px] text-emerald-500 uppercase font-bold">Econ</div>
                                    <div className="text-sm font-mono font-bold text-emerald-400">{player ? getEconomy(player) : '-'}</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-slate-950/30 rounded-lg p-2 border border-white/5 text-center">
                                    <div className="text-[9px] text-blue-400 uppercase font-bold">4s</div>
                                    <div className="text-sm font-mono font-bold text-white">{player?.stats.fours}</div>
                                </div>
                                <div className="bg-slate-950/30 rounded-lg p-2 border border-white/5 text-center">
                                    <div className="text-[9px] text-purple-400 uppercase font-bold">6s</div>
                                    <div className="text-sm font-mono font-bold text-white">{player?.stats.sixes}</div>
                                </div>
                                <div className="bg-slate-950/30 rounded-lg p-2 border border-white/5 text-center">
                                    <div className="text-[9px] text-amber-500 uppercase font-bold">SR</div>
                                    <div className="text-sm font-mono font-bold text-amber-400">{player ? getStrikeRate(player) : '-'}</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Fielding Stats Footer */}
                    {hasFieldingStats && (
                        <div className="mt-3 pt-2 border-t border-white/5 flex gap-2 justify-end">
                            {player.stats.catches > 0 && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-blue-300 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/10">
                                    <Hand size={10} /> {player.stats.catches}
                                </div>
                            )}
                            {player.stats.runOuts > 0 && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-orange-300 bg-orange-900/20 px-1.5 py-0.5 rounded border border-orange-500/10">
                                    <Timer size={10} /> {player.stats.runOuts}
                                </div>
                            )}
                            {player.stats.stumpings > 0 && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-red-300 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/10">
                                    <BoxSelect size={10} /> {player.stats.stumpings}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full my-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Batting Section */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PlayerCard player={striker} label="On Strike" role="striker" isActive={true} />
                    <PlayerCard player={nonStriker} label="Non-Striker" role="nonStriker" />
                </div>

                {/* Right: Bowling & Partnership */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <PlayerCard player={bowler} label="Current Bowler" role="bowler" isActive={true} align="right" />
                    
                    {/* Compact Partnership Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-4 border border-white/10 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Partnership</span>
                             <div className="text-right">
                                 <span className="text-xl font-display font-bold text-white">{matchState.currentPartnership.runs}</span>
                                 <span className="text-xs text-slate-400 ml-1">({matchState.currentPartnership.balls})</span>
                             </div>
                        </div>
                        {/* Visual Bar */}
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex mb-2">
                             <div className="bg-cyan-500" style={{ width: `${matchState.currentPartnership.runs > 0 ? 50 : 0}%`, opacity: 0.7 }}></div> 
                             {/* This is a simplified visual, ideally would split by striker contribution */}
                        </div>
                         <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{matchState.currentPartnership.fours} Fours</span>
                            <span>{matchState.currentPartnership.sixes} Sixes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
