
import React from 'react';
import { ChatMessage, WellnessCondition } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const data = message.data;

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getBottomCaption = () => {
    if (!data) return "";
    const primaryAction = data.immediateActions?.[0] || data.explanation || "";
    const cleanText = primaryAction.replace(/\*\*.*?\*\*:?\s*/g, '');
    const firstSentence = cleanText.split(/[.!?]/)[0];
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + "..." : firstSentence;
  };

  return (
    <div className={`flex gap-3 sm:gap-4 lg:gap-5 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform ${isUser ? 'bg-slate-800 text-white' : 'bg-green-100 text-green-600'}`}>
        <i className={`fa-solid ${isUser ? 'fa-user' : 'fa-leaf'} text-[10px] sm:text-sm lg:text-base`}></i>
      </div>

      {/* Content Container - Constrained width on desktop for better reading */}
      <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] xl:max-w-[60%] space-y-2 sm:space-y-3 lg:space-y-4`}>
        {message.image && (
          <div className="mb-2">
            <img src={message.image} alt="Upload" className="rounded-xl lg:rounded-2xl max-w-full sm:max-w-xs border border-slate-200 shadow-sm" />
          </div>
        )}

        <div className={`p-3 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-sm border transition-all ${
          isUser ? 'bg-slate-800 text-white rounded-tr-none border-slate-700' : 'bg-white text-slate-800 rounded-tl-none border-slate-100'
        }`}>
          <div className="leading-relaxed whitespace-pre-wrap text-[13px] sm:text-[15px] lg:text-base">
            {message.text}
          </div>
          <div className={`mt-2 text-[8px] sm:text-[10px] lg:text-xs opacity-40 uppercase tracking-widest font-bold ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {data && (
          <div className="space-y-3 sm:space-y-4 lg:space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            {/* RESPONSIVE VISUALIZATION CARD */}
            {data.visualizationImage && (
              <div className="bg-white p-1 lg:p-2 rounded-[1.2rem] sm:rounded-[2rem] border border-slate-200 shadow-lg lg:shadow-xl overflow-hidden w-full max-w-lg lg:max-w-xl transition-shadow hover:shadow-2xl duration-500">
                <div className="relative rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden aspect-[4/3] sm:aspect-video w-full group">
                   <img 
                     src={data.visualizationImage} 
                     alt={data.visualizationTitle} 
                     className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                   />
                   
                   {/* LABEL */}
                   <div className="absolute top-2 sm:top-5 left-0 right-0 flex justify-center px-4 pointer-events-none">
                     <div className="bg-white/95 backdrop-blur-md px-3 sm:px-6 py-1 lg:py-1.5 rounded-md sm:rounded-xl shadow-xl border border-white/50">
                        <span className="text-[9px] sm:text-[11px] lg:text-xs font-black text-slate-900 uppercase tracking-[0.15em]">
                          {data.visualizationTitle || "WELLNESS"}
                        </span>
                     </div>
                   </div>

                   {/* CAPTION */}
                   <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-5 bg-gradient-to-t from-black/60 to-transparent lg:bg-black/40 lg:backdrop-blur-sm flex items-center justify-center text-center transition-colors group-hover:bg-black/50">
                     <p className="text-white text-[11px] sm:text-sm lg:text-base font-semibold tracking-wide leading-tight px-2 drop-shadow-md">
                       {getBottomCaption()}
                     </p>
                   </div>
                   
                   {/* DESKTOP DOWNLOAD BUTTON */}
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                      <a href={data.visualizationImage} download="wellness-art.png" className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-slate-800 hover:bg-white hover:text-green-600 transition-colors">
                        <i className="fa-solid fa-download text-sm"></i>
                      </a>
                   </div>
                </div>
              </div>
            )}

            {/* ADVICE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {data.immediateActions && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-green-100 hover:shadow-md transition-all">
                  <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-amber-500"></i> Actions
                  </h4>
                  <ul className="space-y-2 lg:space-y-3">
                    {data.immediateActions.slice(0, 2).map((action, i) => (
                      <li key={i} className="text-[11px] sm:text-sm lg:text-[15px] text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-3">
                        {renderFormattedText(action)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.smallComforts && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-rose-100 hover:shadow-md transition-all">
                  <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <i className="fa-solid fa-heart text-rose-500"></i> Comforts
                  </h4>
                  <ul className="space-y-2 lg:space-y-3">
                    {data.smallComforts.slice(0, 2).map((item, i) => (
                      <li key={i} className="text-[11px] sm:text-sm lg:text-[15px] text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-3">
                        {renderFormattedText(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* YOUTUBE LINK */}
            {data.youtubeResource && (
              <div 
                className="bg-slate-900 hover:bg-black text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center gap-3 lg:gap-4 shadow-md lg:shadow-lg cursor-pointer transform active:scale-[0.98] transition-all group"
                onClick={() => window.open(data.youtubeResource?.url, '_blank')}
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-red-600 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-play text-xs sm:text-base ml-0.5"></i>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[7px] sm:text-[9px] lg:text-[10px] font-black text-red-400 uppercase tracking-[0.12em] mb-0.5 lg:mb-1">Perspective Shift</p>
                  <h3 className="text-[11px] sm:text-sm lg:text-base font-bold truncate">{data.youtubeResource.reason}</h3>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-slate-600 group-hover:text-white transition-colors mr-2 text-xs lg:text-sm"></i>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
