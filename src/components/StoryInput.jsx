import React, { useState } from 'react';
import StoryGenerator from './StoryGenerator';
import { createChatCompletion } from '../services/openai';
import '../styles/StoryInput.css';

export function StoryInput({ story, setStory, onSubmit, loading, apiKey }) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratedStory = (generatedStory) => {
    setStory(generatedStory);
    setShowGenerator(false);
    setIsGenerating(false);
  };

  const handleGenerate = async (assholeMeter) => {
    if (!apiKey) {
      console.error('API key is required');
      return;
    }
    
    setIsGenerating(true);
    try {
      const prompt = `Generate an "Am I The Asshole" (AITA) story where the narrator should be judged as ${
        assholeMeter <= 3 ? 'clearly not the asshole (NTA)' :
        assholeMeter <= 7 ? 'somewhat questionable' :
        'definitely the asshole (YTA)'
      }. The story should be written in first person and include relevant context and details. Make it feel realistic and include emotional elements. Keep it between 150-300 words.`;

      const response = await createChatCompletion(apiKey, [
        { role: 'user', content: prompt }
      ]);
      
      if (response?.data?.choices?.[0]?.message?.content) {
        handleGeneratedStory(response.data.choices[0].message.content);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="story-input">
      <div className="textarea-container">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Tell your story... What happened?"
          disabled={loading}
        />
        <button 
          className="generate-tab"
          onClick={() => setShowGenerator(!showGenerator)}
          disabled={isGenerating && !showGenerator}
        >
          {showGenerator 
            ? '✕ Close' 
            : isGenerating 
              ? 'Generating...' 
              : 'Generate Story'
          }
        </button>
      </div>
      {showGenerator && (
        <div className="generator-panel">
          <StoryGenerator onStoryGenerated={handleGenerate} isGenerating={isGenerating} apiKey={apiKey} />
        </div>
      )}
      <button 
        onClick={onSubmit} 
        disabled={loading || !story.trim()}
        className="judge-button"
      >
        {loading ? 'Getting Judgments...' : 'Judge Me!'}
      </button>
    </div>
  );
}
