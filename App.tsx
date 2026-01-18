import React, { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { User, ViewState } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView(ViewState.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setView(ViewState.LOGIN);
  };

  return (
    <div className="antialiased text-gray-900 bg-gray-100 min-h-screen">
      {view === ViewState.LOGIN && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      {view === ViewState.DASHBOARD && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;