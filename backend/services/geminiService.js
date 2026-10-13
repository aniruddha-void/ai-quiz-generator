/**
 * Gemini AI Service
 * Handles communication with Google Gemini API, prompt formulation,
 * model selection with fallback, and response validation.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { safeParseJson, validateAndNormalizeQuiz } from '../utils/validator.js';
import { generateFallbackQuiz, generateFallbackRevision } from './fallbackQuizService.js';

function getCandidateModels() {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const defaults = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
  return [...new Set([preferred, ...defaults])].filter(Boolean);
}

/**
 * Checks if a valid GEMINI_API_KEY is configured
 */
export function hasGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim() && key !== 'your_gemini_api_key_here');
}

/**
 * Executes a prompt against Gemini with model fallback
 */
async function callGeminiWithFallback(systemInstruction, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('MISSING_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;
  const candidateModels = getCandidateModels();

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const text = response.text();
      if (text) {
        return { text, modelName };
      }
    } catch (err) {
      lastError = err;
      const msg = err?.message?.toLowerCase() || '';
      // If error is 404 (model retired) or 503 (temporary high demand), try next candidate model
      if (
        msg.includes('not found') ||
        msg.includes('supported') ||
        msg.includes('404') ||
        msg.includes('503') ||
        msg.includes('unavailable') ||
        msg.includes('high demand')
      ) {
        console.warn(`[GeminiService] Model "${modelName}" failed (${err.message.split('\n')[0]}). Attempting next candidate.`);
        continue;
      }
      // For rate limits (429) or invalid keys (400/403), stop and throw directly
      throw err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to respond.');
}

/**
 * Generates 5 multiple-choice questions for a given topic and difficulty
 */
export async function generateQuiz({ topic, difficulty }) {
  if (!hasGeminiApiKey()) {
    console.warn('[GeminiService] GEMINI_API_KEY not configured. Serving educational fallback quiz.');
    const fallback = generateFallbackQuiz(topic, difficulty);
    return {
      ...fallback,
      isFallback: true,
      notice: 'Generated via offline educational engine (No Gemini API key configured).'
    };
  }

  const systemInstruction = `You are an elite educational quiz architect and professor.
Your role is to create rigorous, fair, and high-quality educational multiple choice questions.
You MUST output ONLY a valid JSON object matching the exact specification. Do NOT include markdown code fences or any extraneous commentary outside the JSON.`;

  const userPrompt = `Generate exactly 5 multiple choice questions on the subject: "${topic}".
Difficulty level: "${difficulty}".

Rules:
1. Provide exactly 5 questions.
2. For each question, provide exactly 4 distinct and plausible options.
3. Explicitly state the correct option in "correctAnswer" and its zero-based index in "correctAnswerIndex" (0, 1, 2, or 3).
4. Provide a clear educational explanation of why the correct answer is right and why it is significant.
5. Provide a concise topicConcept tag for the question (e.g. "Recursion", "Newton's Second Law").
6. Verify that the answer at "options[correctAnswerIndex]" is identical to "correctAnswer".

Output schema:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswerIndex": 0,
      "correctAnswer": "Option 1",
      "explanation": "string",
      "topicConcept": "string"
    }
  ]
}`;

  try {
    const { text, modelName } = await callGeminiWithFallback(systemInstruction, userPrompt);
    const parsed = safeParseJson(text);
    const normalized = validateAndNormalizeQuiz(parsed, topic, difficulty);
    return {
      ...normalized,
      isFallback: false,
      modelUsed: modelName
    };
  } catch (error) {
    console.error('[GeminiService] Quiz generation error:', error.message);
    // When API key is configured, propagate the failure so it is never masked
    throw error;
  }
}

/**
 * Generates personalized revision suggestions based on incorrect answers
 */
export async function generateRevisionSuggestions({ topic, difficulty, score, totalQuestions, incorrectAnswers }) {
  if (!hasGeminiApiKey()) {
    const fallback = generateFallbackRevision({ topic, score, totalQuestions, incorrectAnswers });
    return {
      ...fallback,
      isFallback: true,
      notice: 'Generated via offline educational engine (No Gemini API key configured).'
    };
  }

  if (!incorrectAnswers || incorrectAnswers.length === 0) {
    return generateFallbackRevision({ topic, score, totalQuestions, incorrectAnswers });
  }

  const systemInstruction = `You are a supportive, insightful educational tutor.
Analyze student quiz performance and missed questions, then produce targeted revision advice.
Return ONLY a valid JSON object conforming to the specified schema.`;

  const userPrompt = `The student completed a ${difficulty} quiz on "${topic}".
Score: ${score} out of ${totalQuestions}.

Missed Questions:
${JSON.stringify(incorrectAnswers, null, 2)}

Provide encouraging, actionable revision guidance.
Output schema:
{
  "summary": "Warm, encouraging evaluation of the student's attempt",
  "score": ${score},
  "totalQuestions": ${totalQuestions},
  "percentage": ${Math.round((score / totalQuestions) * 100)},
  "keyMisconceptions": [
    {
      "concept": "Name of concept",
      "questionSummary": "Short recap of question",
      "yourAnswer": "Student chosen answer",
      "correctAnswer": "Correct answer",
      "explanation": "Why correct answer is right",
      "advice": "Specific mental model correction or tip"
    }
  ],
  "revisionPlan": [
    "Step 1 actionable study task",
    "Step 2 actionable study task",
    "Step 3 actionable study task"
  ],
  "recommendedResources": [
    "Suggested topic or search query 1",
    "Suggested topic or search query 2"
  ]
}`;

  try {
    const { text } = await callGeminiWithFallback(systemInstruction, userPrompt);
    const parsed = safeParseJson(text);
    return {
      ...parsed,
      isFallback: false
    };
  } catch (error) {
    console.error('[GeminiService] Revision generation error:', error.message);
    // When API key is configured, propagate the failure so it is never masked
    throw error;
  }
}

