import React from 'react';

export const Stadium3D: React.FC = () => {
    return (
        <div className="relative w-full h-64 md:h-80 overflow-hidden flex items-center justify-center perspective-1000 my-4">
            {/* 3D Ground Plane */}
            <div 
                className="absolute w-[120%] h-[150%] bg-gradient-to-b from-emerald-900 to-green-800 transform rotate-x-60 origin-bottom rounded-[50%] border-4 border-emerald-500/30 shadow-2xl shadow-emerald-900/50"
                style={{ transform: 'rotateX(50deg) scale(0.9)' }}
            >
                {/* Pitch */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-64 bg-[#d2b48c] border border-amber-200/20 opacity-90">
                    <div className="w-full h-full flex flex-col justify-between py-2 px-1">
                        {/* Stumps Area Top */}
                        <div className="w-full h-1 bg-white/50"></div>
                        {/* Stumps Area Bottom */}
                        <div className="w-full h-1 bg-white/50"></div>
                    </div>
                </div>

                {/* 30 Yard Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border-2 border-dashed border-white/20"></div>

                {/* Fielders (Dots) */}
                <div className="absolute top-[30%] left-[20%] w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_#60a5fa]"></div>
                <div className="absolute top-[30%] right-[20%] w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_#60a5fa]"></div>
                <div className="absolute bottom-[40%] left-[10%] w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_#60a5fa]"></div>
                <div className="absolute bottom-[20%] right-[30%] w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_#60a5fa]"></div>
            </div>
            
            {/* Overlay Gradient for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
};