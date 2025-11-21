
import React from 'react';
import { MatchState } from '../types';
import { Target, Activity, Zap, TrendingUp } from 'lucide-react';

interface ScoreCardProps {
    matchState: MatchState;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ matchState }) => {
    const runRate = matchState.overs > 0 
        ? (matchState.score / (matchState.overs + matchState.balls/6)).toFixed(2) 
        : "0.00";

    // Projected score calculation
    const currentBalls = matchState.overs * 6 + matchState.balls;
    const totalBalls = matchState.totalOvers * 6;
    const projectedScore = currentBalls > 0 
        ? Math.floor((matchState.score / currentBalls) * totalBalls)
        : 0;

    const isSecondInnings = matchState.currentInnings === 2;
    const target = matchState.target;
    const needs = target ? target - matchState.score : 0;
    const ballsRemaining = totalBalls - currentBalls;
    const oversRemaining = matchState.totalOvers - (matchState.overs + matchState.balls/6);
    
    const rrr = isSecondInnings && oversRemaining > 0 
        ? (needs / oversRemaining).toFixed(2) 
        : "0.00";
    
    const battingTeam = matchState.battingTeamName === matchState.teamA.name ? matchState.teamA : matchState.teamB;
    const bowlingTeam = matchState.battingTeamName === matchState.teamA.name ? matchState.teamB : matchState.teamA;

    return (
        <div className="w-full relative group mb-6 animate-fade-in">
             {/* Ambient Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-[1.8rem] p-6 border border-white/10 shadow-2xl overflow-hidden">
                
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                {/* Header: Teams & Match Status */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        {/* Batting Team Badge */}
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-3 mb-1">
                                {battingTeam.logo ? (
                                    <img src={battingTeam.logo} alt={battingTeam.name} className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                                        {battingTeam.name.substring(0,1)}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold text-lg leading-none tracking-tight">{battingTeam.name}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Batting</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-0.5">vs {bowlingTeam.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Indicator */}
                    <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1.5 rounded-full border border-white/5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">Live Match</span>
                    </div>
                </div>

                {/* Main Score Display */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-8">
                    
                    {/* Big Score */}
                    <div className="flex items-baseline gap-4">
                        <div className="flex flex-col">
                            <div className="text-7xl md:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tighter leading-[0.85] drop-shadow-2xl">
                                {matchState.score}<span className="text-4xl md:text-6xl text-slate-600 font-light">/</span>{matchState.wickets}
                            </div>
                            <div className="text-sm text-cyan-400 font-bold tracking-widest uppercase mt-2 flex items-center gap-1">
                                <Zap size={14} className="fill-current" />
                                {matchState.overs}.{matchState.balls} Overs
                            </div>
                        </div>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 md:flex md:gap-6 w-full md:w-auto">
                        <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm min-w-[100px]">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Run Rate</div>
                            <div className="text-2xl font-display font-bold text-white">{runRate}</div>
                        </div>
                        
                        {isSecondInnings ? (
                            <>
                                <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm min-w-[100px] relative overflow-hidden group/stat">
                                    <div className="absolute bottom-0 left-0 h-0.5 w-full bg-orange-500 group-hover/stat:h-full group-hover/stat:opacity-10 transition-all duration-300"></div>
                                    <div className="text-[10px] text-orange-400 uppercase tracking-wider font-bold mb-1">Required</div>
                                    <div className="text-2xl font-display font-bold text-orange-400">{rrr}</div>
                                </div>
                                <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm min-w-[120px] relative overflow-hidden group/stat">
                                     <div className="absolute bottom-0 left-0 h-0.5 w-full bg-emerald-500 group-hover/stat:h-full group-hover/stat:opacity-10 transition-all duration-300"></div>
                                    <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold mb-1">To Win</div>
                                    <div className="text-2xl font-display font-bold text-white">
                                        {needs} <span className="text-xs text-slate-500 font-sans font-normal">({ballsRemaining})</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm min-w-[100px]">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Projected</div>
                                    <div className="text-2xl font-display font-bold text-slate-300">{projectedScore}</div>
                                </div>
                                <div className="bg-slate-800/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm min-w-[100px]">
                                     <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Overs Left</div>
                                    <div className="text-2xl font-display font-bold text-slate-300">{matchState.totalOvers - matchState.overs}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer: Recent Balls & Target */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-dashed border-white/10">
                    <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0 no-scrollbar">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">
                            <Activity size={12} /> Last 8 Balls
                        </div>
                        <div className="flex gap-2 pl-2">
                            {matchState.recentBalls.length > 0 ? matchState.recentBalls.map((ball, idx) => (
                                <div key={idx} className={`
                                    w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs shadow-lg transition-transform hover:scale-110 cursor-default
                                    ${ball === 'W' 
                                        ? 'bg-gradient-to-br from-red-500 to-red-700 text-white ring-2 ring-red-500/30' 
                                        : ball === '4' 
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white ring-2 ring-blue-500/30' 
                                        : ball === '6' 
                                        ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white ring-2 ring-purple-500/30' 
                                        : ball.includes('WD') || ball.includes('NB')
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                                        : 'bg-slate-800 text-slate-300 border border-slate-700'}
                                `}>
                                    {ball}
                                </div>
                            )) : (
                                <span className="text-xs text-slate-600 italic px-2">Match starting...</span>
                            )}
                        </div>
                    </div>

                    {target && (
                        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-full border border-white/10 shadow-inner">
                            <Target size={16} className="text-orange-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target: <span className="text-white text-sm">{target}</span></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
