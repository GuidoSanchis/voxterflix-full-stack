import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AUTH_COOKIE_NAME } from '../auth.constants';

export interface JwtPayload {
  sub: string;
  email: string;
}

function extractFromCookie(req: Request): string | null {
  const cookies = req?.cookies as Record<string, string> | undefined;
  return cookies?.[AUTH_COOKIE_NAME] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: extractFromCookie,
      ignoreExpiration: false,
      // JWT_SECRET é validado como obrigatório no boot (ver config/env.validation.ts),
      // então nunca chega undefined aqui — sem fallback para não divergir do
      // assinante em auth.module.ts, que também não tem fallback.
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
