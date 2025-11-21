
import { GoogleGenAI, Chat } from "@google/genai";
import { MatchState } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Model for Commentary (Fast)
const COMMENTARY_MODEL = 'gemini-2.5-flash';
// Model for Chatbot (Advanced Reasoning)
const CHAT_MODEL = 'gemini-3-pro-preview';
// Model for Image Generation (Nano Banana)
const IMAGE_MODEL = 'gemini-2.5-flash-image';

const FALLBACK_COMMENTARY = [
    "Good line and length.",
    "Played with soft hands.",
    "Driven beautifully!",
    "That's a solid defensive shot.",
    "The fielder cuts it off.",
    "Big appeal! But not given.",
    "Edged... and safe!",
    "Direct hit would have been close!",
    "Excellent running between the wickets.",
    "What a delivery!"
];

const getRandomFallback = () => FALLBACK_COMMENTARY[Math.floor(Math.random() * FALLBACK_COMMENTARY.length)];

export const generateBallCommentary = async (
    matchState: MatchState,
    ballEvent: string,
    extraInfo?: string // E.g., "Caught by Kohli", "Run out by Jadeja"
): Promise<string> => {
    try {
        if (!apiKey) return getRandomFallback();

        // Get active players
        const battingTeam = matchState.battingTeamName === matchState.teamA.name ? matchState.teamA : matchState.teamB;
        const bowlingTeam = matchState.battingTeamName === matchState.teamA.name ? matchState.teamB : matchState.teamA;
        
        const striker = battingTeam.players.find(p => p.id === matchState.strikerId);
        const bowler = bowlingTeam.players.find(p => p.id === matchState.currentBowlerId);

        const prompt = `
        You are a world-class cricket commentator like Harsha Bhogle or Danny Morrison.
        Match: ${matchState.battingTeamName} (${matchState.score}/${matchState.wickets}) vs ${matchState.bowlingTeamName}.
        Striker: ${striker?.name} (${striker?.stats.runs}). Bowler: ${bowler?.name}.
        Event: ${ballEvent}. ${extraInfo ? `Detail: ${extraInfo}` : ''}
        Task: Generate one short, exciting commentary sentence (max 20 words). Use cricket terminology.
        `;

        const response = await ai.models.generateContent({
            model: COMMENTARY_MODEL,
            contents: prompt,
        });

        return response.text || getRandomFallback();
    } catch (error: any) {
        // Handle Quota Exceeded (429) gracefully
        if (error.status === 429 || error.message?.includes('429') || error.toString().includes('Resource has been exhausted')) {
            console.warn("Gemini API Quota Exceeded. Using fallback commentary.");
            return getRandomFallback();
        }
        console.error("Commentary Error:", error);
        return getRandomFallback();
    }
};

export const createChatSession = (): Chat => {
    return ai.chats.create({
        model: CHAT_MODEL,
        config: {
            systemInstruction: `You are CrickPro Assistant, an expert AI cricket coach. 
            Keep answers concise. Use emojis. If the user asks about the live match, give general advice.`
        }
    });
};

export const generateTeamLogo = async (teamName: string): Promise<string | null> => {
    try {
        if (!apiKey) return null;
        
        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: {
                parts: [{ text: `Design a professional, modern, circular mascot logo for a cricket team named "${teamName}". Vector graphics style, vibrant colors, high contrast, dark background.` }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Image Gen Error:", error);
        return null;
    }
};
