import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService, AuthResponse } from './auth.service.js';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/index.js';
import { Public, CurrentUser } from './decorators/index.js';
import type { User } from '../../generated/prisma/client.js';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponse> {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  @Patch('email')
  async updateEmail(
    @CurrentUser() user: User,
    @Body('email') email: string,
  ) {
    return this.authService.updateEmail(user.id, email);
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // Initiates GitHub OAuth flow
    // The actual redirect is handled by Passport
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    const authResponse: AuthResponse = req.user;

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUrl = `${frontendUrl}/callback?accessToken=${authResponse.accessToken}&refreshToken=${authResponse.refreshToken}`;

    res.redirect(redirectUrl);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates Google OAuth flow
    // The actual redirect is handled by Passport
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const authResponse: AuthResponse = req.user;

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUrl = `${frontendUrl}/callback?accessToken=${authResponse.accessToken}&refreshToken=${authResponse.refreshToken}`;

    res.redirect(redirectUrl);
  }
}

