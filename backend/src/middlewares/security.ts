import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// SQL Injection対策：パラメータのバリデーション
export const validateSQLParams = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i
  ];

  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };

  // パラメータ、クエリ、ボディをチェック
  const checkObject = (obj: any): void => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (checkForSQLInjection(value)) {
          throw new AppError('不正なリクエストです', 400);
        }
        
        if (typeof value === 'object' && value !== null) {
          checkObject(value);
        }
      }
    }
  };

  try {
    if (req.params) checkObject(req.params);
    if (req.query) checkObject(req.query);
    if (req.body) checkObject(req.body);
    
    next();
  } catch (error) {
    next(error);
  }
};

// HTTPヘッダーのセキュリティ強化
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // クリックジャッキング対策
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS対策
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // コンテンツタイプの推測を無効化
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrerポリシー
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 権限ポリシー
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// APIキーの検証（将来の拡張用）
export const validateAPIKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  // 開発環境ではスキップ
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // 本番環境でAPIキーが必要な場合
  if (process.env.REQUIRE_API_KEY === 'true') {
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return next(new AppError('Invalid API key', 401));
    }
  }
  
  next();
};

// リクエストサイズの制限
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let size = 0;
    
    req.on('data', (chunk) => {
      size += chunk.length;
      
      if (size > maxSize) {
        res.status(413).json({
          success: false,
          error: {
            message: 'リクエストサイズが大きすぎます'
          }
        });
        req.destroy();
      }
    });
    
    next();
  };
};