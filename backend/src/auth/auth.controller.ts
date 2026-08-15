import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AUTH_COOKIE_NAME, buildAuthCookieOptions } from './auth.constants';
import { AuthService } from './auth.service';
import {
  CurrentUser,
  type CurrentUserPayload,
} from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, user } = await this.authService.register(dto);
    this.setAuthCookie(response, accessToken);
    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, user } = await this.authService.login(dto);
    this.setAuthCookie(response, accessToken);
    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(
      AUTH_COOKIE_NAME,
      buildAuthCookieOptions(this.expiresIn),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: CurrentUserPayload) {
    const found = await this.usersService.findById(user.userId);
    if (!found) return null;
    return { id: found.id, name: found.name, email: found.email };
  }

  private get expiresIn() {
    return this.config.get<string>('JWT_EXPIRES_IN', '7d');
  }

  private setAuthCookie(response: Response, accessToken: string) {
    response.cookie(
      AUTH_COOKIE_NAME,
      accessToken,
      buildAuthCookieOptions(this.expiresIn),
    );
  }
}
