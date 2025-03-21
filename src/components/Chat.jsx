import React, { useState } from 'react';
import { createChatCompletion } from '../services/openai';
import '../styles/Chat.css';

export function Chat({ apiKey, personality, initialStory, response }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      const systemMessage = {
        role: 'system',
        content: `You are ${personality.name}. ${personality.instruction} Focus on the situation and provide thoughtful insights. Ask follow up questions if you can't fully agree with the user's points. Otherwise, try to maintain your position. Be conversational, yet brief in your responses. Limit yourself to 1 or 2 sentences.`
      };
      
      const initialUserMessage = {
        role: 'user',
        content: `Here's the situation: ${initialStory}`
      };

      const updatedMessages = [
        ...messages,
        { role: 'user', content: newMessage }
      ];

      const response = await createChatCompletion(apiKey, [
        systemMessage,
        initialUserMessage,
        ...updatedMessages.slice(1)
      ]);

      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: response.data.choices[0].message.content.trim()
        }
      ]);
      setNewMessage('');
    } catch (error) {
      console.error('Chat error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="chat-section">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-header">
              {message.role === 'assistant' ? personality.name : 'You'}
            </div>
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">
            <div className="message-header">{personality.name}</div>
            Typing...
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Reply as you to ${personality.name}...`}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Reply'}
        </button>
      </div>
    </div>
  );
}
