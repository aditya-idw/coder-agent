import crypto from 'crypto';
import { config } from '../config/environment';

export class SecretsService {
  private static encryptionKey: Buffer | null = null;

  // Initialize encryption key from environment or generate one
  static initialize() {
    if (config.app.nodeEnv === 'production') {
      // In production, you should load this from a secure key management service
      const keyEnv = process.env.ENCRYPTION_KEY;
      if (!keyEnv) {
        throw new Error('ENCRYPTION_KEY environment variable required in production');
      }
      this.encryptionKey = Buffer.from(keyEnv, 'hex');
    } else {
      // For development, generate a temporary key
      this.encryptionKey = crypto.randomBytes(32);
      console.log('🔑 Generated temporary encryption key for development');
    }
  }

  // Encrypt sensitive data before storing
  static encrypt(text: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  // Decrypt sensitive data when retrieving
  static decrypt(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const algorithm = 'aes-256-gcm';
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Hash sensitive data for comparison (one-way)
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate secure random tokens
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
