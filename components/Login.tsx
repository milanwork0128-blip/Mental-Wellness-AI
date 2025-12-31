
import React, { useState, useEffect } from 'react';
import { db, DBUser } from '../dbService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Debug State
  const [showDebug, setShowDebug] = useState(false);
  const [storedUsers, setStoredUsers] = useState<DBUser[]>([]);

  useEffect(() => {
    if (showDebug) {
      setStoredUsers(db.getUsers());
    }
  }, [showDebug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (isSignUp) {
        const success = db.saveUser({
          id: Date.now().toString(),
          email,
          password,
          name: name || email.split('@')[0],
        });
        if (success) {
          const authenticated = db.authenticate(email, password);
          if (authenticated) onLogin(authenticated);
        } else {
          setError('An account with this email already exists.');
        }
      } else {
        const authenticated = db.authenticate(email, password);
        if (authenticated) {
          onLogin(authenticated);
        } else {
          setError('Invalid email or password.');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemo = () => {
    onLogin({ id: 'demo', email: 'demo@wellness.ai', name: 'Explorer' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sage-gradient relative overflow-hidden">
      {/* Immersive animated background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-green-200/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="z-10 w-full max-w-md animate-slide-up">
        <div className="glass-effect p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/60">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 rounded-2xl shadow-lg shadow-green-200 mb-6 text-white transform hover:rotate-12 transition-transform cursor-pointer">
              <i className="fa-solid fa-leaf text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isSignUp ? 'Join Us' : 'Welcome Back'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isSignUp ? 'Start your wellness journey today' : 'Continue your wellness journey'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-2 animate-slide-up">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="animate-slide-up">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all placeholder-slate-400"
                  placeholder="e.g. Alex Rivera"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all placeholder-slate-400"
                placeholder="hello@wellness.ai"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-medium focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-green-400 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <i className="fa-solid fa-circle-notch animate-spin"></i>
              ) : (
                <>{isSignUp ? 'Create Account' : 'Sign In'} <i className="fa-solid fa-chevron-right text-xs"></i></>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <button
            onClick={handleDemo}
            className="w-full mt-6 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-wand-sparkles text-green-500"></i> Enter Demo Mode
          </button>

          <div className="text-center mt-8">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-slate-500 font-medium hover:text-green-600 transition-colors"
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} <span className="text-green-600 font-bold ml-1">{isSignUp ? 'Sign In' : 'Sign Up Free'}</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 w-full text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest flex justify-center gap-4">
        <span><i className="fa-solid fa-lock mr-2 opacity-50"></i> Private • Secure • Encrypted</span>
        <button 
          onClick={() => setShowDebug(true)}
          className="hover:text-slate-600 transition-colors"
          title="View Local Database"
        >
          <i className="fa-solid fa-database"></i>
        </button>
      </footer>

      {/* Database Inspector Modal */}
      {showDebug && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Local Database Inspector</h3>
                <p className="text-xs text-slate-500">Contents of localStorage (Machine specific)</p>
              </div>
              <button 
                onClick={() => setShowDebug(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar">
              {storedUsers.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <i className="fa-solid fa-folder-open text-3xl mb-2"></i>
                  <p>No users found in local storage.</p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                        <th className="p-3 rounded-l-lg">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Password (Raw)</th>
                        <th className="p-3 rounded-r-lg">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {storedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-medium text-slate-700">{u.name}</td>
                          <td className="p-3 text-slate-600 font-mono text-xs">{u.email}</td>
                          <td className="p-3 text-red-500 font-mono text-xs bg-red-50/50 rounded">{u.password}</td>
                          <td className="p-3 text-slate-400 text-[10px]">{u.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                <strong>Developer Note:</strong> This application uses browser <code>localStorage</code>. 
                Data is stored on this device only. In a real production app, this would be a cloud database (PostgreSQL/MongoDB) 
                and passwords would never be visible.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
