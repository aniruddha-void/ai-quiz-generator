import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  getHealthStatus,
  handleGenerateQuiz,
  handleGenerateRevision
} from './controllers/quizController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', getHealthStatus);

// Quiz Endpoints
app.post('/api/quiz/generate', handleGenerateQuiz);
app.post('/api/quiz/revision', handleGenerateRevision);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 AI Quiz Generator Backend Server Started!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Gemini Key Configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No (Fallback Mode active)'}`);
  console.log(`===============================================`);
});

export default app;
