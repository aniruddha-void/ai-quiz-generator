import React, { useState, useEffect } from 'react';

const LOADING_TIPS = [
  'Formulating 5 conceptual questions tailored to your topic...',
  'Crafting 4 balanced and plausible answer choices...',
  'Engineering clear explanations for comprehensive learning...',
  'Calibrating question complexity to your chosen difficulty level...',
  'Synthesizing diagnostic concepts for post-quiz revision...'
];

export default function LoadingScreen({ topic, difficulty }) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card loading-box fade-in">
      <div className="spinner" />
      <div>
        <h2 className="loading-title">Generating Your Quiz...</h2>
        <div style={{ color: '#a5b4fc', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Topic: <strong>{topic}</strong> • Difficulty: <strong>{difficulty}</strong>
        </div>
      </div>
      <p className="loading-tip">"{LOADING_TIPS[tipIndex]}"</p>
    </div>
  );
}
