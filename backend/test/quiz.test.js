import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanJsonText, safeParseJson, validateAndNormalizeQuiz } from '../utils/validator.js';
import { generateFallbackQuiz, generateFallbackRevision } from '../services/fallbackQuizService.js';

test('Validator: cleanJsonText strips markdown fences', () => {
  const fenced = '```json\n{"key": "value"}\n```';
  assert.equal(cleanJsonText(fenced), '{"key": "value"}');

  const plain = '  {"hello": "world"}  ';
  assert.equal(cleanJsonText(plain), '{"hello": "world"}');
});

test('Validator: safeParseJson handles embedded JSON correctly', () => {
  const jsonStr = 'Here is the response:\n```json\n{"status": "ok", "count": 5}\n```\nHope this helps!';
  const parsed = safeParseJson(jsonStr);
  assert.equal(parsed.status, 'ok');
  assert.equal(parsed.count, 5);
});

test('Validator: strips redundant letter prefixes from options', () => {
  const rawWithPrefixes = {
    topic: 'Python',
    difficulty: 'Easy',
    questions: [
      {
        question: 'What is the file extension for Python files?',
        options: ['A) .py', 'B) .python', 'C) .pt', 'D) .p'],
        correctAnswerIndex: 0,
        correctAnswer: 'A) .py',
        explanation: 'Python script files use the .py file extension.',
        topicConcept: 'File Extensions'
      },
      {
        question: 'Which keyword defines a function?',
        options: ['1. func', '2. def', '3. function', '4. fn'],
        correctAnswerIndex: 1,
        correctAnswer: 'def',
        explanation: 'The def keyword defines a function in Python.',
        topicConcept: 'Functions'
      },
      {
        question: 'How do you insert comments in Python code?',
        options: ['# This is a comment', '// This is a comment', '/* comment */', '<!-- comment -->'],
        correctAnswerIndex: 0,
        correctAnswer: '# This is a comment',
        explanation: 'Comments start with a hash symbol.',
        topicConcept: 'Comments'
      },
      {
        question: 'Which data structure is mutable and uses square brackets?',
        options: ['List', 'Tuple', 'Set', 'FrozenSet'],
        correctAnswerIndex: 0,
        correctAnswer: 'List',
        explanation: 'Lists are mutable ordered sequences.',
        topicConcept: 'Data Structures'
      },
      {
        question: 'Which function prints output to the console?',
        options: ['print()', 'echo()', 'console.log()', 'System.out.println()'],
        correctAnswerIndex: 0,
        correctAnswer: 'print()',
        explanation: 'print() is built-in in Python.',
        topicConcept: 'I/O'
      }
    ]
  };

  const normalized = validateAndNormalizeQuiz(rawWithPrefixes, 'Python', 'Easy');
  assert.equal(normalized.totalQuestions, 5);
  // Option prefixes "A) " and "1. " should be stripped for clean rendering
  assert.equal(normalized.questions[0].options[0], '.py');
  assert.equal(normalized.questions[1].options[1], 'def');
  assert.equal(normalized.questions[0].correctAnswer, '.py');
});

test('FallbackService: generates distributed options for JavaScript', () => {
  const quiz = generateFallbackQuiz('JavaScript', 'Medium');
  assert.equal(quiz.totalQuestions, 5);
  assert.equal(quiz.questions.length, 5);

  for (const q of quiz.questions) {
    assert.equal(q.options.length, 4);
    assert(q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4);
    assert.equal(q.correctAnswer, q.options[q.correctAnswerIndex]);
    assert(q.explanation.length > 5);
  }
});

test('FallbackService: generates revision suggestions for partial score', () => {
  const revision = generateFallbackRevision({
    topic: 'JavaScript',
    score: 3,
    totalQuestions: 5,
    incorrectAnswers: [
      {
        question: 'Which is NOT a primitive type?',
        selectedAnswer: 'Symbol',
        correctAnswer: 'Object',
        explanation: 'Object is reference type',
        topicConcept: 'Data Types'
      }
    ]
  });

  assert.equal(revision.score, 3);
  assert.equal(revision.percentage, 60);
  assert.equal(revision.keyMisconceptions.length, 1);
  assert(revision.revisionPlan.length >= 1);
  assert(revision.recommendedResources.length >= 1);
});

test('FallbackService: handles 100% score (zero missed questions) gracefully', () => {
  const revision = generateFallbackRevision({
    topic: 'React',
    score: 5,
    totalQuestions: 5,
    incorrectAnswers: []
  });

  assert.equal(revision.score, 5);
  assert.equal(revision.percentage, 100);
  assert.equal(revision.keyMisconceptions.length, 0);
  assert(revision.summary.includes('100%'));
  assert(revision.revisionPlan.length >= 1);
});
