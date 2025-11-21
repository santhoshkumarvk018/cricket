import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    Auth, 
    onAuthStateChanged, 
    User, 
    signInWithPopup, 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    signOut,
    signInAnonymously,
    signInWithCustomToken 
} from 'firebase/auth';
import { UserProfile } from '../types';

// Global variables provided by the Canvas environment
declare const __firebase_config: string; // This will now be ignored in initFirebase()
declare const __initial_auth_token: string | undefined;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let currentUserProfile: UserProfile | null = null;

// The Admin UID is a placeholder for a known admin user in the system.
// This is used for conditional rendering of the Admin Panel.
const ADMIN_UID_CHECK = 'dummy-admin-uid-12345'; 

// --- START: HARDCODED CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCnHwtI2oRJ7isHEtKZF4mx21LlmA8TIwk",
    authDomain: "cricket-fe759.firebaseapp.com",
    projectId: "cricket-fe759",
    storageBucket: "cricket-fe759.firebasestorage.app",
    messagingSenderId: "714021026302",
    appId: "1:714021026302:web:28f506d894ca2bf96e28af",
    // measurementId: "G-9W1QH6TQLF" // Not strictly needed for core functions
};
// --- END: HARDCODED CONFIGURATION ---


const initFirebase = () => {
    try {
        // Use the hardcoded config instead of parsing the global variable
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        
        // Note: If you want to use Firestore, the getFirestore() call in db.ts
        // will automatically use this initialized 'app' instance.
        
        console.log("Firebase Initialized using provided configuration.");
    } catch (e) {
        console.error("Failed to initialize Firebase:", e);
        // Ensure auth is null if initialization fails
        auth = null;
    }
};

const mapFirebaseUserToProfile = (user: User | null): UserProfile | null => {
    if (!user) return null;

    const isAdmin = user.uid === ADMIN_UID_CHECK; // Simple hardcoded check
    
    return {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        avatar: user.photoURL,
        // Determine provider, falling back to 'anonymous' if needed
        provider: user.providerData?.[0]?.providerId || (user.isAnonymous ? 'anonymous' : 'custom'),
        isAdmin: isAdmin
    };
};

export const AuthService = {
    // Initializes Firebase and attempts silent sign-in/token sign-in
    initialize: (): Promise<UserProfile | null> => new Promise((resolve) => {
        if (auth) {
            resolve(currentUserProfile);
            return;
        }

        initFirebase();
        if (!auth) {
            resolve(null);
            return;
        }

        // We know 'auth' is not null here
        const currentAuth = auth;

        // Use onAuthStateChanged to handle existing sessions first
        const unsubscribe = onAuthStateChanged(currentAuth, async (user) => {
            unsubscribe(); // Unsubscribe immediately after the first state change
            
            if (user) {
                // User is already signed in (e.g., persistent session)
                currentUserProfile = mapFirebaseUserToProfile(user);
                resolve(currentUserProfile);
            } else {
                // If no user, try custom token sign-in first (required by Canvas environment)
                if (typeof __initial_auth_token !== 'undefined') {
                    try {
                        const credential = await signInWithCustomToken(currentAuth, __initial_auth_token);
                        currentUserProfile = mapFirebaseUserToProfile(credential.user);
                        console.log("Signed in with Custom Token.");
                        resolve(currentUserProfile);
                    } catch (tokenError) {
                        console.error("Custom token sign-in failed. Falling back to anonymous.", tokenError);
                        
                        try {
                            // Fallback to Anonymous
                            const anonCredential = await signInAnonymously(currentAuth);
                            currentUserProfile = mapFirebaseUserToProfile(anonCredential.user);
                            console.log("Signed in Anonymously (Token Fallback).");
                            resolve(currentUserProfile);
                        } catch (anonError) {
                            console.error("Anonymous sign-in failed.", anonError);
                            resolve(null);
                        }
                    }
                } else {
                    // Final fallback: Anonymous sign-in if no custom token is available
                    try {
                         const anonCredential = await signInAnonymously(currentAuth);
                         currentUserProfile = mapFirebaseUserToProfile(anonCredential.user);
                         console.log("Signed in Anonymously.");
                         resolve(currentUserProfile);
                    } catch (anonError) {
                        console.error("Anonymous sign-in failed.", anonError);
                        resolve(null);
                    }
                }
            }
        });
    }),

    getAuthInstance: (): Auth | null => auth,

    // Social Login: Proper Firebase implementation
    login: async (providerName: 'google' | 'facebook'): Promise<UserProfile> => {
        if (!auth) throw new Error("Auth service not initialized. Cannot perform login.");
        
        let provider;
        if (providerName === 'google') {
            provider = new GoogleAuthProvider();
        } else if (providerName === 'facebook') {
            provider = new FacebookAuthProvider();
        } else {
            throw new Error(`Unsupported provider: ${providerName}`);
        }

        // This initiates the Google/Facebook popup flow
        const result = await signInWithPopup(auth, provider); 
        
        // Map the successfully authenticated Firebase User to our local UserProfile type
        const newProfile = mapFirebaseUserToProfile(result.user);
        if (!newProfile) throw new Error("Failed to map user profile after successful login.");
        
        currentUserProfile = newProfile;
        return newProfile;
    },

    // Logout
    logout: async () => {
        if (!auth) return;
        
        // Sign out the current user
        await signOut(auth);
        
        // Clear local profile storage
        currentUserProfile = null;

        // Re-sign in anonymously after sign out to maintain a necessary session ID for DB operations
        try {
            const anonCredential = await signInAnonymously(auth);
            currentUserProfile = mapFirebaseUserToProfile(anonCredential.user);
        } catch(e) {
             console.error("Failed to re-sign in anonymously after logout.", e);
        }
    },

    getUser: (): UserProfile | null => currentUserProfile,

    isAuthenticated: (): boolean => !!currentUserProfile && !currentUserProfile.isAdmin
};