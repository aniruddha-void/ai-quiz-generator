import React, { useState } from 'react';

export default function QuizResults({
  quiz,
  answers,
  score,
  resultsBreakdown,
  revisionData,
  isLoadingRevision,
  onRetakeQuiz,
  onNewQuiz,
  onBack
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect' | 'correct'

  const total = quiz.questions?.length || 5;
  const percentage = Math.round((score / total) * 100);

  const correctItems = resultsBreakdown.filter(item => item.isCorrect);
  const incorrectItems = resultsBreakdown.filter(item => !item.isCorrect);

  const displayedItems = filter === 'incorrect'
    ? incorrectItems
    : filter === 'correct'
      ? correctItems
      : resultsBreakdown;

  const getTierInfo = () => {
    if (percentage === 100) return { title: 'Flawless Mastery!', icon: '🏆', color: '#10b981' };
    if (percentage >= 80) return { title: 'Proficient Achiever', icon: '🌟', color: '#3b82f6' };
    if (percentage >= 60) return { title: 'Solid Foundation', icon: '👍', color: '#8b5cf6' };
    if (percentage >= 40) return { title: 'Developing Knowledge', icon: '🌱', color: '#f59e0b' };
    return { title: 'Needs Focused Revision', icon: '💡', color: '#ef4444' };
  };

  const tier = getTierInfo();

  // Client-side fallback if revisionData is not yet loaded or server call failed
  const effectiveRevision = revisionData || {
    summary: percentage === 100
      ? `Phenomenal performance! You scored 100% (${score}/${total}) on ${quiz.topic}. You possess a commanding grasp of the tested syllabus.`
      : percentage >= 60
        ? `Commendable effort! You scored ${score}/${total} (${percentage}%) on ${quiz.topic}. You have a reliable foundation with minor areas to reinforce.`
        : `Keep going! You scored ${score}/${total} (${percentage}%) on ${quiz.topic}. Reviewing the core concepts below will build strong conceptual fluency.`,
    keyMisconceptions: incorrectItems.map(item => ({
      concept: item.topicConcept || quiz.topic,
      yourAnswer: item.selectedAnswer || 'Unanswered',
      correctAnswer: item.correctAnswer,
      advice: item.explanation
    })),
    revisionPlan: incorrectItems.length > 0
      ? incorrectItems.map((item, idx) => `Step ${idx + 1}: Review "${item.topicConcept || quiz.topic}" and examine why "${item.correctAnswer}" is the verified answer.`)
      : [
          `Step 1: Explore advanced topics in ${quiz.topic} to deepen your knowledge.`,
          `Step 2: Generate a "Hard" difficulty quiz to test edge cases.`,
          `Step 3: Teach these principles to a peer to reinforce retention.`
        ],
    recommendedResources: [
      `Authoritative documentation and textbook chapters for ${quiz.topic}`,
      `Diagnostic questions on: ${incorrectItems.map(a => a.topicConcept).filter(Boolean).join(', ') || quiz.topic}`,
      `Active recall flashcards for foundational terminology`
    ]
  };

  return (
    <div className="fade-in results-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Row with Back Button */}
      <div className="results-top-nav">
        <button
          type="button"
          className="btn-back-nav"
          onClick={onBack}
          aria-label="Back to quiz configuration"
          id="back-to-config-btn"
        >
          <span className="btn-back-arrow" aria-hidden="true">←</span>
          <span>Back</span>
        </button>
      </div>

      {/* Summary Score Card */}
      <div className="glass-card results-summary-card">
        <div className="score-badge-circle">
          <span className="score-number">{score}</span>
          <span className="score-total">out of {total}</span>
        </div>

        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: tier.color,
              marginBottom: '0.75rem'
            }}
          >
            <span>{tier.icon}</span> {tier.title} • {percentage}%
          </span>
          <h2 className="results-title">Quiz Performance Summary</h2>
          <p className="results-evaluation">
            Topic: <strong>{quiz.topic}</strong> ({quiz.difficulty} Level). You answered{' '}
            <strong>{score}</strong> out of <strong>{total}</strong> questions correctly.
          </p>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button type="button" className="btn-secondary" onClick={onRetakeQuiz} id="retake-quiz-btn">
            🔄 Retake This Quiz
          </button>
          <button type="button" className="btn-primary" onClick={onNewQuiz} id="new-quiz-btn">
            ✨ Generate New Topic Quiz
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.print()}
            title="Print or save as PDF"
          >
            🖨️ Print Results
          </button>
        </div>
      </div>

      {/* Feature 8: Personalized Revision Suggestions Section */}
      <section className="revision-container" id="revision-roadmap-section">
        <div className="revision-header">
          <span style={{ fontSize: '1.6rem' }}>🎯</span>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Personalized Revision Roadmap</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Tailored study guidance based on your quiz responses to close knowledge gaps.
            </p>
          </div>
        </div>

        {isLoadingRevision ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 0.75rem' }} />
            <span>Generating personalized study recommendations...</span>
          </div>
        ) : effectiveRevision ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                color: '#e0e7ff',
                fontSize: '0.95rem'
              }}
            >
              <strong>Academic Tutor Feedback:</strong> {effectiveRevision.summary}
            </div>

            {/* Targeted Misconceptions if any */}
            {effectiveRevision.keyMisconceptions && effectiveRevision.keyMisconceptions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#fca5a5' }}>
                  🔍 Concept Breakdown ({effectiveRevision.keyMisconceptions.length} area(s) to review)
                </h4>
                {effectiveRevision.keyMisconceptions.map((misc, idx) => (
                  <div key={idx} className="misconception-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="misconception-concept">📌 {misc.concept}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <strong>Your answer:</strong> <span style={{ textDecoration: 'line-through' }}>{misc.yourAnswer || 'Unanswered'}</span>
                      <br />
                      <strong>Correct concept:</strong> <span style={{ color: '#a7f3d0' }}>{misc.correctAnswer}</span>
                    </div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      💡 <em>{misc.advice || misc.explanation}</em>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actionable Revision Plan */}
            {effectiveRevision.revisionPlan && effectiveRevision.revisionPlan.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#93c5fd' }}>
                  📋 Recommended Action Plan
                </h4>
                <div className="revision-plan-list">
                  {effectiveRevision.revisionPlan.map((step, idx) => (
                    <div key={idx} className="revision-step-item">
                      <span className="step-num">{idx + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Resources / Topics */}
            {effectiveRevision.recommendedResources && effectiveRevision.recommendedResources.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recommended Topics to Search & Review:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {effectiveRevision.recommendedResources.map((res, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        color: '#cbd5e1'
                      }}
                    >
                      📖 {res}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* Feature 7: Detailed Question Review & Explanations */}
      <section className="glass-card" id="question-review-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Question Review & Explanations</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Inspect verified answers and comprehensive reasoning for every question.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="results-filter-bar" style={{ margin: 0 }}>
            <button
              type="button"
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({total})
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === 'incorrect' ? 'active' : ''}`}
              onClick={() => setFilter('incorrect')}
            >
              Incorrect ({incorrectItems.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === 'correct' ? 'active' : ''}`}
              onClick={() => setFilter('correct')}
            >
              Correct ({correctItems.length})
            </button>
          </div>
        </div>

        {displayedItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No questions match the selected filter.
          </div>
        ) : (
          displayedItems.map((item, idx) => {
            const { question, isCorrect, selectedAnswer, correctAnswer, explanation, topicConcept } = item;

            return (
              <div
                key={question.id || idx}
                className={`review-item ${isCorrect ? 'correct' : 'incorrect'} fade-in`}
              >
                <div className="review-header">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Question {question.id} • {topicConcept || quiz.topic}
                    </span>
                    <h4 className="review-question-title">{question.question}</h4>
                  </div>
                  <span className={`status-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✓ Correct' : selectedAnswer ? '✕ Incorrect' : '∅ Skipped'}
                  </span>
                </div>

                {/* 4 Options breakdown */}
                <div className="review-options">
                  {(question.options || []).map((opt, optIdx) => {
                    const isSelected = selectedAnswer && selectedAnswer.toLowerCase().trim() === opt.toLowerCase().trim();
                    const isAnswerCorrect = correctAnswer && correctAnswer.toLowerCase().trim() === opt.toLowerCase().trim();

                    let optClass = 'review-option';
                    if (isAnswerCorrect) optClass += ' is-correct';
                    else if (isSelected && !isCorrect) optClass += ' is-user-incorrect';

                    return (
                      <div key={optIdx} className={optClass}>
                        <span>{opt}</span>
                        {isAnswerCorrect && (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                            ✓ Correct Answer {isSelected ? '(Your Choice)' : ''}
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>
                            ✕ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Explanation */}
                <div className="explanation-box">
                  <div className="explanation-title">
                    <span>💡</span> Explanation:
                  </div>
                  <p style={{ lineHeight: 1.5 }}>{explanation}</p>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
