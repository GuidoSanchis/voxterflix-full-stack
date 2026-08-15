import type { CookieOptions } from 'express';
import ms from 'ms';

export const AUTH_COOKIE_NAME = 'voxter_token';

export function buildAuthCookieOptions(expiresIn: string): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ms(expiresIn as ms.StringValue),
    path: '/',
  };
}
