import { User as FirebaseAuthUser } from 'firebase/auth'; // Import for better type reference

export enum MatchPhase {
    LANDING = 'LANDING',
    SETUP_TEAMS = 'SETUP_TEAMS',
    SETUP_OVERS = 'SETUP_OVERS',
    LIVE = 'LIVE',
    INNINGS_BREAK = 'INNINGS_BREAK',
    RESULT = 'RESULT'
}

export enum WicketType {
    BOWLED = 'Bowled',
    CAUGHT = 'Caught',
    LBW = 'LBW',
    RUN_OUT = 'Run Out',
    STUMPED = 'Stumped',
    HIT_WICKET = 'Hit Wicket',
    RETIRED = 'Retired'
}

// UserProfile now strongly typed for Firebase User properties
export interface UserProfile {
    id: string; // uid
    name: string | null;
    email: string | null;
    avatar: string | null; // photoURL
    provider: string; // e.g., 'google.com', 'facebook.com', 'anonymous'
    isAdmin: boolean; // Flag for Admin Panel access
}

export interface Player {
    id: string;
    name: string;
    role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Keeper';
    photo?: string; // New: Player Photo URL
    stats: {
        runs: number;
        balls: number;
        fours: number;
        sixes: number;
        wickets: number;
        oversBowled: number; 
        runsConceded: number;
        dotBalls: number;
        // Fielding Stats
        catches: number;
        runOuts: number;
        stumpings: number;
        // Milestones
        thirties: number;
        fifties: number;
        hundreds: number;
        fiveWickets: number;
    }
}

export interface Team {
    id: string;
    name: string;
    players: Player[];
    color: string;
    logo?: string;
}

export interface PartnershipStats {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
}

export interface MatchState {
    phase: MatchPhase;
    teamA: Team;
    teamB: Team;
    totalOvers: number;
    
    // Match Config
    battingFirst: string | null; // Team Name
    
    // State
    currentInnings: 1 | 2;
    target: number | null; // Set after innings 1
    winner: string | null; // Team Name
    
    // Live Score Data
    battingTeamName: string;
    bowlingTeamName: string;
    score: number;
    wickets: number;
    overs: number; // Completed overs
    balls: number; // Balls in current over (0-5)
    
    // Player tracking IDs
    strikerId: string;
    nonStrikerId: string;
    currentBowlerId: string;
    
    recentBalls: string[];
    lastCommentary: string;
    
    currentPartnership: PartnershipStats;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}