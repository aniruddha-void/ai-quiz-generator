
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import QuizConfigForm from './components/QuizConfigForm.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import QuizActive from './components/QuizActive.jsx';
import QuizResults from './components/QuizResults.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import './App.css';

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://ai-quiz-generator-k6wv.onrender.com'
).replace(/\/$/, '');

export default function App() {
  const [view, setView] = useState('config');
  const [apiHealth, setApiHealth] = useState({
    checking: true,
    connected: false,
    hasApiKey: false
  });
  const [currentParams, setCurrentParams] = useState({
    topic: '',
    difficulty: 'Medium'
  });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [resultsBreakdown, setResultsBreakdown] = useState([]);
  const [revisionData, setRevisionData] = useState(null);
  const [isLoadingRevision, setIsLoadingRevision] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check backend health on mount
  const checkApiHealth = useCallback(async () => {
    try {
      setApiHealth(prev => ({ ...prev, checking: true }));

      const res = await fetch(`${API_URL}/api/health`);

      if (res.ok) {
        const data = await res.json();

        setApiHealth({
          checking: false,
          connected: true,
          hasApiKey: Boolean(data.hasApiKey)
        });
      } else {
        setApiHealth({
          checking: false,
          connected: false,
          hasApiKey: false
        });
      }
    } catch (error) {
      console.error('[App] Backend health check failed:', error);

      setApiHealth({
        checking: false,
        connected: false,
        hasApiKey: false
      });
    }
  }, []);

  useEffect(() => {
    checkApiHealth();
  }, [checkApiHealth]);

  // Generate quiz
  const handleStartQuiz = async ({ topic, difficulty }) => {
    setCurrentParams({ topic, difficulty });
    setErrorMessage('');
    setView('loading');

    try {
      const response = await fetch(`${API_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic, difficulty })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message ||
          `Failed to generate quiz (Status ${response.status})`
        );
      }

      const json = await response.json();

      if (
        !json.success ||
        !json.data ||
        !Array.isArray(json.data.questions) ||
        json.data.questions.length === 0
      ) {
        throw new Error('Received invalid quiz structure from server.');
      }

      setActiveQuiz(json.data);
      setAnswers({});
      setView('active');
    } catch (err) {
      console.error('[App] Generate quiz error:', err);

      setErrorMessage(
        err.message ||
        'Unable to connect to the quiz service. Please try again.'
      );

      setView('config');
    }
  };

  // Answer selection
  const handleSelectAnswer = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  // Calculate score and fetch revision suggestions
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    const questions = activeQuiz.questions || [];
    let calculatedScore = 0;
    const breakdown = [];
    const incorrect = [];

    questions.forEach(q => {
      const selected = answers[q.id];

      const isCorrect =
        Boolean(selected) &&
        String(selected).trim().toLowerCase() ===
        String(q.correctAnswer).trim().toLowerCase();

      if (isCorrect) {
        calculatedScore += 1;
      } else {
        incorrect.push({
          question: q.question,
          selectedAnswer: selected || 'Skipped / Unanswered',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topicConcept: q.topicConcept
        });
      }

      breakdown.push({
        question: q,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        topicConcept: q.topicConcept
      });
    });

    setScore(calculatedScore);
    setResultsBreakdown(breakdown);
    setView('results');

    // Fetch personalized revision suggestions
    setIsLoadingRevision(true);
    setRevisionData(null);

    try {
      const res = await fetch(`${API_URL}/api/quiz/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: activeQuiz.topic,
          difficulty: activeQuiz.difficulty,
          score: calculatedScore,
          totalQuestions: questions.length,
          incorrectAnswers: incorrect
        })
      });

      if (res.ok) {
        const revJson = await res.json();
        setRevisionData(revJson.data);
      } else {
        console.warn(
          '[App] Revision request failed with status:',
          res.status
        );
      }
    } catch (err) {
      console.warn('[App] Revision fetch error:', err);
    } finally {
      setIsLoadingRevision(false);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setView('active');
  };

  const handleNewQuiz = () => {
    setActiveQuiz(null);
    setAnswers({});
    setRevisionData(null);
    setErrorMessage('');
    setView('config');
  };

  const handleBackToConfig = () => {
    setErrorMessage('');
    setView('config');
  };

  return (
    <div className="app-container">
      <Header
        apiHealth={apiHealth}
        onReset={handleNewQuiz}
      />

      <main id="main-content">
        <ErrorMessage
          message={errorMessage}
          onDismiss={() => setErrorMessage('')}
          onRetry={
            currentParams.topic
              ? () => handleStartQuiz(currentParams)
              : null
          }
        />

        {view === 'config' && (
          <QuizConfigForm
            onStartQuiz={handleStartQuiz}
            isLoading={false}
            initialTopic={currentParams.topic}
            initialDifficulty={currentParams.difficulty}
          />
        )}

        {view === 'loading' && (
          <LoadingScreen
            topic={currentParams.topic}
            difficulty={currentParams.difficulty}
          />
        )}

        {view === 'active' && activeQuiz && (
          <QuizActive
            quiz={activeQuiz}
            answers={answers}
            onSelectAnswer={handleSelectAnswer}
            onSubmitQuiz={handleSubmitQuiz}
            onCancelQuiz={handleNewQuiz}
          />
        )}

        {view === 'results' && activeQuiz && (
          <QuizResults
            quiz={activeQuiz}
            answers={answers}
            score={score}
            resultsBreakdown={resultsBreakdown}
            revisionData={revisionData}
            isLoadingRevision={isLoadingRevision}
            onRetakeQuiz={handleRetakeQuiz}
            onNewQuiz={handleNewQuiz}
            onBack={handleBackToConfig}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          AI Quiz Generator • Built with React, Vite, Node.js, Express & Google Gemini API
        </p>

        <p
          style={{
            color: 'var(--text-dim)',
            fontSize: '0.8rem'
          }}
        >
          Free Educational Application for College Internship Assessment
        </p>
      </footer>
    </div>
  );
}