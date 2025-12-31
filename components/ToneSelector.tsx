
import React from 'react';
import { TonePreference } from '../types';

interface ToneSelectorProps {
  current: TonePreference;
  onUpdate: (tone: TonePreference) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ current, onUpdate }) => {
  const tones = [
    { value: TonePreference.CalmGentle, icon: 'fa-feather', desc: 'Soft & Reassuring' },
    { value: TonePreference.DirectPractical, icon: 'fa-bolt', desc: 'Clear & Minimal' },
    { value: TonePreference.Motivational, icon: 'fa-fire-flame-curved', desc: 'Uplifting & Energy' },
  ];

  return (
    <div className="space-y-3">
      {tones.map((t) => (
        <button
          key={t.value}
          onClick={() => onUpdate(t.value)}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border text-left ${
            current === t.value 
            ? 'bg-green-600 border-green-600 text-white shadow-lg' 
            : 'bg-white border-slate-100 text-slate-600 hover:border-green-200 hover:bg-green-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            current === t.value ? 'bg-white/20' : 'bg-slate-50'
          }`}>
            <i className={`fa-solid ${t.icon}`}></i>
          </div>
          <div>
            <p className="text-sm font-bold">{t.value}</p>
            <p className={`text-[10px] opacity-70 ${current === t.value ? 'text-white' : 'text-slate-400'}`}>{t.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ToneSelector;
