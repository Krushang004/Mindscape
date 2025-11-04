import React, { useState, useEffect } from 'react';
import DailyEntry from './components/DailyEntry';
import History from './components/History';
import { Entry } from './types';

const { ipcRenderer } = window.require('electron');

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentView, setCurrentView] = useState<'entry' | 'history'>('entry');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const result = await ipcRenderer.invoke('load-entries');
    if (result.success) {
      setEntries(result.data);
    }
  };

  const handleSaveEntry = async (entry: Entry) => {
    const result = await ipcRenderer.invoke('save-entry', entry);
    if (result.success) {
      setEntries([...entries, entry]);
      setCurrentView('history');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 Mental Health Tracker</h1>
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${currentView === 'entry' ? 'active' : ''}`}
            onClick={() => setCurrentView('entry')}
          >
            Today's Entry
          </button>
          <button 
            className={`nav-tab ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            History
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {currentView === 'entry' ? (
          <DailyEntry onSave={handleSaveEntry} />
        ) : (
          <History entries={entries} />
        )}
      </main>
    </div>
  );
}

export default App; 