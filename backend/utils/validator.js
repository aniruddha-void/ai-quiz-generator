/**
 * Quiz data validation and sanitization utility
 * Ensures AI generated content strictly conforms to the expected schema
 * and heals minor formatting anomalies.
 */

export function cleanJsonText(rawText) {
  if (typeof rawText !== 'string') return '';
  let cleaned = rawText.trim();
  // Strip markdown code fences like ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
}

export function safeParseJson(rawText) {
  const cleaned = cleanJsonText(rawText);
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // Attempt to extract the first balanced JSON object from the string
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (nestedErr) {
        throw new Error(`Failed to parse extracted JSON block: ${nestedErr.message}`);
      }
    }
    throw new Error(`Invalid JSON format from AI response: ${initialErr.message}`);
  }
}

/**
 * Strips redundant letter/number prefixes like "A) ", "B. ", "1. " from option strings
 */
function cleanOptionText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().replace(/^[A-D1-4][\.\)\:\-]\s+/i, '').trim();
}

/**
 * Validates and normalizes questions from AI response
 * @param {Object} rawData - Parsed JSON object from AI
 * @param {string} topic - User's chosen topic
 * @param {string} difficulty - User's chosen difficulty
 * @returns {Object} normalized quiz object
 */
export function validateAndNormalizeQuiz(rawData, topic, difficulty) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('AI response is not a valid object');
  }

  const rawQuestions = Array.isArray(rawData.questions) ? rawData.questions : [];

  if (rawQuestions.length < 3) {
    throw new Error('AI generated fewer questions than the minimum acceptable threshold.');
  }

  const normalizedQuestions = [];

  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i];
    if (!q || typeof q !== 'object') continue;

    const questionText = typeof q.question === 'string' ? q.question.trim() : '';
    if (!questionText || questionText.length < 5) continue;

    // Validate options: Must have exactly 4 clean options
    let options = Array.isArray(q.options)
      ? q.options.map(opt => cleanOptionText(opt !== null && opt !== undefined ? String(opt) : '')).filter(Boolean)
      : [];

    // Remove duplicates while preserving order
    options = [...new Set(options)];

    if (options.length < 4) {
      continue;
    }

    if (options.length > 4) {
      options = options.slice(0, 4);
    }

    // Determine correct answer index safely
    let correctIndex = -1;
    const rawAnswer = typeof q.correctAnswer === 'string' ? cleanOptionText(q.correctAnswer) : '';
    const answerStr = rawAnswer.toLowerCase();

    // Check direct numeric index
    if (typeof q.correctAnswerIndex === 'number' && Number.isInteger(q.correctAnswerIndex) && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4) {
      correctIndex = q.correctAnswerIndex;
    } else if (answerStr) {
      // Try exact string match
      correctIndex = options.findIndex(opt => opt.toLowerCase() === answerStr);

      // If not found, try matching letter prefixes like "A", "B", "C", "D"
      if (correctIndex === -1 && /^[A-D]$/i.test(answerStr)) {
        const letterMap = { a: 0, b: 1, c: 2, d: 3 };
        correctIndex = letterMap[answerStr] ?? 0;
      }

      // If still not found, check if an option contains the answer or vice-versa
      if (correctIndex === -1) {
        correctIndex = options.findIndex(opt => opt.toLowerCase().includes(answerStr) || answerStr.includes(opt.toLowerCase()));
      }
    }

    if (correctIndex < 0 || correctIndex >= options.length) {
      correctIndex = 0;
    }

    const correctAnswer = options[correctIndex];

    const explanation = typeof q.explanation === 'string' && q.explanation.trim().length > 0
      ? q.explanation.trim()
      : `The correct answer is "${correctAnswer}".`;

    const topicConcept = typeof q.topicConcept === 'string' && q.topicConcept.trim().length > 0
      ? q.topicConcept.trim()
      : topic;

    normalizedQuestions.push({
      id: normalizedQuestions.length + 1,
      question: questionText,
      options,
      correctAnswerIndex: correctIndex,
      correctAnswer,
      explanation,
      topicConcept
    });

    if (normalizedQuestions.length === 5) {
      break;
    }
  }

  if (normalizedQuestions.length < 5) {
    throw new Error(`AI generated only ${normalizedQuestions.length} valid questions out of 5 required.`);
  }

  return {
    topic: rawData.topic || topic,
    difficulty: rawData.difficulty || difficulty,
    totalQuestions: normalizedQuestions.length,
    questions: normalizedQuestions,
    generatedAt: new Date().toISOString()
  };
}
