import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

declare module 'cookie-session' {
  interface CookieSessionObject {
    userId?: string;
  }
}
