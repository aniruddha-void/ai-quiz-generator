import React, { useState, useEffect, useCallback } from 'react';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizActive({ quiz, answers, onSelectAnswer, onSubmitQuiz, onCancelQuiz }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex] || {};
  const total = questions.length;

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);
  const selectedAnswer = answers[currentQuestion.id];

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
      setConfirmSubmit(false);
    }
  }, [currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setConfirmSubmit(false);
    }
  }, [currentIndex]);

  const handleOptionClick = useCallback((option) => {
    onSelectAnswer(currentQuestion.id, option);
  }, [currentQuestion.id, onSelectAnswer]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid intercepting if an input element is focused
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const key = e.key.toUpperCase();
      const options = currentQuestion.options || [];

      if (key === '1' || key === 'A') {
        if (options[0]) handleOptionClick(options[0]);
      } else if (key === '2' || key === 'B') {
        if (options[1]) handleOptionClick(options[1]);
      } else if (key === '3' || key === 'C') {
        if (options[2]) handleOptionClick(options[2]);
      } else if (key === '4' || key === 'D') {
        if (options[3]) handleOptionClick(options[3]);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, handleOptionClick, handleNext, handlePrev]);

  const isAllAnswered = answeredCount === total;

  return (
    <div className="glass-card fade-in">
      {/* Header bar */}
      <div className="quiz-header-bar">
        <div className="quiz-meta-info">
          <span className="topic-badge">📚 {quiz.topic}</span>
          <span className={`difficulty-pill ${quiz.difficulty.toLowerCase()}`}>
            {quiz.difficulty}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Answered: <strong>{answeredCount}</strong> / {total}
          </span>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to exit? Your quiz progress will be lost.')) {
                onCancelQuiz();
              }
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-label-row">
          <span>Question {currentIndex + 1} of {total}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Question Selector Dots */}
      <div className="question-dots-nav">
        {questions.map((q, idx) => {
          const isAnswered = Boolean(answers[q.id]);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              className={`dot-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
              onClick={() => {
                setCurrentIndex(idx);
                setConfirmSubmit(false);
              }}
              title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Current Question */}
      <div className="question-card">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>
            Q{currentIndex + 1}.
          </span>
          <h2 className="question-text" id="active-question-title">
            {currentQuestion.question}
          </h2>
        </div>

        {/* 4 Options */}
        <div className="options-list" role="radiogroup" aria-labelledby="active-question-title">
          {(currentQuestion.options || []).map((opt, optIdx) => {
            const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);
            const isSelected = selectedAnswer === opt;

            return (
              <button
                key={optIdx}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionClick(opt)}
                id={`option-btn-${currentIndex + 1}-${optIdx}`}
              >
                <span className="option-letter">{letter}</span>
                <span className="option-text">{opt}</span>
                {isSelected && (
                  <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right', marginTop: '0.25rem' }}>
          💡 Tip: Use keys [A-D] or [1-4] to select, and [←/→] arrows to navigate
        </div>
      </div>

      {/* Submission warning if needed */}
      {confirmSubmit && !isAllAnswered && (
        <div className="error-banner" style={{ marginTop: '1.25rem', background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde68a' }}>
          <span>
            ⚠️ You have {total - answeredCount} unanswered question(s). Unanswered questions will be marked incorrect.
          </span>
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            onClick={onSubmitQuiz}
          >
            Confirm Submit
          </button>
        </div>
      )}

      {/* Controls row */}
      <div className="quiz-controls-row">
        <button
          type="button"
          className="btn-secondary"
          disabled={currentIndex === 0}
          onClick={handlePrev}
        >
          ← Previous
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentIndex < total - 1 ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleNext}
              id="next-question-btn"
            >
              Next Question →
            </button>
          ) : (
            <button
              type="button"
              id="submit-quiz-btn"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
              }}
              onClick={() => {
                if (!isAllAnswered && !confirmSubmit) {
                  setConfirmSubmit(true);
                } else {
                  onSubmitQuiz();
                }
              }}
            >
              <span>🏁</span> Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
