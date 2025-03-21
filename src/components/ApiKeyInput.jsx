import React, { useState } from 'react';
import '../styles/ApiKeyInput.css';

export function ApiKeyInput({ apiKey, setApiKey }) {
  const [showKey, setShowKey] = useState(false);

  const handleChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem('apiKey', newKey);
  };

  return (
    <div className="api-key-input">
      <div className="input-group">
        <input
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={handleChange}
          placeholder="Enter your OpenAI API key"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="toggle-visibility"
        >
          {showKey ? '🙈' : '👁️'}
        </button>
      </div>
      <p className="api-key-help">
        Need an API key? Get one from{' '}
        <a
          href="https://platform.openai.com/account/api-keys"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenAI
        </a>
      </p>
    </div>
  );
}
