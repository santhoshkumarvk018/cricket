import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

export const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'intro', role: 'model', text: 'Hi! I am your CrickPro Assistant. Ask me anything about strategy, rules, or player stats!', timestamp: Date.now() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chatSessionRef.current) {
            chatSessionRef.current = createChatSession();
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || !chatSessionRef.current) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const result = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
            
            let fullResponse = "";
            const botMsgId = (Date.now() + 1).toString();
            
            // Add placeholder for streaming
            setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);

            for await (const chunk of result) {
                 const c = chunk as GenerateContentResponse;
                 const text = c.text || "";
                 fullResponse += text;
                 
                 setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
                 ));
            }
        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I'm having trouble connecting to the stadium network right now.", timestamp: Date.now() }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            
            {/* Chat Window */}
            <div className={`
                pointer-events-auto
                w-80 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right
                ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 mb-0'}
            `}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-4 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-cyan-400" />
                        <h3 className="font-display font-bold text-white">AI Assistant</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] rounded-xl p-3 text-sm
                                ${msg.role === 'user' 
                                    ? 'bg-cyan-600 text-white rounded-br-none' 
                                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 rounded-xl p-3 rounded-bl-none flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/10 bg-slate-900">
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about strategy..."
                            className="flex-1 bg-slate-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !inputValue.trim()}
                            className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-500 disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 text-center">Powered by gemini-3-pro-preview</div>
                </div>
            </div>

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-full shadow-lg shadow-cyan-500/40 hover:scale-105 transition-transform group"
            >
                {isOpen ? <X className="text-white" /> : <MessageCircle className="text-white group-hover:animate-pulse" />}
            </button>
        </div>
    );
};