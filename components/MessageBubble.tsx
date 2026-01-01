
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
        return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getBottomCaption = () => {
    if (!data) return "";
    const primaryAction = data.immediateActions?.[0] || data.explanation || "";
    const cleanText = primaryAction.replace(/\*\*.*?\*\*:?\s*/g, '');
    // Get the first full sentence, but do NOT truncate it with substring/ellipsis.
    const firstSentence = cleanText.split(/[.!?]/)[0];
    return firstSentence; 
  };

  return (
    <div className={`flex gap-3 sm:gap-4 lg:gap-5 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform ${isUser ? 'bg-slate-800 text-white' : 'bg-green-100 text-green-600'}`}>
        <i className={`fa-solid ${isUser ? 'fa-user' : 'fa-leaf'} text-[10px] sm:text-sm lg:text-base`}></i>
      </div>

      {/* Content Container */}
      <div className={`max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] xl:max-w-[60%] space-y-2 sm:space-y-3 lg:space-y-4`}>
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
            
            {/* 1. VISUALIZATION CARD */}
            {data.visualizationImage && (
              <div className="bg-white p-1.5 lg:p-2.5 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-lg lg:shadow-xl overflow-hidden w-full max-w-lg lg:max-w-xl transition-shadow hover:shadow-2xl duration-500">
                <div className="relative rounded-[1.2rem] sm:rounded-[1.75rem] overflow-hidden aspect-[4/3] sm:aspect-video w-full group bg-slate-50">
                   <img 
                     src={data.visualizationImage} 
                     alt={data.visualizationTitle} 
                     className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                   />
                   
                   <div className="absolute top-3 sm:top-5 left-0 right-0 flex justify-center px-4 pointer-events-none">
                     <div className="bg-white/95 backdrop-blur-md px-3 sm:px-6 py-1.5 rounded-full shadow-lg border border-white/50">
                        <span className="text-[9px] sm:text-[11px] lg:text-xs font-black text-slate-900 uppercase tracking-[0.15em]">
                          {data.visualizationTitle || "WELLNESS"}
                        </span>
                     </div>
                   </div>

                   <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent flex items-center justify-center text-center">
                     <p className="text-white text-xs sm:text-sm lg:text-base font-semibold tracking-wide leading-tight px-2 drop-shadow-md">
                       {getBottomCaption()}
                     </p>
                   </div>
                </div>
              </div>
            )}

            {/* 2. DEEP STEP-BY-STEP PROTOCOL */}
            {data.stepByStep && data.stepByStep.length > 0 && (
               <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-list-ol text-green-500"></i> Therapeutic Protocol
                  </h4>
                  <div className="space-y-4 sm:space-y-5 relative pl-2">
                    {/* Vertical Line */}
                    <div className="absolute top-2 left-[0.95rem] bottom-4 w-px bg-slate-200"></div>
                    
                    {data.stepByStep.map((step, idx) => (
                      <div key={idx} className="relative pl-8 sm:pl-10">
                         {/* Circle Number */}
                         <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-green-200 flex items-center justify-center text-green-700 font-bold text-xs sm:text-sm shadow-sm z-10">
                           {idx + 1}
                         </div>
                         <div className="pt-1 text-[13px] sm:text-[15px] text-slate-700 leading-relaxed">
                           {renderFormattedText(step)}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}

            {/* 3. QUICK ACTIONS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {data.immediateActions && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-100 transition-all">
                  <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-bolt text-amber-500"></i> Quick Actions
                  </h4>
                  <ul className="space-y-2 lg:space-y-3">
                    {data.immediateActions.slice(0, 3).map((action, i) => (
                      <li key={i} className="text-[11px] sm:text-sm lg:text-[14px] text-slate-600 leading-relaxed flex gap-2">
                        <span className="text-amber-400 mt-1">•</span>
                        <span>{renderFormattedText(action)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.smallComforts && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-rose-100 transition-all">
                  <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <i className="fa-solid fa-heart text-rose-500"></i> Soft Comforts
                  </h4>
                  <ul className="space-y-2 lg:space-y-3">
                    {data.smallComforts.slice(0, 3).map((item, i) => (
                      <li key={i} className="text-[11px] sm:text-sm lg:text-[14px] text-slate-600 leading-relaxed flex gap-2">
                        <span className="text-rose-400 mt-1">•</span>
                        <span>{renderFormattedText(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4. YOUTUBE RESOURCE */}
            {data.youtubeResource && (
              <div 
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => window.open(data.youtubeResource?.url, '_blank')}
              >
                {/* Red Accent Strip */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>

                <div className="relative w-full sm:w-20 sm:h-20 aspect-video sm:aspect-square bg-slate-900 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                   <div className="absolute inset-0 bg-red-600 opacity-20"></div>
                   <i className="fa-brands fa-youtube text-red-500 text-2xl sm:text-3xl z-10"></i>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Watch</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{data.condition} Support</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight mb-1 group-hover:text-red-600 transition-colors">
                    {data.youtubeResource.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
                    {data.youtubeResource.reason}
                  </p>
                </div>
                
                <div className="hidden sm:flex w-10 h-10 rounded-full border border-slate-100 items-center justify-center text-slate-300 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all">
                  <i className="fa-solid fa-play text-sm ml-1"></i>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
