import React from 'react';
import { JudgmentCard } from './JudgmentCard';
import { getOverallEvaluation } from '../utils/verdictHelpers';
import '../styles/JudgmentList.css';

export function JudgmentList({ judgments, onChatClick, activeChat, apiKey }) {
  const verdictCounts = judgments.reduce((acc, { verdict }) => {
    acc[verdict] = (acc[verdict] || 0) + 1;
    return acc;
  }, {});

  const overallVerdict = getOverallEvaluation(verdictCounts);

  return (
    <div className="judgments-container">
      {judgments.length > 0 && (
        <div className="overall-verdict">
          <h2>Overall Verdict: {overallVerdict}</h2>
          <div className="verdict-counts">
            {Object.entries(verdictCounts).map(([verdict, count]) => (
              <span key={verdict} className={`verdict-count ${verdict.toLowerCase()}`}>
                {verdict}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="judgment-list">
        {judgments.map((judgment, index) => (
          <JudgmentCard
            key={index}
            judgment={judgment}
            onChatClick={onChatClick}
            activeChat={activeChat}
            apiKey={apiKey}
          />
        ))}
      </div>
    </div>
  );
}
