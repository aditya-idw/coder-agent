import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

// Rate limiting
export const rateLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
export const corsOptions = {
  origin: [config.app.frontendUrl],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// API key validation middleware
export const validateApiKeys = (req: Request, res: Response, next: NextFunction) => {
  // Check if required API keys are present and valid
  const hasOpenAI = config.ai.openai.apiKey && config.ai.openai.apiKey.startsWith('sk-');
  const hasAnthropic = config.ai.anthropic.apiKey && config.ai.anthropic.apiKey.startsWith('sk-ant-');
  
  if (!hasOpenAI && !hasAnthropic) {
    return res.status(500).json({
      error: 'Server configuration error: No valid AI API keys configured',
    });
  }
  
  next();
};

// Request sanitization
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove any potentially dangerous characters from request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  next();
};

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potentially dangerous characters
      obj[key] = obj[key].replace(/[<>]/g, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
