import type { Request } from 'express';
import type { Profile as PassportProfile, Strategy as PassportStrategy } from 'passport';

declare module 'passport-github2' {
  interface StrategyOptionsBase {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string | string[];
    customHeaders?: Record<string, string>;
    userAgent?: string;
  }

  interface StrategyOptions extends StrategyOptionsBase {
    passReqToCallback?: false;
  }

  interface StrategyOptionsWithRequest extends StrategyOptionsBase {
    passReqToCallback: true;
  }

  type VerifyCallback = (err?: any, user?: any, info?: any) => void;

  interface Profile extends PassportProfile {
    _raw: string;
    _json: any;
  }

  type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    params: any,
    profile: Profile,
    done: VerifyCallback
  ) => void | Promise<void>;

  type VerifyFunctionWithRequest = (
    req: Request,
    accessToken: string,
    refreshToken: string,
    params: any,
    profile: Profile,
    done: VerifyCallback
  ) => void | Promise<void>;

  class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    constructor(options: StrategyOptionsWithRequest, verify: VerifyFunctionWithRequest);
    name: string;
  }

  export { Strategy, StrategyOptions, StrategyOptionsWithRequest, VerifyCallback, Profile };
}
