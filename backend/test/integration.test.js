import test from 'node:test';
import assert from 'node:assert/strict';

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

test('E2E: Health endpoint returns status ok', async () => {
  const res = await fetch(`${BACKEND_URL}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(typeof data.hasApiKey, 'boolean');
});

test('E2E: Quiz generation validates invalid inputs', async () => {
  // Empty topic
  const res1 = await fetch(`${BACKEND_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: '', difficulty: 'Medium' })
  });
  assert.equal(res1.status, 400);

  // Invalid difficulty
  const res2 = await fetch(`${BACKEND_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'JavaScript', difficulty: 'SuperExpert' })
  });
  assert.equal(res2.status, 400);
});

test('E2E: Quiz generation generates 5 questions with 4 options each', async () => {
  const res = await fetch(`${BACKEND_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: 'Data Structures', difficulty: 'Hard' })
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.totalQuestions, 5);
  assert.equal(json.data.questions.length, 5);

  for (const q of json.data.questions) {
    assert.equal(typeof q.question, 'string');
    assert(q.question.length > 5);
    assert.equal(q.options.length, 4);
    assert(q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4);
    assert.equal(q.correctAnswer, q.options[q.correctAnswerIndex]);
    assert.equal(typeof q.explanation, 'string');
    assert(q.explanation.length > 5);
  }
});

test('E2E: Personalized revision suggestions generation', async () => {
  const res = await fetch(`${BACKEND_URL}/api/quiz/revision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Data Structures',
      difficulty: 'Hard',
      score: 3,
      totalQuestions: 5,
      incorrectAnswers: [
        {
          question: 'What is the worst-case time complexity of quicksort?',
          selectedAnswer: 'O(N log N)',
          correctAnswer: 'O(N^2)',
          explanation: 'When pivot is repeatedly minimum or maximum.',
          topicConcept: 'Sorting Algorithms'
        }
      ]
    })
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.score, 3);
  assert.equal(json.data.percentage, 60);
  assert(json.data.summary.length > 10);
  assert(json.data.revisionPlan.length >= 1);
});

test('E2E: Frontend Vite server serves index.html with root div and script', async () => {
  const res = await fetch(FRONTEND_URL);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert(html.includes('<div id="root"></div>'));
  assert(html.includes('src="/src/main.jsx"'));
  assert(html.includes('AI Quiz Generator'));
});
