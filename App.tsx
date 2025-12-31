
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Landing from './components/Landing';
import MainView from './components/MainView';
import { UserState, TonePreference, AppView, User } from './types';

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>({
    view: 'login',
    tone: TonePreference.CalmGentle,
    isStepByStepMode: false,
    currentUser: null,
  });

  // Effect to check for an existing session (demo purposes only)
  useEffect(() => {
    const savedUser = localStorage.getItem('wellness_session');
    if (savedUser) {
      setUserState(prev => ({ 
        ...prev, 
        currentUser: JSON.parse(savedUser), 
        view: 'landing' 
      }));
    }
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('wellness_session', JSON.stringify(user));
    setUserState(prev => ({ ...prev, currentUser: user, view: 'landing' }));
  };

  const handleStart = () => {
    setUserState(prev => ({ ...prev, view: 'main' }));
  };

  const updateTone = (tone: TonePreference) => {
    setUserState(prev => ({ ...prev, tone }));
  };

  const toggleStepMode = () => {
    setUserState(prev => ({ ...prev, isStepByStepMode: !prev.isStepByStepMode }));
  };

  const handleLogout = () => {
    localStorage.removeItem('wellness_session');
    setUserState({
      view: 'login',
      tone: TonePreference.CalmGentle,
      isStepByStepMode: false,
      currentUser: null,
    });
  };

  const renderView = () => {
    switch (userState.view) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'landing':
        return <Landing onStart={handleStart} name={userState.currentUser?.name} />;
      case 'main':
        return (
          <MainView 
            userState={userState} 
            onUpdateTone={updateTone}
            onToggleStepMode={toggleStepMode}
            onLogout={handleLogout}
          />
        );
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {renderView()}
    </div>
  );
};

export default App;
