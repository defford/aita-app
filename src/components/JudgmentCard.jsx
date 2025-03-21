import React from 'react';
import { Chat } from './Chat';

export function JudgmentCard({ judgment, onChatClick, activeChat, apiKey }) {
  const { personality, response } = judgment;
  const isActive = activeChat?.personality?.name === personality;

  return (
    <div className={`judgment-card ${isActive ? 'with-chat' : ''}`}>
      <div className="judgment-header">
        <div className="personality">
          {personality}
        </div>
      </div>
      <div className="response">{response.replace(/^Verdict:\s*/, '')}</div>
      <button 
        onClick={() => onChatClick(judgment)} 
        className={`chat-button ${isActive ? 'active' : ''}`}
      >
        {isActive ? 'Close Chat' : 'Chat'}
      </button>
      {isActive && (
        <Chat
          apiKey={apiKey}
          personality={activeChat.personality}
          initialStory={activeChat.initialStory}
          response={activeChat.response}
          onClose={() => onChatClick(judgment)}
        />
      )}
    </div>
  );
}
