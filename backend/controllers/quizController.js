import { generateQuiz, generateRevisionSuggestions, hasGeminiApiKey } from '../services/geminiService.js';

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export async function getHealthStatus(req, res) {
  res.json({
    status: 'ok',
    service: 'AI Quiz Generator API',
    version: '1.0.0',
    hasApiKey: hasGeminiApiKey(),
    timestamp: new Date().toISOString()
  });
}

export async function handleGenerateQuiz(req, res, next) {
  try {
    const { topic, difficulty = 'Medium' } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Topic is required and must be at least 2 characters.'
      });
    }

    if (topic.trim().length > 150) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Topic cannot exceed 150 characters.'
      });
    }

    const normalizedDifficulty = VALID_DIFFICULTIES.find(
      d => d.toLowerCase() === String(difficulty).trim().toLowerCase()
    );

    if (!normalizedDifficulty) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`
      });
    }

    const quiz = await generateQuiz({
      topic: topic.trim(),
      difficulty: normalizedDifficulty
    });

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGenerateRevision(req, res, next) {
  try {
    const { topic, difficulty = 'Medium', score, totalQuestions, incorrectAnswers } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Topic is required.'
      });
    }

    if (typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Score and totalQuestions must be numbers.'
      });
    }

    const revision = await generateRevisionSuggestions({
      topic: topic.trim(),
      difficulty,
      score,
      totalQuestions,
      incorrectAnswers: Array.isArray(incorrectAnswers) ? incorrectAnswers : []
    });

    res.json({
      success: true,
      data: revision
    });
  } catch (error) {
    next(error);
  }
}
