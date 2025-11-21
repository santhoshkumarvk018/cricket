
import React, { useState } from 'react';
import { MatchState, Team, Player } from '../types';
import { Shield, Trophy, Star } from 'lucide-react';

interface FullScorecardProps {
    matchState: MatchState;
}

export const FullScorecard: React.FC<FullScorecardProps> = ({ matchState }) => {
    const [activeTeam, setActiveTeam] = useState<string>(matchState.teamA.name);

    const getStrikeRate = (p: Player) => p.stats.balls > 0 ? ((p.stats.runs / p.stats.balls) * 100).toFixed(1) : "0.0";
    const getEconomy = (p: Player) => {
        const overs = p.stats.oversBowled + (p.stats.balls % 6) / 6;
        return overs > 0 ? (p.stats.runsConceded / overs).toFixed(1) : "0.0";
    };
    const getDotPercentage = (p: Player) => p.stats.balls > 0 ? ((p.stats.dotBalls / p.stats.balls) * 100).toFixed(0) : "0";

    const renderTeamStats = (team: Team) => (
        <div className="space-y-8 animate-fade-in">
            {/* Batting Table */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-display font-bold text-cyan-400 flex items-center gap-2">
                        <Trophy size={16} /> Batting
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-950/30 text-slate-400 text-[10px] uppercase tracking-wider">
                                <th className="px-4 py-3">Batter</th>
                                <th className="px-2 py-3 text-right">R</th>
                                <th className="px-2 py-3 text-right">B</th>
                                <th className="px-2 py-3 text-right">4s</th>
                                <th className="px-2 py-3 text-right">6s</th>
                                <th className="px-2 py-3 text-right text-cyan-400">SR</th>
                                <th className="px-2 py-3 text-right text-amber-400">50/100</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {team.players.map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-4 py-3 font-medium text-white flex items-center gap-3">
                                        {p.photo && (
                                            <img src={p.photo} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                                        )}
                                        <span>{p.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 group-hover:bg-slate-700">{p.role.substring(0,3).toUpperCase()}</span>
                                    </td>
                                    <td className="px-2 py-3 text-right font-bold">{p.stats.runs}</td>
                                    <td className="px-2 py-3 text-right text-slate-400">{p.stats.balls}</td>
                                    <td className="px-2 py-3 text-right text-slate-400">{p.stats.fours}</td>
                                    <td className="px-2 py-3 text-right text-slate-400">{p.stats.sixes}</td>
                                    <td className="px-2 py-3 text-right font-mono text-cyan-400">{getStrikeRate(p)}</td>
                                    <td className="px-2 py-3 text-right font-mono text-amber-400">
                                        {p.stats.fifties > 0 || p.stats.hundreds > 0 ? (
                                            <span className="flex items-center justify-end gap-1">
                                                {p.stats.hundreds > 0 && <span className="text-amber-400 font-bold">{p.stats.hundreds}</span>}
                                                {p.stats.hundreds > 0 && <span className="text-xs text-slate-600">/</span>}
                                                {p.stats.fifties > 0 && <span className="text-blue-400">{p.stats.fifties}</span>}
                                            </span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Bowling Table */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 border-b border-white/10">
                        <h3 className="font-display font-bold text-emerald-400 flex items-center gap-2">
                            <Trophy size={16} /> Bowling
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-950/30 text-slate-400 text-[10px] uppercase tracking-wider">
                                    <th className="px-4 py-3">Bowler</th>
                                    <th className="px-2 py-3 text-right">O</th>
                                    <th className="px-2 py-3 text-right">R</th>
                                    <th className="px-2 py-3 text-right">W</th>
                                    <th className="px-2 py-3 text-right text-emerald-400">Econ</th>
                                    <th className="px-2 py-3 text-right">5W</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {team.players.filter(p => p.stats.oversBowled > 0 || p.stats.balls > 0).map(p => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                                            {p.photo && <img src={p.photo} className="w-5 h-5 rounded-full" alt="" />}
                                            {p.name}
                                        </td>
                                        <td className="px-2 py-3 text-right text-slate-400">{p.stats.oversBowled}</td>
                                        <td className="px-2 py-3 text-right font-bold">{p.stats.runsConceded}</td>
                                        <td className="px-2 py-3 text-right font-bold text-red-400">{p.stats.wickets}</td>
                                        <td className="px-2 py-3 text-right font-mono text-emerald-400">{getEconomy(p)}</td>
                                        <td className="px-2 py-3 text-right">
                                            {p.stats.fiveWickets > 0 ? <span className="text-yellow-400 font-bold flex justify-end"><Star size={12} fill="currentColor" /></span> : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {team.players.filter(p => p.stats.oversBowled > 0 || p.stats.balls > 0).length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-4 text-center text-slate-500 italic">No bowling stats</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fielding Stats */}
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 border-b border-white/10">
                        <h3 className="font-display font-bold text-amber-400 flex items-center gap-2">
                            <Shield size={16} /> Fielding
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-950/30 text-slate-400 text-[10px] uppercase tracking-wider">
                                    <th className="px-4 py-3">Fielder</th>
                                    <th className="px-2 py-3 text-right">Catches</th>
                                    <th className="px-2 py-3 text-right">Run Outs</th>
                                    <th className="px-2 py-3 text-right">Stump</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {team.players.filter(p => p.stats.catches > 0 || p.stats.runOuts > 0 || p.stats.stumpings > 0).map(p => (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                                        <td className="px-2 py-3 text-right text-slate-400">{p.stats.catches}</td>
                                        <td className="px-2 py-3 text-right text-slate-400">{p.stats.runOuts}</td>
                                        <td className="px-2 py-3 text-right text-slate-400">{p.stats.stumpings}</td>
                                    </tr>
                                ))}
                                {team.players.filter(p => p.stats.catches > 0 || p.stats.runOuts > 0 || p.stats.stumpings > 0).length === 0 && (
                                    <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500 italic">No fielding stats</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-6">
            {/* Team Tabs */}
            <div className="flex p-1 bg-slate-900/80 rounded-xl border border-white/10">
                <button
                    onClick={() => setActiveTeam(matchState.teamA.name)}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                        activeTeam === matchState.teamA.name 
                        ? 'bg-slate-800 text-cyan-400 shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                >
                    {matchState.teamA.name}
                </button>
                <button
                    onClick={() => setActiveTeam(matchState.teamB.name)}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                        activeTeam === matchState.teamB.name 
                        ? 'bg-slate-800 text-red-400 shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                >
                    {matchState.teamB.name}
                </button>
            </div>

            {/* Stats View */}
            {activeTeam === matchState.teamA.name ? renderTeamStats(matchState.teamA) : renderTeamStats(matchState.teamB)}
        </div>
    );
};
