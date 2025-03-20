import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const personalities = [
  { name: 'The Empath', instruction: 'Consider both sides with compassion.' },
  { name: 'The Cynic', instruction: 'Look for hidden motives and flaws in their reasoning.' },
  { name: 'The Rule Follower', instruction: 'Judge strictly based on social norms and rules.' },
  { name: 'The Jokester', instruction: 'Add humor to your judgment.' },
  { name: 'The Realist', instruction: 'Provide a straightforward, no-nonsense opinion.' },
  { name: 'The Diplomat', instruction: 'Seek middle ground and compromise.' },
  { name: 'The Sarcastic One', instruction: 'Use sarcasm and wit in your response.' },
  { name: 'The Optimist', instruction: 'Focus on the positive and give the benefit of the doubt.' },
  { name: 'The Pessimist', instruction: 'Highlight the negative and assume the worst.' },
  { name: 'The Therapist', instruction: 'Analyze psychological aspects and suggest growth.' },
  { name: 'The Lawyer', instruction: 'Judge based on legal or ethical principles.' },
  { name: 'The Friend', instruction: 'Offer advice as a close friend would.' },
  { name: 'The Stranger', instruction: 'Provide an outsider\'s perspective.' },
  { name: 'The Moralist', instruction: 'Judge based on strict moral codes.' },
  { name: 'The Pragmatist', instruction: 'Focus on practical outcomes.' },
  { name: 'The Idealist', instruction: 'Judge based on ideals, regardless of practicality.' },
  { name: 'The Devil\'s Advocate', instruction: 'Challenge the user by taking the opposing view.' },
  { name: 'The Mediator', instruction: 'Try to understand all sides and find resolution.' },
  { name: 'The Critic', instruction: 'Point out flaws and areas for improvement.' },
  { name: 'The Supporter', instruction: 'Side with the user and offer encouragement.' },
];

// Extract verdict from AI response (unchanged)
const extractVerdict = (response) => {
  const regex = /^Verdict:\s*(YTA|NTA|ESH|NAH)/i;
  const match = response.match(regex);
  if (match) return match[1].toUpperCase();

  const keywords = {
    YTA: /YTA|You're the Asshole/i,
    NTA: /NTA|Not the Asshole/i,
    ESH: /ESH|Everyone Sucks Here/i,
    NAH: /NAH|No Assholes Here/i,
  };
  for (const [verdict, pattern] of Object.entries(keywords)) {
    if (pattern.test(response)) return verdict;
  }
  return 'Undecided';
};

// Determine overall evaluation (unchanged)
const getOverallEvaluation = (verdictCounts) => {
  const definedVerdicts = ['YTA', 'NTA', 'ESH', 'NAH'];
  const counts = definedVerdicts.map((v) => verdictCounts[v] || 0);
  const maxCount = Math.max(...counts);
  if (maxCount === 0) return 'Undecided';

  const topVerdicts = definedVerdicts.filter((v) => (verdictCounts[v] || 0) === maxCount);
  return topVerdicts.length === 1 ? topVerdicts[0] : `Tie between ${topVerdicts.join(' and ')}`;
};

function Chat({ apiKey, personality, initialStory, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi, I'm ${personality.name}. Let's discuss the situation you described.` }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    const updatedMessages = [...messages, { role: 'user', content: newMessage }];
    setMessages(updatedMessages);
    setNewMessage('');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { 
              role: 'system', 
              content: `You are ${personality.name}. ${personality.instruction} Focus on the situation and provide thoughtful insights. Ask follow up questions if you can't fully agree with the user's points. Otherwise, try to maintain your position. Be conversational, yet brief in your responses.` 
            },
            { 
              role: 'user', 
              content: `Here's the situation: ${initialStory}` 
            },
            ...updatedMessages.slice(1)
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessages([...updatedMessages, {
        role: 'assistant',
        content: response.data.choices[0].message.content.trim()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  return (
    <div className="chat-overlay">
      <div className="chat-container">
        <div className="chat-header">
          <h3>{personality.name}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.content}
            </div>
          ))}
          {loading && <div className="message loading">Typing...</div>}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [apiKey, setApiKey] = useState('');
  const [story, setStory] = useState('');
  const [judgments, setJudgments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState(null);

  const handleSubmit = async () => {
    if (!apiKey || !story) {
      setError('Please provide both an API key and a story.');
      return;
    }
    setError('');
    setLoading(true);
    setJudgments([]);

    try {
      const promises = personalities.map((personality) => {
        const prompt = `
          Read the following story and provide a judgment on whether the person is the asshole. 
          Start your response with "Verdict: [YTA/NTA/ESH/NAH]" followed by your reasoning. 
          ${personality.instruction}
          
          Story: ${story}
        `;
        return axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
      });

      const responses = await Promise.all(promises);
      const newJudgments = responses.map((res, index) => {
        const response = res.data.choices[0].message.content.trim();
        const verdict = extractVerdict(response);
        return {
          personality: personalities[index].name,
          response,
          verdict,
        };
      });
      setJudgments(newJudgments);
    } catch (err) {
      setError('Error fetching judgments. Check your API key or network connection.');
    } finally {
      setLoading(false);
    }
  };

  const verdictCounts = judgments.reduce((acc, j) => {
    acc[j.verdict] = (acc[j.verdict] || 0) + 1;
    return acc;
  }, {});
  const overallEvaluation = judgments.length > 0 ? getOverallEvaluation(verdictCounts) : '';
  const verdictOrder = ['YTA', 'NTA', 'ESH', 'NAH', 'Undecided'];
  const totalJudgments = judgments.length;
  const breakdown = verdictOrder.map((verdict) => ({
    verdict,
    count: verdictCounts[verdict] || 0,
    percentage: totalJudgments ? ((verdictCounts[verdict] || 0) / totalJudgments) * 100 : 0,
  }));

  return (
    <div className="app-container">
      <h1>AITA Evaluator</h1>

      <div>
        <label>
          OpenAI API Key:
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          Your Story:
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Tell us what happened..."
          />
        </label>
      </div>

      <p className="api-note">
        Note: Evaluating your story will make 20 API calls, one for each personality. Ensure you have sufficient API credits.
      </p>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Evaluating...' : 'Evaluate'}
      </button>

      {error && <p className="error">{error}</p>}

      {judgments.length > 0 && (
        <div className="results">
          <div className="verdict-breakdown">
            <h2>Overall Evaluation: {overallEvaluation}</h2>
            <h3>Verdict Breakdown</h3>
            {breakdown.map((item) => (
              <div key={item.verdict} className="verdict-bar">
                <span className="verdict-label">{item.verdict}</span>
                <div
                  className={`verdict-bar-fill ${item.verdict}`}
                  style={{ width: `${item.percentage}%` }}
                  data-count={item.count}
                ></div>
              </div>
            ))}
          </div>

          {judgments.map((judgment, index) => (
            <div key={index} className="judgment-card">
              <h3>{judgment.personality}</h3>
              <p>
                <span className="verdict-text">Verdict: {judgment.verdict}</span>
              </p>
              <p>{judgment.response}</p>
              <button 
                onClick={() => setActiveChat({
                  personality: personalities.find(p => p.name === judgment.personality),
                  story
                })}
                className="chat-button"
              >
                Chat with {judgment.personality}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeChat && (
        <Chat
          apiKey={apiKey}
          personality={activeChat.personality}
          initialStory={activeChat.story}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}

export default App;