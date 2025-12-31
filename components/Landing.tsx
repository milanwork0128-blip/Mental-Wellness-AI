
import React from 'react';

interface LandingProps {
  onStart: () => void;
  name?: string;
}

const Landing: React.FC<LandingProps> = ({ onStart, name }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center sage-gradient overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-200/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="z-10 max-w-2xl w-full glass-effect p-12 rounded-[2.5rem] shadow-2xl border border-white/50 animate-slide-up">
        <div className="flex justify-center mb-8">
          <div className="bg-green-100 p-6 rounded-full shadow-inner transform hover:rotate-6 transition-transform">
            <i className="fa-solid fa-leaf text-green-600 text-6xl"></i>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
          Hello, {name || 'there'}
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
          Welcome to Mental Wellness AI
        </h2>
        
        <p className="text-lg text-gray-500 mb-10 leading-relaxed font-light max-w-lg mx-auto">
          Your advanced space for emotional regulation, self-awareness, and practical daily well-being guidance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onStart}
            className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            GET STARTED <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <i className="fa-solid fa-shield-halved mr-2"></i> Private • Calm • Supportive
        </p>
      </div>

      <footer className="absolute bottom-6 w-full text-center text-gray-500 text-xs font-medium">
        Mental Wellness AI &copy; 2024. This system is for guidance, not medical diagnosis.
      </footer>
    </div>
  );
};

export default Landing;
