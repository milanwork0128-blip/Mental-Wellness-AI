
import React, { useState, useRef, useEffect } from 'react';
import { UserState, TonePreference, ChatMessage, WellnessResponse, ChatSession } from '../types';
import { getWellnessGuidance } from '../geminiService';
import { db } from '../dbService';
import MessageBubble from './MessageBubble';
import ToneSelector from './ToneSelector';

interface MainViewProps {
  userState: UserState;
  onUpdateTone: (tone: TonePreference) => void;
  onToggleStepMode: () => void;
  onLogout: () => void;
}

const MainView: React.FC<MainViewProps> = ({ userState, onUpdateTone, onToggleStepMode, onLogout }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingFeeling, setPendingFeeling] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history and drafts
  useEffect(() => {
    if (userState.currentUser) {
      const history = db.getHistory(userState.currentUser.id);
      const savedSessions = db.getSessions(userState.currentUser.id);
      const draft = db.getDraft(userState.currentUser.id);
      
      setMessages(history);
      setSessions(savedSessions);
      setInputText(draft);
      setPendingFeeling(null);
    }
  }, [userState.currentUser]);

  // Auto-save draft
  useEffect(() => {
    if (userState.currentUser) {
      db.saveDraft(userState.currentUser.id, inputText);
    }
  }, [inputText, userState.currentUser]);

  useEffect(() => {
    if (userState.currentUser) {
      if (messages.length > 0) {
        db.saveHistory(userState.currentUser.id, messages);
      } else {
        db.clearHistory(userState.currentUser.id);
      }
    }
  }, [messages, userState.currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, pendingFeeling]);

  const processGuidance = async (feeling: string, role: string | undefined, image: string | null) => {
    setIsTyping(true);
    try {
      const guidance = await getWellnessGuidance(
        feeling,
        userState.tone,
        userState.isStepByStepMode,
        image || undefined,
        role
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: guidance.aiCommentary,
        data: guidance,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "I encountered a moment of static. Could you try sharing that again?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const text = textOverride || inputText;
    if (!text.trim() && !selectedImage) return;

    // Clear draft on send
    if (userState.currentUser) {
      db.clearDraft(userState.currentUser.id);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      image: selectedImage || undefined,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    if (!pendingFeeling && messages.length === 0) {
      setPendingFeeling(text);
      const roleRequestMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Could you tell me which role describes you best?",
        timestamp: new Date(),
        isRoleSelection: true
      };
      setTimeout(() => {
        setMessages(prev => [...prev, roleRequestMsg]);
      }, 500);
      return; 
    }

    if (pendingFeeling) {
      await processGuidance(pendingFeeling, text, selectedImage || null);
      setPendingFeeling(null);
      setSelectedImage(null);
      return;
    }

    await processGuidance(text, undefined, selectedImage || null);
    setSelectedImage(null);
  };

  const handleRoleSelect = async (role: string) => {
    if (!pendingFeeling) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: role,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    await processGuidance(pendingFeeling, role, selectedImage);
    setPendingFeeling(null);
    setSelectedImage(null);
  };

  const handleNewChat = () => {
    setIsMobileMenuOpen(false);
    if (!userState.currentUser) return;
    if (messages.length === 0) {
      setInputText('');
      setSelectedImage(null);
      setPendingFeeling(null);
      db.clearDraft(userState.currentUser.id);
      return;
    }
    const firstUserMsg = messages.find(m => m.role === 'user');
    const preview = firstUserMsg ? firstUserMsg.text.substring(0, 30) + '...' : 'New Session';
    const newSession: ChatSession = {
      id: Date.now().toString(),
      userId: userState.currentUser.id,
      timestamp: new Date(),
      preview: preview,
      messages: [...messages]
    };
    db.saveSession(userState.currentUser.id, newSession);
    setSessions(prev => [newSession, ...prev]);
    db.clearHistory(userState.currentUser.id);
    db.clearDraft(userState.currentUser.id);
    setMessages([]);
    setInputText('');
    setSelectedImage(null);
    setPendingFeeling(null);
  };

  const handleLoadSession = (session: ChatSession) => {
    setIsMobileMenuOpen(false);
    if (!userState.currentUser) return;
    setMessages(session.messages);
    db.saveHistory(userState.currentUser.id, session.messages);
    setPendingFeeling(null);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event: any) => setInputText(event.results[0][0].transcript);
      recognition.start();
    }
  };

  const starterPrompts = ["I feel low", "Study pressure", "Frustrated", "Anxious"];
  const roles = [
    { label: "Student", icon: "fa-graduation-cap" },
    { label: "Businessman", icon: "fa-briefcase" },
    { label: "Employee", icon: "fa-building" },
    { label: "Other", icon: "fa-user" }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="glass-effect h-14 sm:h-16 lg:h-20 flex items-center justify-between px-3 sm:px-6 lg:px-8 border-b border-slate-200/50 z-30 shrink-0 relative bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3 lg:gap-4 cursor-pointer group" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200 transition-all duration-300 ${isMobileMenuOpen ? 'bg-slate-800 rotate-180' : 'bg-green-600 group-hover:bg-green-700'}`}>
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-leaf'} text-sm lg:text-base`}></i>
          </div>
          <h1 className="font-bold text-slate-800 text-sm sm:text-lg lg:text-xl tracking-tight truncate">Mental Wellness AI</h1>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <button 
            onClick={onToggleStepMode} 
            className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-[10px] sm:text-xs lg:text-sm font-bold transition-all border ${userState.isStepByStepMode ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            <i className="fa-solid fa-list-check mr-1.5"></i> <span className="hidden xs:inline">Step Mode</span>
          </button>
          <button onClick={onLogout} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-200 transition-colors">
            <i className="fa-solid fa-right-from-bracket text-xs lg:text-sm"></i>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        <div className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}/>

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-80 flex flex-col p-4 lg:p-6 bg-white border-r border-slate-200 shrink-0 overflow-y-auto no-scrollbar transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-6 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-3.5">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-700 font-bold text-sm shadow-sm">{userState.currentUser?.name?.[0]?.toUpperCase() || 'U'}</div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-slate-800 truncate">{userState.currentUser?.name || 'User'}</p>
               <p className="text-[10px] text-slate-400 font-medium">Free Plan</p>
             </div>
          </div>
          
          <button onClick={handleNewChat} className="w-full mb-8 py-3 px-4 font-bold rounded-xl bg-slate-900 hover:bg-black text-white text-xs lg:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 active:scale-95">
            <i className="fa-solid fa-plus"></i> New Session
          </button>

          <div className="flex-1 min-h-0 flex flex-col">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">History</h2>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
              {sessions.length === 0 && (
                <div className="text-center py-8 text-slate-300">
                  <i className="fa-regular fa-comments text-2xl mb-2"></i>
                  <p className="text-xs">No history yet</p>
                </div>
              )}
              {sessions.map((session) => (
                <div key={session.id} onClick={() => handleLoadSession(session)} className="group p-3 rounded-xl border border-transparent hover:border-slate-200 bg-transparent hover:bg-white transition-all cursor-pointer relative">
                  <p className="text-[9px] font-bold text-slate-400 mb-1">{session.timestamp.toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600 group-hover:text-slate-900 font-medium truncate pr-4">{session.preview}</p>
                  <i className="fa-solid fa-chevron-right absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <ToneSelector current={userState.tone} onUpdate={(t) => { onUpdateTone(t); setIsMobileMenuOpen(false); }} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative bg-slate-50/50 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-2 sm:px-6 lg:px-20 xl:px-32 py-4 lg:py-10 space-y-4 lg:space-y-8 scroll-smooth no-scrollbar">
            {messages.length === 0 && (
              <div className="max-w-xs sm:max-w-md lg:max-w-2xl mx-auto mt-6 sm:mt-10 lg:mt-24 text-center animate-slide-up">
                <div className="bg-white p-6 sm:p-10 lg:p-14 rounded-[2rem] lg:rounded-[3rem] shadow-sm border border-slate-100">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 animate-pulse">
                     <i className="fa-solid fa-seedling text-2xl lg:text-3xl"></i>
                  </div>
                  <h2 className="text-lg sm:text-2xl lg:text-4xl font-bold text-slate-800 mb-2 lg:mb-4 tracking-tight">Good morning, {userState.currentUser?.name}</h2>
                  <p className="text-xs sm:text-sm lg:text-lg text-slate-500 mb-8 lg:mb-10 max-w-lg mx-auto leading-relaxed">I'm here to listen. How are you feeling right now?</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                    {starterPrompts.map((p, idx) => (
                      <button key={idx} onClick={() => handleSendMessage(p)} className="px-3 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-50 text-slate-700 border border-slate-100 text-[10px] sm:text-xs lg:text-sm font-semibold hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <MessageBubble message={msg} />
                {msg.isRoleSelection && pendingFeeling && (
                   <div className="flex flex-wrap gap-2 animate-slide-up pl-9 sm:pl-14 lg:pl-16">
                     {roles.map((r, idx) => (
                        <button key={idx} onClick={() => handleRoleSelect(r.label)} className="px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[10px] sm:text-xs lg:text-sm font-medium flex items-center gap-2 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm">
                          <i className={`fa-solid ${r.icon}`}></i> {r.label}
                        </button>
                     ))}
                   </div>
                )}
              </React.Fragment>
            ))}

            {isTyping && (
              <div className="flex gap-3 lg:gap-5 animate-slide-up">
                <div className="w-7 h-7 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-leaf text-green-600 text-[10px] sm:text-sm lg:text-base"></i>
                </div>
                <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-xl sm:rounded-2xl rounded-tl-none border border-slate-100 flex items-center shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full typing-dot"></div>
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full typing-dot"></div>
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4 lg:h-8" />
          </div>

          {/* Input Dock */}
          <div className="p-2 sm:p-4 lg:p-6 lg:pb-8 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent shrink-0">
            <div className="max-w-4xl mx-auto">
              {selectedImage && (
                <div className="mb-3 relative inline-block animate-slide-up">
                  <img src={selectedImage} className="h-16 w-16 lg:h-24 lg:w-24 object-cover rounded-2xl border-2 border-white shadow-lg" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-[10px] lg:text-xs shadow-md hover:bg-red-600 transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}
              <div className="glass-effect flex items-end gap-2 lg:gap-4 p-1.5 sm:p-3 lg:p-4 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/60 bg-white/40 backdrop-blur-xl transition-all duration-300 focus-within:bg-white/80 focus-within:shadow-2xl focus-within:border-white">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-white/50 rounded-full transition-all shrink-0"
                  title="Upload Image"
                >
                  <i className="fa-solid fa-paperclip text-sm sm:text-lg lg:text-xl"></i>
                  <input type="file" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSelectedImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" accept="image/*" />
                </button>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Tell me what's on your mind..."
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 py-2 sm:py-3 lg:py-4 resize-none max-h-32 text-xs sm:text-sm lg:text-base font-medium placeholder-slate-400/80"
                />
                <button 
                  onClick={startVoiceInput} 
                  className={`w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center shrink-0 rounded-full transition-all hover:bg-white/50 ${isRecording ? 'text-red-500 animate-pulse bg-red-50' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Voice Input"
                >
                  <i className={`fa-solid ${isRecording ? 'fa-microphone-lines' : 'fa-microphone'} text-sm sm:text-lg lg:text-xl`}></i>
                </button>
                <button 
                  onClick={() => handleSendMessage()} 
                  disabled={!inputText.trim() && !selectedImage} 
                  className="w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg disabled:bg-slate-200 disabled:shadow-none transition-all transform hover:scale-105 active:scale-95"
                  title="Send Message"
                >
                  <i className="fa-solid fa-paper-plane text-[10px] sm:text-sm lg:text-base"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainView;
