import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    Firestore,
    getDocs,
    collection,
    query,
    deleteDoc
} from 'firebase/firestore';
import { getApps } from 'firebase/app';
import { AuthService } from './auth';
import { Team, MatchState } from '../types';

// Global variables provided by the Canvas environment
declare const __app_id: string;

const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-crickpro';
const PUBLIC_BASE_PATH = `artifacts/${APP_ID}/public/data`;

let db: Firestore | null = null;

const getDb = (): Firestore | null => {
    if (!db && getApps().length > 0) {
        db = getFirestore();
    }
    return db;
};

// Helper to get the correct Firestore document path for the current user/app
const getPrivateDocRef = (collectionName: string, documentId: string) => {
    const firestore = getDb();
    const user = AuthService.getUser();
    const userId = user?.id || 'guest_unauthenticated'; 

    if (!firestore) return null;

    // Path: /artifacts/{appId}/users/{userId}/{collectionName}/{documentId}
    const path = `artifacts/${APP_ID}/users/${userId}/${collectionName}`;
    return doc(firestore, path, documentId);
};

// Private data collections
const COLLECTION_TEAMS = 'teams';
const COLLECTION_MATCH = 'match';


export const DB = {
    // --- TEAMS MANAGEMENT (Private Data) ---
    
    // Saves/Updates a list of teams
    saveTeams: async (teams: Team[]): Promise<void> => {
        const firestore = getDb();
        if (!firestore) return;

        // For simplicity, save all teams under a single document keyed by the user ID.
        // In a complex app, each team would be its own document in a 'teams' collection.
        const user = AuthService.getUser();
        const userId = user?.id;
        if (!userId) return;

        try {
            const teamDataRef = getPrivateDocRef(COLLECTION_TEAMS, 'all_teams');
            if (teamDataRef) {
                await setDoc(teamDataRef, { teams: teams, userId: userId }, { merge: true });
            }
        } catch (e) {
            console.error("Firestore: Failed to save teams", e);
        }
    },

    // Gets all teams for the current user
    getTeams: async (): Promise<Team[]> => {
        const firestore = getDb();
        if (!firestore) return [];
        
        try {
            const teamDataRef = getPrivateDocRef(COLLECTION_TEAMS, 'all_teams');
            if (teamDataRef) {
                const docSnap = await getDoc(teamDataRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    return data.teams as Team[] || [];
                }
            }
            return [];
        } catch (e) {
            console.error("Firestore: Failed to get teams", e);
            return [];
        }
    },

    // Updates a single team by ID within the 'all_teams' document
    updateTeam: async (updatedTeam: Team): Promise<void> => {
        const teams = await DB.getTeams();
        const idx = teams.findIndex(t => t.id === updatedTeam.id);
        if (idx !== -1) {
            teams[idx] = updatedTeam;
        } else {
            teams.push(updatedTeam);
        }
        await DB.saveTeams(teams);
    },

    // --- MATCH STATE MANAGEMENT (Private Data) ---
    
    // Save current match state
    saveMatchState: async (state: MatchState): Promise<void> => {
        const firestore = getDb();
        if (!firestore) return;

        try {
            const matchRef = getPrivateDocRef(COLLECTION_MATCH, 'current_match');
            if (matchRef) {
                 await setDoc(matchRef, state as any, { merge: true }); // Use 'as any' for partial state safety
            }
        } catch (e) {
            console.error("Firestore: Failed to save match state", e);
        }
    },

    // Load match state
    loadMatchState: async (): Promise<MatchState | null> => {
        const firestore = getDb();
        if (!firestore) return null;

        try {
            const matchRef = getPrivateDocRef(COLLECTION_MATCH, 'current_match');
            if (matchRef) {
                const docSnap = await getDoc(matchRef);
                if (docSnap.exists()) {
                    return docSnap.data() as MatchState;
                }
            }
            return null;
        } catch (e) {
            console.error("Firestore: Failed to load match state", e);
            return null;
        }
    },

    // Clear match state
    clearMatch: async (): Promise<void> => {
        const firestore = getDb();
        if (!firestore) return;

        try {
            const matchRef = getPrivateDocRef(COLLECTION_MATCH, 'current_match');
            if (matchRef) {
                await deleteDoc(matchRef);
            }
        } catch (e) {
            console.error("Firestore: Failed to clear match state", e);
        }
    },
    
    // --- ADMIN / GLOBAL DATA (Public Data) ---
    getPublicMessages: async (): Promise<string[]> => {
        const firestore = getDb();
        if (!firestore) return [];
        try {
            const publicCollectionRef = collection(firestore, PUBLIC_BASE_PATH, 'messages');
            const q = query(publicCollectionRef);
            const querySnapshot = await getDocs(q);
            const messages: string[] = [];
            querySnapshot.forEach((doc) => {
                // Assuming documents have a 'text' field
                messages.push(doc.data().text || 'Message without text field');
            });
            return messages;
        } catch (e) {
             console.error("Firestore: Failed to get public messages", e);
             return [];
        }
    }
};