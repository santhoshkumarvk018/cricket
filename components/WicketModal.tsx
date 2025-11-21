
import React, { useState } from 'react';
import { WicketType, Player, Team } from '../types';
import { X, UserMinus, Shield } from 'lucide-react';

interface WicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (type: WicketType, fielderId?: string) => void;
    bowlingTeam: Team;
    battingTeam: Team;
    strikerId: string;
}

export const WicketModal: React.FC<WicketModalProps> = ({ 
    isOpen, onClose, onConfirm, bowlingTeam, battingTeam, strikerId 
}) => {
    const [wicketType, setWicketType] = useState<WicketType>(WicketType.CAUGHT);
    const [fielderId, setFielderId] = useState<string>('');

    if (!isOpen) return null;

    const striker = battingTeam.players.find(p => p.id === strikerId);
    const needsFielder = [WicketType.CAUGHT, WicketType.RUN_OUT, WicketType.STUMPED].includes(wicketType);

    const handleSubmit = () => {
        onConfirm(wicketType, fielderId);
        // Reset
        setWicketType(WicketType.CAUGHT);
        setFielderId('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                        <span className="w-8 h-8 bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center">
                            <UserMinus size={18} />
                        </span>
                        Fall of Wicket
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Who is out */}
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 text-center">
                         <span className="text-xs text-slate-500 uppercase tracking-wider">Dismissed Player</span>
                         <div className="text-lg font-bold text-white mt-1">{striker?.name}</div>
                    </div>

                    {/* Wicket Type */}
                    <div>
                        <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">How Out?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(WicketType).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setWicketType(type)}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                        wicketType === type 
                                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/50' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fielder Selection */}
                    {needsFielder && (
                        <div className="animate-fade-in">
                            <label className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Shield size={12} />
                                Select Fielder
                            </label>
                            <select
                                value={fielderId}
                                onChange={(e) => setFielderId(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none text-sm"
                            >
                                <option value="">-- Select Player --</option>
                                {bowlingTeam.players.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button 
                        onClick={handleSubmit}
                        disabled={needsFielder && !fielderId}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        Confirm Wicket
                    </button>
                </div>
            </div>
        </div>
    );
};
