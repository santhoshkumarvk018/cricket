
import React, { useState, useRef } from 'react';
import { Team, MatchState, MatchPhase, Player } from '../types';
import { Users, Clock, ChevronRight, ChevronDown, ChevronUp, Edit2, Target, Shield, Upload, Image as ImageIcon, X, Sparkles, Camera } from 'lucide-react';
import { generateTeamLogo } from '../services/geminiService';

interface SetupProps {
    onComplete: (state: Partial<MatchState>) => void;
    currentMatchState?: Partial<MatchState>;
}

export const TeamSetup: React.FC<SetupProps> = ({ onComplete }) => {
    const [teamA, setTeamA] = useState("Super Kings");
    const [teamB, setTeamB] = useState("Royal Challengers");
    const [teamALogo, setTeamALogo] = useState<string | null>(null);
    const [teamBLogo, setTeamBLogo] = useState<string | null>(null);
    const [editingTeam, setEditingTeam] = useState<'A' | 'B' | null>(null);
    
    const [generatingLogoA, setGeneratingLogoA] = useState(false);
    const [generatingLogoB, setGeneratingLogoB] = useState(false);
    
    const fileInputARef = useRef<HTMLInputElement>(null);
    const fileInputBRef = useRef<HTMLInputElement>(null);
    
    // Player Names
    const [teamAPlayers, setTeamAPlayers] = useState<string[]>(Array(11).fill('').map((_, i) => `Player ${i + 1}`));
    const [teamBPlayers, setTeamBPlayers] = useState<string[]>(Array(11).fill('').map((_, i) => `Player ${i + 1}`));
    
    // Player Photos
    const [teamAPhotos, setTeamAPhotos] = useState<(string | undefined)[]>(Array(11).fill(undefined));
    const [teamBPhotos, setTeamBPhotos] = useState<(string | undefined)[]>(Array(11).fill(undefined));

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, team: 'A' | 'B') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (team === 'A') setTeamALogo(reader.result as string);
                else setTeamBLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlayerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, team: 'A' | 'B', index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (team === 'A') {
                    const newPhotos = [...teamAPhotos];
                    newPhotos[index] = reader.result as string;
                    setTeamAPhotos(newPhotos);
                } else {
                    const newPhotos = [...teamBPhotos];
                    newPhotos[index] = reader.result as string;
                    setTeamBPhotos(newPhotos);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = (team: 'A' | 'B') => {
        if (team === 'A') fileInputARef.current?.click();
        else fileInputBRef.current?.click();
    };

    const generatePresetLogo = (emoji: string, team: 'A' | 'B') => {
        const color = team === 'A' ? '#06b6d4' : '#ef4444';
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="${color}20" rx="30" />
            <text x="50" y="65" font-size="50" text-anchor="middle" fill="white" style="font-family: sans-serif">${emoji}</text>
        </svg>`;
        const url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        if (team === 'A') setTeamALogo(url);
        else setTeamBLogo(url);
    };

    const handleAIGenerateLogo = async (team: 'A' | 'B') => {
        const name = team === 'A' ? teamA : teamB;
        if (!name) return;

        if (team === 'A') setGeneratingLogoA(true);
        else setGeneratingLogoB(true);

        const logo = await generateTeamLogo(name);
        
        if (logo) {
            if (team === 'A') setTeamALogo(logo);
            else setTeamBLogo(logo);
        }

        if (team === 'A') setGeneratingLogoA(false);
        else setGeneratingLogoB(false);
    };

    const handleStart = () => {
        const createTeam = (name: string, color: string, playerNames: string[], photos: (string|undefined)[], logo?: string): Team => ({
            id: `${name.replace(/\s/g, '').toLowerCase()}-${Date.now()}`,
            name,
            color,
            logo: logo,
            players: playerNames.map((pName, i) => ({
                id: `${name.replace(/\s/g, '')}-${i}`,
                name: pName || `${name} Player ${i + 1}`,
                role: i < 4 ? 'Batsman' : i === 4 || i === 5 ? 'All-Rounder' : i === 10 ? 'Keeper' : 'Bowler',
                photo: photos[i],
                stats: { 
                    runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, oversBowled: 0, runsConceded: 0, dotBalls: 0,
                    catches: 0, runOuts: 0, stumpings: 0,
                    thirties: 0, fifties: 0, hundreds: 0, fiveWickets: 0
                }
            }))
        });

        onComplete({
            teamA: createTeam(teamA, '#06b6d4', teamAPlayers, teamAPhotos, teamALogo || undefined),
            teamB: createTeam(teamB, '#ef4444', teamBPlayers, teamBPhotos, teamBLogo || undefined),
            phase: MatchPhase.SETUP_OVERS
        });
    };

    const handlePlayerNameChange = (team: 'A' | 'B', index: number, value: string) => {
        if (team === 'A') {
            const newPlayers = [...teamAPlayers];
            newPlayers[index] = value;
            setTeamAPlayers(newPlayers);
        } else {
            const newPlayers = [...teamBPlayers];
            newPlayers[index] = value;
            setTeamBPlayers(newPlayers);
        }
    };

    const renderPlayerInputs = (team: 'A' | 'B', players: string[]) => (
        <div className="mt-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 bg-slate-950/50 rounded-xl border border-white/5 shadow-inner">
                {players.map((p, i) => {
                    const photo = team === 'A' ? teamAPhotos[i] : teamBPhotos[i];
                    return (
                        <div key={i} className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2 border border-white/5 focus-within:border-cyan-500/50 transition-colors">
                            {/* Photo Upload Trigger */}
                            <label className="cursor-pointer relative group/photo">
                                {photo ? (
                                    <img src={photo} alt="P" className="w-8 h-8 rounded object-cover border border-white/20" />
                                ) : (
                                    <div className={`
                                        w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold
                                        ${i < 2 ? 'bg-amber-500/20 text-amber-400' : i > 8 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}
                                    `}>
                                        <Camera size={14} />
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handlePlayerPhotoUpload(e, team, i)}
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity rounded">
                                    <Upload size={10} className="text-white" />
                                </div>
                            </label>

                            <div className="flex-1 min-w-0">
                                <input 
                                    value={p}
                                    onChange={(e) => handlePlayerNameChange(team, i, e.target.value)}
                                    placeholder={`Player ${i+1}`}
                                    className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-600"
                                />
                                <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter flex items-center gap-1">
                                    <span className="w-4 inline-block text-center bg-slate-700 rounded text-white">{i+1}</span>
                                    {i < 4 ? 'BAT' : i === 10 ? 'WK' : i > 6 ? 'BWL' : 'AR'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderLogoUploader = (team: 'A' | 'B', currentLogo: string | null) => {
        const isGenerating = team === 'A' ? generatingLogoA : generatingLogoB;
        
        return (
        <div className="flex flex-col items-center mb-4">
             <div 
                onClick={() => !isGenerating && triggerFileSelect(team)}
                className={`
                    relative w-24 h-24 rounded-2xl bg-slate-800 border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all group shadow-lg
                    ${team === 'A' ? 'border-cyan-500/30 hover:border-cyan-400' : 'border-red-500/30 hover:border-red-400'}
                `}
             >
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center text-cyan-400 animate-pulse">
                        <Sparkles size={24} className="animate-spin" />
                        <span className="text-[9px] font-bold mt-2">Generating...</span>
                    </div>
                ) : currentLogo ? (
                    <img src={currentLogo} alt="Team Logo" className="w-full h-full object-cover" />
                ) : (
                    <div className={`flex flex-col items-center ${team === 'A' ? 'text-cyan-500/50' : 'text-red-500/50'}`}>
                        <ImageIcon size={24} />
                        <span className="text-[9px] uppercase font-bold mt-2">Upload Logo</span>
                    </div>
                )}
                {!isGenerating && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Upload size={24} className="text-white" />
                    </div>
                )}
             </div>
             
             {currentLogo && (
                <button 
                    onClick={() => team === 'A' ? setTeamALogo(null) : setTeamBLogo(null)}
                    className="mt-2 flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-2 py-1 rounded-full"
                >
                    <X size={10} /> Remove
                </button>
             )}

             {!currentLogo && !isGenerating && (
                 <div className="mt-2 flex flex-col items-center gap-2 w-full">
                     <button
                        onClick={() => handleAIGenerateLogo(team)}
                        className={`
                            flex items-center justify-center gap-2 w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all
                            ${team === 'A' 
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'}
                        `}
                     >
                         <Sparkles size={12} /> AI Generate
                     </button>

                     <div className="flex gap-2">
                        {['🦁', '🦅', '⚡', '🏏', '🔥'].map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => generatePresetLogo(emoji, team)}
                                className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center text-sm border border-white/5 hover:scale-110 hover:border-cyan-500/50 transition-all shadow-sm"
                                title="Use Preset"
                            >
                                {emoji}
                            </button>
                        ))}
                     </div>
                 </div>
             )}

             <input 
                type="file" 
                ref={team === 'A' ? fileInputARef : fileInputBRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, team)}
             />
        </div>
        );
    };

    return (
        <div className="bg-slate-900/80 border border-white/10 p-6 rounded-3xl max-w-2xl w-full mx-auto text-center backdrop-blur-xl shadow-2xl animate-fade-in-up">
            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-cyan-500/20">
                <Users className="text-cyan-400" size={28} />
            </div>
            <h2 className="text-3xl font-display font-bold mb-2 text-white">Team Setup</h2>
            <p className="text-slate-400 text-sm mb-8">Customize your squads and identities.</p>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Team A Config */}
                <div className="space-y-3">
                    {renderLogoUploader('A', teamALogo)}
                    <div className="text-left">
                        <label className="block text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2 ml-1">Home Team</label>
                        <input 
                            value={teamA}
                            onChange={e => setTeamA(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-display font-bold tracking-wide"
                            placeholder="Team A Name"
                        />
                    </div>
                    <button 
                        onClick={() => setEditingTeam(editingTeam === 'A' ? null : 'A')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${editingTeam === 'A' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Edit2 size={14} />
                            <span>Edit Squad</span>
                        </div>
                        {editingTeam === 'A' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {editingTeam === 'A' && renderPlayerInputs('A', teamAPlayers)}
                </div>

                {/* Team B Config */}
                <div className="space-y-3">
                    {renderLogoUploader('B', teamBLogo)}
                    <div className="text-left">
                        <label className="block text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2 ml-1">Away Team</label>
                        <input 
                            value={teamB}
                            onChange={e => setTeamB(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none font-display font-bold tracking-wide"
                            placeholder="Team B Name"
                        />
                    </div>
                    <button 
                        onClick={() => setEditingTeam(editingTeam === 'B' ? null : 'B')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${editingTeam === 'B' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Edit2 size={14} />
                            <span>Edit Squad</span>
                        </div>
                        {editingTeam === 'B' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {editingTeam === 'B' && renderPlayerInputs('B', teamBPlayers)}
                </div>
            </div>

            <button onClick={handleStart} className="w-full mt-10 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2 group hover:scale-[1.02]">
                <span>Next Step</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

interface OversSetupProps extends SetupProps {
    teamA: string;
    teamB: string;
}

export const OversSetup: React.FC<OversSetupProps> = ({ onComplete, teamA, teamB }) => {
    const [overs, setOvers] = useState<number | ''>(5);
    const [battingFirst, setBattingFirst] = useState<string>(teamA);
    const [targetScore, setTargetScore] = useState<number | ''>('');
    
    const handleStartMatch = () => {
        if (!overs || overs <= 0) return;
        
        const bowlingTeam = battingFirst === teamA ? teamB : teamA;
        const isChaseScenario = targetScore !== '' && Number(targetScore) > 0;
        
        onComplete({ 
            totalOvers: Number(overs), 
            battingFirst: battingFirst,
            battingTeamName: battingFirst,
            bowlingTeamName: bowlingTeam,
            phase: MatchPhase.LIVE,
            score: 0, wickets: 0, overs: 0, balls: 0, recentBalls: [],
            target: isChaseScenario ? Number(targetScore) : null,
            currentInnings: isChaseScenario ? 2 : 1
        });
    };

    return (
        <div className="bg-slate-900/80 border border-white/10 p-8 rounded-3xl max-w-lg w-full mx-auto text-center backdrop-blur-xl shadow-2xl animate-fade-in-up">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-purple-500/20">
                <Clock className="text-purple-400" size={28} />
            </div>
            <h2 className="text-3xl font-display font-bold mb-2 text-white">Match Settings</h2>
            <p className="text-slate-400 text-sm mb-8">Configure match rules and scenario.</p>

            {/* Overs Selection */}
            <div className="mb-8 text-left">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Overs per Innings</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                    {[2, 5, 10, 20].map(opt => (
                        <button 
                            key={opt}
                            onClick={() => setOvers(opt)}
                            className={`py-2.5 rounded-lg font-bold text-sm transition-all ${overs === opt 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-white/5">
                    <span className="text-xs font-bold text-slate-400 ml-2">Custom:</span>
                    <input 
                        type="number" 
                        min="1"
                        value={overs}
                        onChange={(e) => setOvers(Number(e.target.value))}
                        className="bg-slate-900 border border-white/10 rounded px-3 py-1 text-white w-20 focus:border-purple-500 focus:outline-none text-center font-mono text-sm"
                    />
                    <span className="text-xs text-slate-500">Overs</span>
                </div>
            </div>

            {/* Batting Choice */}
            <div className="mb-8 text-left">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Who Bats {targetScore ? 'Second (Chasing)' : 'First'}?</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setBattingFirst(teamA)}
                        className={`p-4 rounded-xl border transition-all text-left group ${battingFirst === teamA 
                            ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                            : 'border-white/5 bg-slate-800/50 hover:bg-slate-800'}`}
                    >
                        <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Home</div>
                        <div className={`font-bold text-sm ${battingFirst === teamA ? 'text-cyan-400' : 'text-white'}`}>{teamA}</div>
                    </button>
                    <button 
                        onClick={() => setBattingFirst(teamB)}
                        className={`p-4 rounded-xl border transition-all text-left group ${battingFirst === teamB 
                            ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                            : 'border-white/5 bg-slate-800/50 hover:bg-slate-800'}`}
                    >
                        <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Away</div>
                        <div className={`font-bold text-sm ${battingFirst === teamB ? 'text-red-400' : 'text-white'}`}>{teamB}</div>
                    </button>
                </div>
            </div>

            {/* Scenario Mode */}
            <div className="mb-10 text-left bg-slate-950/30 p-4 rounded-xl border border-white/5">
                 <label className="block text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                     <Target size={14} />
                     Scenario Mode (Optional)
                 </label>
                 <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <p className="text-[10px] text-slate-400 mb-2">Set a target score to simulate a run chase immediately.</p>
                        <input 
                            type="number"
                            placeholder="Target Runs (e.g. 150)"
                            value={targetScore}
                            onChange={(e) => setTargetScore(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 placeholder:text-slate-600"
                        />
                    </div>
                 </div>
            </div>

            <button onClick={handleStartMatch} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 group hover:scale-[1.02]">
                <span>{targetScore ? 'Start Chase' : 'Start Match'}</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};
