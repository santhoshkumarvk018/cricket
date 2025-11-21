import React, { useState, useEffect, useCallback } from 'react';
import { MatchState, MatchPhase, Team, Player, WicketType, UserProfile } from './types';
import { TeamSetup, OversSetup } from './components/SetupWizard';
import { ScoreCard } from './components/ScoreCard';
import { StatsBoard } from './components/StatsBoard';
import { FullScorecard } from './components/FullScorecard';
import { LandingPage } from './components/LandingPage';
import { generateBallCommentary } from './services/geminiService';
import { ChatBot } from './components/ChatBot';
import { WicketModal } from './components/WicketModal';
import { DB } from './services/db';
import { AuthService } from './services/auth';
import { LoginPage } from './components/LoginPage';
import { PlayerHub } from './components/PlayerHub';
import { MilestoneCelebration } from './components/MilestoneCelebration';
import { Mic, ArrowLeft, Trophy, RotateCcw, X, FileText, Plus, Crown, Star, Shield, LogOut, Loader, MessageSquare } from 'lucide-react';

// Admin Panel Component (Inside App.tsx for single-file adherence)
const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [messages, setMessages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            const msgs = await DB.getPublicMessages();
            setMessages(msgs);
            setIsLoading(false);
        };
        fetchMessages();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12">
            <div className="max-w-4xl mx-auto bg-slate-900/80 rounded-3xl p-8 border border-red-500/30 shadow-2xl shadow-red-900/50">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-4xl font-display font-black text-red-400 flex items-center gap-3">
                        <Shield size={36} className="text-red-500 fill-red-500/10" />
                        System Admin Panel
                    </h1>
                    <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                <p className="text-slate-400 mb-6 border-b border-white/5 pb-4">
                    This panel is exclusive to the system environment and provides access to public data and administrative tools.
                </p>
                
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-cyan-400" /> Public Messages
                </h2>
                
                <div className="bg-slate-950/50 p-4 rounded-xl max-h-96 overflow-y-auto border border-white/10">
                    {isLoading ? (
                        <div className="text-center py-10 text-slate-500 flex items-center justify-center gap-2">
                            <Loader size={16} className="animate-spin" /> Loading Messages...
                        </div>
                    ) : messages.length > 0 ? (
                        <ul className="space-y-3">
                            {messages.map((msg, index) => (
                                <li key={index} className="bg-slate-800 p-3 rounded-lg text-sm text-slate-300 break-words border-l-4 border-cyan-500">
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 italic text-center py-5">No public data found in the 'messages' collection.</p>
                    )}
                </div>
                
                {/* Placeholder for other admin tools */}
                <div className="mt-8 pt-4 border-t border-white/10">
                    <h3 className="text-xl font-bold text-white mb-3">User Management Overview</h3>
                    <div className="flex gap-4">
                        <div className="bg-slate-800 p-4 rounded-xl flex-1 text-center">
                            <div className="text-4xl font-display font-bold text-cyan-400">1</div>
                            <div className="text-sm text-slate-500">Total Teams</div>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-xl flex-1 text-center">
                            <div className="text-4xl font-display font-bold text-cyan-400">11</div>
                            <div className="text-sm text-slate-500">Total Players</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const INITIAL_STATE: MatchState = {
    phase: MatchPhase.LANDING,
    teamA: { id: '1', name: '', players: [], color: '' },
    teamB: { id: '2', name: '', players: [], color: '' },
    totalOvers: 5,
    battingFirst: null,
    currentInnings: 1,
    target: null,
    winner: null,
    battingTeamName: '',
    bowlingTeamName: '',
    score: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    strikerId: '',
    nonStrikerId: '',
    currentBowlerId: '',
    recentBalls: [],
    lastCommentary: "Welcome to the match! The players are taking the field.",
    currentPartnership: { runs: 0, balls: 0, fours: 0, sixes: 0 }
};


const App: React.FC = () => {
    // Auth State
    const [authReady, setAuthReady] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showPlayerHub, setShowPlayerHub] = useState(false);

    // App State
    const [matchState, setMatchState] = useState<MatchState>(INITIAL_STATE);
    const [activeTab, setActiveTab] = useState<'live' | 'scorecard'>('live');
    const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
    
    // Modals & Celebrations
    const [wicketModalOpen, setWicketModalOpen] = useState(false);
    const [milestoneEvent, setMilestoneEvent] = useState<{ player: Player, type: '50' | '100' | '5W' | 'MOM' } | null>(null);
    
    // Check for Admin Mode (System Only: URL parameter + System Token check)
    const isAdminMode = window.location.search.includes('admin=true') && typeof (window as any).__initial_auth_token !== 'undefined';
    
    // Load Data and Initialize Firebase
    const loadUserData = useCallback(async () => {
        const savedMatch = await DB.loadMatchState();
        if (savedMatch) setMatchState(savedMatch);
        else setMatchState(INITIAL_STATE);
        
        const teams = await DB.getTeams();
        // Simple logic to inject teams back into state if match is in setup phase
        if (matchState.phase === MatchPhase.SETUP_TEAMS && teams.length === 2) {
             setMatchState(prev => ({ ...prev, teamA: teams[0], teamB: teams[1] }));
        }
    }, [matchState.phase]);


    useEffect(() => {
        // Step 1: Initialize Firebase and check authentication status
        AuthService.initialize().then(user => {
            setUserProfile(user);
            setAuthReady(true);
        }).catch(e => {
            console.error("Firebase init failed:", e);
            setAuthReady(true); // Still set ready to show login page
        });
    }, []);
    
    // Step 2: Load user data (match state, teams) once authentication is confirmed
    useEffect(() => {
        if (userProfile?.id && authReady) {
            console.log("User Authenticated, loading data...");
            loadUserData();
        } else if (authReady && !userProfile) {
            // User not signed in (should be anonymous or guest after init)
             console.log("Auth ready, no specific user profile.");
        }
    }, [authReady, userProfile?.id, loadUserData]);


    // Auto-save logic to Firestore
    useEffect(() => {
        if (userProfile?.id && matchState.phase !== MatchPhase.LANDING) {
            DB.saveMatchState(matchState);
            DB.updateTeam(matchState.teamA);
            DB.updateTeam(matchState.teamB);
        }
    }, [matchState, userProfile?.id]);


    // --- Auth Handlers ---
    const handleLogin = async (provider: 'google' | 'facebook'): Promise<UserProfile | null> => {
        const user = await AuthService.login(provider);
        setUserProfile(user);
        return user;
    };

    const handleGuestLogin = () => {
        // Anonymous login already handled by AuthService.initialize(), just need to trigger data load if needed
        const user = AuthService.getUser();
        if (user) setUserProfile(user);
    };

    const handleLogout = async () => {
        await AuthService.logout();
        setUserProfile(AuthService.getUser());
        // Full reset of match state
        setMatchState(INITIAL_STATE);
        setShowPlayerHub(false);
        setActiveTab('live');
        setWicketModalOpen(false);
        setMilestoneEvent(null);
        // Redirect to ensure non-admin view
        if (isAdminMode) window.location.href = window.location.origin;
    };

    // --- Core Match Logic (Keeping the same) ---
    const getPlayer = (id: string): Player | undefined => {
        const p1 = matchState.teamA.players.find((p: Player) => p.id === id);
        if (p1) return p1;
        return matchState.teamB.players.find((p: Player) => p.id === id);
    };

    useEffect(() => {
        if (matchState.phase === MatchPhase.LIVE) {
            if (!matchState.strikerId) {
                const battingTeam = matchState.battingTeamName === matchState.teamA.name ? matchState.teamA : matchState.teamB;
                const bowlingTeam = matchState.battingTeamName === matchState.teamA.name ? matchState.teamB : matchState.teamA;
                
                if (battingTeam.players.length >= 2 && bowlingTeam.players.length >= 1) {
                    setMatchState((prev: MatchState) => ({
                        ...prev,
                        strikerId: battingTeam.players[0].id,
                        nonStrikerId: battingTeam.players[1].id,
                        currentBowlerId: bowlingTeam.players[bowlingTeam.players.length - 1].id, 
                        currentPartnership: { runs: 0, balls: 0, fours: 0, sixes: 0 }
                    }));
                }
            }
        }
    }, [matchState.phase, matchState.battingTeamName]);

    const handleScoring = async (runs: number, isWicket: boolean, eventLabel: string, wicketInfo?: { type: WicketType, fielderId?: string }) => {
        if (matchState.phase !== MatchPhase.LIVE) return;

        let newBalls = matchState.balls + 1;
        let newOvers = matchState.overs;
        let isOverComplete = false;
        if (newBalls === 6) {
            newOvers += 1;
            newBalls = 0;
            isOverComplete = true;
        }

        const battingTeam = matchState.battingTeamName === matchState.teamA.name ? matchState.teamA : matchState.teamB;
        const bowlingTeam = matchState.battingTeamName === matchState.teamA.name ? matchState.teamB : matchState.teamA;

        const updatedBattingPlayers = battingTeam.players.map((p: Player) => ({ ...p, stats: { ...p.stats } }));
        const updatedBowlingPlayers = bowlingTeam.players.map((p: Player) => ({ ...p, stats: { ...p.stats } }));

        // --- UPDATE STRIKER STATS ---
        const striker = updatedBattingPlayers.find((p: Player) => p.id === matchState.strikerId);
        if (striker) {
            const prevRuns = striker.stats.runs;
            striker.stats.runs += runs;
            striker.stats.balls += 1;
            if (runs === 4) striker.stats.fours += 1;
            if (runs === 6) striker.stats.sixes += 1;
            if (runs === 0) striker.stats.dotBalls += 1;

            if (prevRuns < 30 && striker.stats.runs >= 30) striker.stats.thirties += 1;
            if (prevRuns < 50 && striker.stats.runs >= 50) {
                striker.stats.fifties += 1;
                setMilestoneEvent({ player: striker, type: '50' });
            }
            if (prevRuns < 100 && striker.stats.runs >= 100) {
                striker.stats.hundreds += 1;
                setMilestoneEvent({ player: striker, type: '100' });
            }
        }

        // --- UPDATE BOWLER STATS ---
        const bowler = updatedBowlingPlayers.find((p: Player) => p.id === matchState.currentBowlerId);
        if (bowler) {
            const prevWickets = bowler.stats.wickets;
            bowler.stats.runsConceded += runs;
            if (runs === 0 && !isWicket) bowler.stats.dotBalls += 1;
            
            if (isWicket && wicketInfo?.type !== WicketType.RUN_OUT) {
                bowler.stats.wickets += 1;
                if (prevWickets < 5 && bowler.stats.wickets === 5) {
                    bowler.stats.fiveWickets += 1;
                    setMilestoneEvent({ player: bowler, type: '5W' });
                }
            }
        }

        // --- UPDATE FIELDER STATS ---
        if (isWicket && wicketInfo?.fielderId) {
            const fielder = updatedBowlingPlayers.find((p: Player) => p.id === wicketInfo.fielderId);
            if (fielder) {
                if (wicketInfo.type === WicketType.CAUGHT) fielder.stats.catches = (fielder.stats.catches || 0) + 1;
                if (wicketInfo.type === WicketType.RUN_OUT) fielder.stats.runOuts = (fielder.stats.runOuts || 0) + 1;
                if (wicketInfo.type === WicketType.STUMPED) fielder.stats.stumpings = (fielder.stats.stumpings || 0) + 1;
            }
        }

        const updatedBattingTeam: Team = { ...battingTeam, players: updatedBattingPlayers };
        const updatedBowlingTeam: Team = { ...bowlingTeam, players: updatedBowlingPlayers };

        // --- UPDATE PARTNERSHIP ---
        let newPartnership = { ...matchState.currentPartnership };
        if (isWicket) {
            newPartnership = { runs: 0, balls: 0, fours: 0, sixes: 0 };
        } else {
            newPartnership.runs += runs;
            newPartnership.balls += 1;
            if (runs === 4) newPartnership.fours += 1;
            if (runs === 6) newPartnership.sixes += 1;
        }

        // --- PLAYER ROTATION ---
        let nextStrikerId = matchState.strikerId;
        let nextNonStrikerId = matchState.nonStrikerId;
        let nextWickets = matchState.wickets + (isWicket ? 1 : 0);

        if (isWicket) {
            const currentStrikerIdx = updatedBattingPlayers.findIndex((p: Player) => p.id === matchState.strikerId);
            const currentNonStrikerIdx = updatedBattingPlayers.findIndex((p: Player) => p.id === matchState.nonStrikerId);
            const maxIndex = Math.max(currentStrikerIdx, currentNonStrikerIdx);
            
            if (currentStrikerIdx !== -1 && currentNonStrikerIdx !== -1 && maxIndex + 1 < updatedBattingPlayers.length) {
                const nextBatter = updatedBattingPlayers[maxIndex + 1];
                nextStrikerId = (matchState.strikerId === striker?.id) ? nextBatter.id : matchState.strikerId;
                nextNonStrikerId = (matchState.nonStrikerId === striker?.id) ? nextBatter.id : matchState.nonStrikerId;
            } else {
                nextStrikerId = ""; 
            }
        } else {
            if (runs % 2 !== 0) {
                [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
            }
        }

        if (isOverComplete) {
            [nextStrikerId, nextNonStrikerId] = [nextNonStrikerId, nextStrikerId];
        }

        const currentScore = matchState.score + runs;

        // --- PHASE CHECK ---
        let nextPhase: MatchPhase = matchState.phase;
        let winnerName: string | null = null;
        let targetScore = matchState.target;
        
        const maxWickets = updatedBattingPlayers.length - 1;

        if (matchState.currentInnings === 2) {
            if (targetScore !== null && currentScore >= targetScore) {
                nextPhase = MatchPhase.RESULT;
                winnerName = matchState.battingTeamName;
            } else if (nextWickets >= maxWickets || (isOverComplete && newOvers >= matchState.totalOvers)) {
                if (currentScore < (targetScore || 0)) {
                    nextPhase = MatchPhase.RESULT;
                    winnerName = matchState.bowlingTeamName;
                } else {
                    nextPhase = MatchPhase.RESULT;
                    winnerName = "TIE";
                }
            }
        } else if (matchState.currentInnings === 1) {
             if (nextWickets >= maxWickets || (isOverComplete && newOvers >= matchState.totalOvers)) {
                nextPhase = MatchPhase.INNINGS_BREAK;
                targetScore = currentScore + 1;
             }
        }

        const currentBowlerIdx = updatedBowlingPlayers.findIndex((p: Player) => p.id === matchState.currentBowlerId);
        const nextBowlerId = isOverComplete 
            ? updatedBowlingPlayers.find((p: Player, i: number) => i !== currentBowlerIdx)?.id || matchState.currentBowlerId 
            : matchState.currentBowlerId;

        const newState: MatchState = {
            ...matchState,
            teamA: updatedBattingTeam.name === matchState.teamA.name ? updatedBattingTeam : updatedBowlingTeam,
            teamB: updatedBattingTeam.name === matchState.teamB.name ? updatedBattingTeam : updatedBowlingTeam,
            score: currentScore,
            wickets: nextWickets,
            balls: newBalls,
            overs: newOvers,
            recentBalls: [eventLabel, ...matchState.recentBalls].slice(0, 8),
            strikerId: nextStrikerId,
            nonStrikerId: nextNonStrikerId,
            currentPartnership: newPartnership,
            phase: nextPhase,
            target: targetScore,
            winner: winnerName,
            currentBowlerId: nextBowlerId
        };

        setMatchState(newState);

        if (nextPhase === MatchPhase.LIVE) {
            setIsGeneratingCommentary(true);
            try {
                let extraInfo = "";
                if (isWicket && wicketInfo) {
                    const fielderName = updatedBowlingPlayers.find((p: Player) => p.id === wicketInfo.fielderId)?.name;
                    extraInfo = `${wicketInfo.type}${fielderName ? ` by ${fielderName}` : ''}`;
                }
                await generateBallCommentary(newState, eventLabel, extraInfo).then((commentary: string) => {
                     setMatchState((prev: MatchState) => ({ ...prev, lastCommentary: commentary }));
                });
            } finally {
                setIsGeneratingCommentary(false);
            }
        }
    };

    const calculateManOfTheMatch = (state: MatchState): Player | null => {
        const allPlayers = [...state.teamA.players, ...state.teamB.players];
        if (allPlayers.length === 0) return null;

        let bestPlayer = allPlayers[0];
        let maxPoints = -1;

        allPlayers.forEach((p: Player) => {
            const points = (p.stats.runs * 1) + (p.stats.wickets * 20) + (p.stats.catches * 10) + (p.stats.runOuts * 10);
            if (points > maxPoints) {
                maxPoints = points;
                bestPlayer = p;
            }
        });

        return bestPlayer;
    };

    const handleWicketClick = () => setWicketModalOpen(true);

    const confirmWicket = (type: WicketType, fielderId?: string) => {
        setWicketModalOpen(false);
        handleScoring(0, true, 'W', { type, fielderId });
    };

    const startSecondInnings = () => {
        setMatchState((prev: MatchState) => ({
            ...prev,
            phase: MatchPhase.LIVE,
            currentInnings: 2,
            battingTeamName: prev.bowlingTeamName,
            bowlingTeamName: prev.battingTeamName,
            score: 0, wickets: 0, overs: 0, balls: 0, recentBalls: [],
            strikerId: '', nonStrikerId: '', currentBowlerId: '',
            currentPartnership: { runs: 0, balls: 0, fours: 0, sixes: 0 }
        }));
    };

    const resetMatch = () => {
        setMatchState(INITIAL_STATE);
        DB.clearMatch();
    };

    const swapPlayer = (role: 'striker' | 'nonStriker' | 'bowler') => {
         console.log("Swap requested for", role);
         // Simplified rotation for demonstration
         if (role === 'striker' || role === 'nonStriker') {
             setMatchState((prev: MatchState) => ({
                 ...prev,
                 strikerId: prev.nonStrikerId,
                 nonStrikerId: prev.strikerId
             }));
         }
    };


    // --- RENDERERS ---

    if (!authReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
                <Loader size={32} className="animate-spin text-cyan-400" />
                <span className="ml-3 text-lg">Initializing Firebase...</span>
            </div>
        );
    }
    
    // Admin Panel Check (Highest Priority)
    if (isAdminMode && userProfile?.isAdmin) {
        return <AdminPanel onLogout={handleLogout} />;
    }

    if (!userProfile || userProfile.provider === 'anonymous') {
        return <LoginPage onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
    }
    
    // Main App flow
    if (showPlayerHub) {
        return <PlayerHub onBack={() => setShowPlayerHub(false)} />;
    }

    if (matchState.phase === MatchPhase.LANDING) {
        return <LandingPage 
            onStart={() => setMatchState((prev: MatchState) => ({ ...prev, phase: MatchPhase.SETUP_TEAMS }))} 
            onOpenStats={() => setShowPlayerHub(true)}
            onLogout={handleLogout}
        />;
    }

    if (matchState.phase === MatchPhase.SETUP_TEAMS) {
        return <TeamSetup onComplete={(updates: Partial<MatchState>) => setMatchState((prev: MatchState) => ({ ...prev, ...updates }))} />;
    }

    if (matchState.phase === MatchPhase.SETUP_OVERS) {
        return <OversSetup 
            teamA={matchState.teamA.name} 
            teamB={matchState.teamB.name} 
            onComplete={(updates: Partial<MatchState>) => setMatchState((prev: MatchState) => ({ ...prev, ...updates }))} 
        />;
    }

    const striker = getPlayer(matchState.strikerId);
    const nonStriker = getPlayer(matchState.nonStrikerId);
    const bowler = getPlayer(matchState.currentBowlerId);

    const mom = matchState.phase === MatchPhase.RESULT ? calculateManOfTheMatch(matchState) : null;
    
    // Determine if the Reset button should be visible (i.e., we are past setup)
    const isPastSetup = matchState.phase === MatchPhase.LIVE || matchState.phase === MatchPhase.INNINGS_BREAK || matchState.phase === MatchPhase.RESULT;

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Simplified condition: show Reset button if past setup phases */}
                    {isPastSetup && (
                        <button 
                            onClick={resetMatch} 
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                            title="Reset Match"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="font-display font-bold text-xl text-white tracking-tight">
                        CrickPro <span className="text-cyan-400">3D</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {matchState.phase === MatchPhase.LIVE && (
                        <>
                           <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-xs text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Live Sync
                           </div>
                           <button onClick={() => setActiveTab(activeTab === 'live' ? 'scorecard' : 'live')} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10">
                                {activeTab === 'live' ? 'View Scorecard' : 'Back to Match'}
                           </button>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-4xl mx-auto px-4 pt-6">
                
                {/* PHASE: RESULT */}
                {matchState.phase === MatchPhase.RESULT && (
                    <div className="text-center py-10 animate-fade-in-up">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(250,204,21,0.4)] animate-bounce">
                            <Trophy size={48} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-display font-black text-white mb-2 uppercase tracking-tight">
                            {matchState.winner === "TIE" ? "It's a Tie!" : `${matchState.winner} Wins!`}
                        </h2>
                        <p className="text-slate-400 mb-8">Match Completed successfully.</p>
                        
                        {mom && (
                            <div className="max-w-sm mx-auto bg-slate-900/80 border border-yellow-500/30 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-50"></div>
                                <div className="relative z-10">
                                    <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                        <Crown size={14} /> Player of the Match
                                    </div>
                                    {mom.photo ? (
                                        <img src={mom.photo} alt={mom.name || 'Player'} className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-yellow-500/50 object-cover shadow-lg" />
                                    ) : (
                                        <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-yellow-500/30">
                                            <Star className="text-yellow-500" size={32} />
                                        </div>
                                    )}
                                    <div className="text-2xl font-bold text-white">{mom.name}</div>
                                    <div className="text-sm text-slate-400 mt-1">
                                        {mom.stats.runs} Runs • {mom.stats.wickets} Wickets
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button onClick={resetMatch} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                                <RotateCcw size={18} /> Start New Match
                            </button>
                            <button onClick={() => setActiveTab('scorecard')} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-cyan-900/50">
                                <FileText size={18} /> Full Scorecard
                            </button>
                        </div>
                    </div>
                )}

                {/* PHASE: INNINGS BREAK */}
                {matchState.phase === MatchPhase.INNINGS_BREAK && (
                    <div className="text-center py-20 animate-fade-in">
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Innings Break</h2>
                        <div className="text-xl text-slate-300 mb-8">
                            Target: <span className="text-white font-bold text-3xl">{matchState.target}</span>
                        </div>
                        <button 
                            onClick={startSecondInnings}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
                        >
                            Start 2nd Innings
                        </button>
                    </div>
                )}

                {/* LIVE MATCH VIEW */}
                {(matchState.phase === MatchPhase.LIVE || matchState.phase === MatchPhase.RESULT) && (
                    <>
                        {/* Scorecard Header */}
                        {activeTab === 'live' && <ScoreCard matchState={matchState} />}

                        {/* Commentary Bar */}
                        {activeTab === 'live' && matchState.phase === MatchPhase.LIVE && (
                             <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 mb-6 backdrop-blur-sm flex items-start gap-3 animate-fade-in">
                                <div className="bg-cyan-500/10 p-2 rounded-lg">
                                    <Mic size={18} className="text-cyan-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">AI Commentary</div>
                                    <p className="text-slate-200 text-sm italic leading-relaxed">
                                        "{matchState.lastCommentary}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tab Content */}
                        {activeTab === 'live' && matchState.phase === MatchPhase.LIVE ? (
                            <>
                                <StatsBoard 
                                    matchState={matchState} 
                                    players={{ striker, nonStriker, bowler }} 
                                    onSwapPlayer={swapPlayer}
                                />

                                {/* Control Panel */}
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-8">
                                    {[0, 1, 2, 3, 4, 6].map((runs: number) => (
                                        <button
                                            key={runs}
                                            onClick={() => handleScoring(runs, false, runs.toString())}
                                            className={`
                                                h-16 rounded-xl font-display font-bold text-2xl shadow-lg transition-transform active:scale-95 flex flex-col items-center justify-center
                                                ${runs === 4 
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                                    : runs === 6 
                                                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                                                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/5'}
                                            `}
                                        >
                                            {runs}
                                            <span className="text-[10px] font-sans font-normal text-white/60">{runs === 4 ? 'FOUR' : runs === 6 ? 'SIX' : 'RUNS'}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <button 
                                        onClick={handleWicketClick}
                                        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white h-14 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-red-900/30 active:scale-[0.98] transition-all"
                                    >
                                        Wicket !
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => handleScoring(1, false, 'WD')} className="bg-slate-800 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-14 rounded-xl font-bold text-sm">Wide</button>
                                        <button onClick={() => handleScoring(1, false, 'NB')} className="bg-slate-800 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-14 rounded-xl font-bold text-sm">No Ball</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <FullScorecard matchState={matchState} />
                        )}
                    </>
                )}
            </main>

            {/* Floating Elements */}
            <ChatBot />
            <WicketModal 
                isOpen={wicketModalOpen} 
                onClose={() => setWicketModalOpen(false)} 
                onConfirm={confirmWicket}
                battingTeam={matchState.battingTeamName === matchState.teamA.name ? matchState.teamA : matchState.teamB}
                bowlingTeam={matchState.battingTeamName === matchState.teamA.name ? matchState.teamB : matchState.teamA}
                strikerId={matchState.strikerId}
            />
            
            {milestoneEvent && (
                <MilestoneCelebration 
                    player={milestoneEvent.player} 
                    type={milestoneEvent.type} 
                    onClose={() => setMilestoneEvent(null)} 
                />
            )}
        </div>
    );
};

export default App;