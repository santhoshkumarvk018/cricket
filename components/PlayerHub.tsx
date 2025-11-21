
import React, { useState, useMemo } from 'react';
import { DB } from '../services/db';
import { Team, Player } from '../types';
import { Search, ChevronLeft, Shield, Trophy, Activity } from 'lucide-react';

interface PlayerHubProps {
    onBack: () => void;
}

export const PlayerHub: React.FC<PlayerHubProps> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const teams = DB.getTeams();
    
    // Flatten all players from all teams
    const allPlayers = useMemo(() => {
        const players: (Player & { teamName: string })[] = [];
        teams.forEach(team => {
            team.players.forEach(player => {
                players.push({ ...player, teamName: team.name });
            });
        });
        return players;
    }, [teams]);

    const filteredPlayers = allPlayers.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4 self-start">
                        <button 
                            onClick={onBack}
                            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-white">Player Registry</h1>
                            <p className="text-slate-400 text-sm">Track career statistics across all matches</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            placeholder="Search player or team..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredPlayers.length > 0 ? (
                         <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                                            <th className="p-4 font-bold">Player Profile</th>
                                            <th className="p-4 font-bold text-right">Runs</th>
                                            <th className="p-4 font-bold text-right">SR</th>
                                            <th className="p-4 font-bold text-right">High Score</th>
                                            <th className="p-4 font-bold text-right">Wickets</th>
                                            <th className="p-4 font-bold text-right">Econ</th>
                                            <th className="p-4 font-bold text-right">Catches</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {filteredPlayers.map((player, idx) => (
                                            <tr key={`${player.id}-${idx}`} className="hover:bg-slate-800/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-cyan-500 border border-white/10">
                                                            {player.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{player.name}</div>
                                                            <div className="text-xs text-slate-500">{player.teamName} • {player.role}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right font-bold text-white">
                                                    {player.stats.runs}
                                                    <div className="text-[10px] text-slate-500 font-normal">{player.stats.balls} balls</div>
                                                </td>
                                                <td className="p-4 text-right font-mono text-cyan-400">
                                                    {player.stats.balls > 0 ? ((player.stats.runs / player.stats.balls) * 100).toFixed(1) : '0.0'}
                                                </td>
                                                <td className="p-4 text-right text-slate-400">
                                                    {/* We don't track HS separately yet, using Runs as placeholder or calculated max if we tracked match history */}
                                                    {player.stats.runs}*
                                                </td>
                                                <td className="p-4 text-right font-bold text-white">
                                                    {player.stats.wickets}
                                                </td>
                                                <td className="p-4 text-right font-mono text-emerald-400">
                                                    {player.stats.oversBowled > 0 ? (player.stats.runsConceded / player.stats.oversBowled).toFixed(2) : '0.00'}
                                                </td>
                                                <td className="p-4 text-right text-slate-300">
                                                    {player.stats.catches}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                                <Search size={32} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No players found</h3>
                            <p className="text-slate-500">Try adding teams or adjusting your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
