import { useState } from 'react';
import '../styles/StoryGenerator.css';

const StoryGenerator = ({ onStoryGenerated, isGenerating }) => {
  const [assholeMeter, setAssholeMeter] = useState(5);

  return (
    <div className="story-generator">
      <div className="meter-container">
        <label htmlFor="asshole-meter">
          Asshole Level: {assholeMeter}
          {isGenerating && <span className="generating-indicator">Generating...</span>}
        </label>
        <input
          type="range"
          id="asshole-meter"
          min="1"
          max="10"
          value={assholeMeter}
          onChange={(e) => setAssholeMeter(parseInt(e.target.value))}
          className="slider"
          disabled={isGenerating}
        />
        <button 
          className="generate-button"
          onClick={() => onStoryGenerated(assholeMeter)}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Story'}
        </button>
      </div>
    </div>
  );
};

export default StoryGenerator;
