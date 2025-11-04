import React, { useState } from 'react';
import { Entry } from '../types';

interface HistoryProps {
  entries: Entry[];
}

const History: React.FC<HistoryProps> = ({ entries }) => {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (entries.length === 0) {
    return (
      <div className="history-empty">
        <h2>No entries yet</h2>
        <p>Start tracking your mental health by creating your first entry!</p>
      </div>
    );
  }

  return (
    <div className="history">
      <h2>Your Mental Health Journey</h2>
      
      <div className="history-container">
        <div className="entries-list">
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className={`entry-card ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
              onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
            >
              <div className="entry-header">
                <span className="entry-emoji">{entry.emoji}</span>
                <div className="entry-info">
                  <h3>{formatDate(entry.date)}</h3>
                  <p className="entry-mood">{entry.mood}</p>
                </div>
              </div>
              <p className="entry-summary">{entry.summary}</p>
            </div>
          ))}
        </div>

        {selectedEntry && (
          <div className="entry-detail">
            <div className="detail-header">
              <span className="detail-emoji">{selectedEntry.emoji}</span>
              <div>
                <h3>{formatDate(selectedEntry.date)}</h3>
                <p className="detail-mood">{selectedEntry.mood}</p>
              </div>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h4>Day Summary</h4>
                <p>{selectedEntry.summary}</p>
              </div>

              {selectedEntry.journal && (
                <div className="detail-section">
                  <h4>Journal Entry</h4>
                  <p>{selectedEntry.journal}</p>
                </div>
              )}

              {selectedEntry.suggestions.length > 0 && (
                <div className="detail-section">
                  <h4>Suggestions from that day</h4>
                  <ul className="detail-suggestions">
                    {selectedEntry.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History; 