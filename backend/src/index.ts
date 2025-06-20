import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { rateLimiter, corsOptions, securityHeaders, validateApiKeys, sanitizeRequest } from './middleware/security';
import { SecretsService } from './services/secrets';
import { printSetupStatus } from './utils/setup-check';

const app = express();

// Initialize services
SecretsService.initialize();

// Validate setup before starting
printSetupStatus();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);
app.use(validateApiKeys);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// Basic API routes placeholder
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'AI Coder API is running',
    environment: config.app.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: config.app.nodeEnv === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = config.app.port;

app.listen(PORT, () => {
  console.log(`🚀 AI Coder backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.app.nodeEnv}`);
  console.log(`🔒 Security: Rate limiting, CORS, and headers enabled`);
  console.log(`🤖 AI Providers: OpenAI + Anthropic configured`);
});
