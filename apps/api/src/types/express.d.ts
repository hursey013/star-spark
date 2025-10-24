import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

declare module 'cookie-session' {
  interface CookieSessionObject {
    userId?: string;
    regenerate?(callback?: (err?: unknown) => void): void;
    save?(callback?: (err?: unknown) => void): void;
  }
}
