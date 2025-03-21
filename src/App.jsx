import React, { useState, useEffect } from 'react';
import { personalities } from './data/personalities';
import { getJudgment } from './services/openai';
import { extractVerdict } from './utils/verdictHelpers';
import { ApiKeyInput } from './components/ApiKeyInput';
import { StoryInput } from './components/StoryInput';
import { JudgmentList } from './components/JudgmentList';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [story, setStory] = useState('');
  const [judgments, setJudgments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  // Load API key from localStorage or environment
  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      setApiKey(import.meta.env.VITE_OPENAI_API_KEY);
    } else if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSubmit = async () => {
    if (!apiKey || !story) {
      setError('Please provide both an API key and a story.');
      return;
    }
    setError('');
    setLoading(true);
    setJudgments([]);

    try {
      const promises = personalities.map(async (personality) => {
        const response = await getJudgment(apiKey, story, personality);
        const verdict = extractVerdict(response);
        return {
          personality: personality.name,
          response,
          verdict,
        };
      });

      const newJudgments = await Promise.all(promises);
      setJudgments(newJudgments);
    } catch (error) {
      console.error('Error getting judgments:', error);
      setError('Failed to get judgments. Please check your API key and try again.');
    }
    setLoading(false);
  };

  const handleChatClick = (judgment) => {
    const personality = personalities.find(p => p.name === judgment.personality);
    
    // Toggle chat off if clicking the same judgment
    if (activeChat?.personality?.name === personality.name) {
      setActiveChat(null);
      return;
    }

    setActiveChat({ 
      personality, 
      response: judgment.response, 
      initialStory: story 
    });
  };

  const handleHomeClick = () => {
    setShowSettings(false);
    setShowGenerate(false);
  };

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1 onClick={handleHomeClick} className="clickable-title">Am I The Asshole?</h1>
          <nav className="app-nav">

            <button 
              className={`nav-link icon-button ${showSettings ? 'active' : ''}`}
              onClick={() => {
                setShowSettings(!showSettings);
                setShowGenerate(false);
              }}
              aria-label="Settings"
            >
              ⚙️
            </button>
          </nav>
        </div>
      </header>

      <main>
        {showSettings ? (
          <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
        ) : showGenerate ? (
          <StoryInput
            story={story}
            setStory={setStory}
            onSubmit={() => {
              setShowGenerate(false);
              handleSubmit();
            }}
            loading={loading}
            apiKey={apiKey}
          />
        ) : (
          <>
            <div className="story-section">
              <StoryInput
                story={story}
                setStory={setStory}
                onSubmit={handleSubmit}
                loading={loading}
                apiKey={apiKey}
              />
              {error && <div className="error">{error}</div>}
            </div>

            <JudgmentList
              judgments={judgments}
              onChatClick={handleChatClick}
              activeChat={activeChat}
              apiKey={apiKey}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;