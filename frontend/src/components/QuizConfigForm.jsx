import React, { useState, useEffect } from 'react';

const POPULAR_TOPICS = [
  'JavaScript ES6',
  'Data Structures & Algorithms',
  'Photosynthesis & Botany',
  'World War II History',
  'Quantum Physics',
  'Macroeconomics',
  'Machine Learning Basics',
  'Human Anatomy'
];

export default function QuizConfigForm({
  onStartQuiz,
  isLoading,
  initialTopic = '',
  initialDifficulty = 'Medium'
}) {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    if (initialDifficulty) {
      setDifficulty(initialDifficulty);
    }
  }, [initialDifficulty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = topic.trim();
    if (!clean) {
      setValidationError('Please enter a subject or topic to generate your quiz.');
      return;
    }
    if (clean.length < 2) {
      setValidationError('Topic must be at least 2 characters long.');
      return;
    }
    setValidationError('');
    onStartQuiz({ topic: clean, difficulty });
  };

  const handleSelectTopic = (suggested) => {
    setTopic(suggested);
    setValidationError('');
  };

  return (
    <div className="glass-card fade-in">
      <form className="config-form" onSubmit={handleSubmit}>
        {/* Topic Input */}
        <div className="form-group">
          <label htmlFor="topic-input" className="form-label">
            <span>Subject or Topic</span>
            <span className="required-dot">*</span>
          </label>
          <div className="input-wrapper">
            <span className="input-icon">🔍</span>
            <input
              id="topic-input"
              type="text"
              className="topic-input"
              placeholder="e.g., Photosynthesis, Python OOP, European History, Calculus..."
              value={topic}
              maxLength={120}
              onChange={(e) => {
                setTopic(e.target.value);
                if (validationError) setValidationError('');
              }}
              autoFocus
              disabled={isLoading}
            />
          </div>

          {validationError && (
            <span style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              ⚠️ {validationError}
            </span>
          )}

          {/* Quick topic pills */}
          <div className="quick-topics" style={{ marginTop: '0.5rem' }}>
            <span className="quick-topics-label">Or explore popular subjects:</span>
            <div className="topic-chips">
              {POPULAR_TOPICS.map((t) => (
                <button
                  type="button"
                  key={t}
                  className="topic-chip"
                  onClick={() => handleSelectTopic(t)}
                  disabled={isLoading}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="form-group">
          <label className="form-label">
            <span>Choose Difficulty Level</span>
            <span className="required-dot">*</span>
          </label>
          <div className="difficulty-grid">
            <div
              className={`difficulty-card easy ${difficulty === 'Easy' ? 'active' : ''}`}
              onClick={() => setDifficulty('Easy')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setDifficulty('Easy')}
            >
              <span className="diff-icon">🌱</span>
              <span className="diff-title">Easy</span>
              <span className="diff-desc">Foundational concepts & definitions</span>
            </div>

            <div
              className={`difficulty-card medium ${difficulty === 'Medium' ? 'active' : ''}`}
              onClick={() => setDifficulty('Medium')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setDifficulty('Medium')}
            >
              <span className="diff-icon">⚡</span>
              <span className="diff-title">Medium</span>
              <span className="diff-desc">Core applications & reasoning</span>
            </div>

            <div
              className={`difficulty-card hard ${difficulty === 'Hard' ? 'active' : ''}`}
              onClick={() => setDifficulty('Hard')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setDifficulty('Hard')}
            >
              <span className="diff-icon">🔥</span>
              <span className="diff-title">Hard</span>
              <span className="diff-desc">Complex edge cases & mastery</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          id="generate-quiz-btn"
          className="btn-primary"
          disabled={isLoading || !topic.trim()}
          style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
        >
          <span>✨</span>
          <span>Generate 5-Question Quiz</span>
        </button>
      </form>
    </div>
  );
}
