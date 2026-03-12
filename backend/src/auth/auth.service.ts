import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../lib/prisma.service.js';
import { UsersService } from '../db_services/users.service.js';
import { RegisterDto, LoginDto } from './dto/index.js';
import { User, UserRole } from '../../generated/prisma/client.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.usersService.create({
      email,
      passwordHash,
      role,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses OAuth. Please login with GitHub or Google',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      // Get user
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  async handleGitHubLogin(profile: any): Promise<AuthResponse> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new BadRequestException('GitHub account must have a public email');
    }

    // Check if user exists
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user from GitHub profile
      user = await this.usersService.create({
        email,
        role: UserRole.DEVELOPER, // Default role for GitHub signups
        isVerified: true, // GitHub emails are verified
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  async handleGoogleLogin(profile: any): Promise<AuthResponse> {
    const emails = profile.emails;
    const email = emails?.[0]?.value;
    if (!email) {
      throw new BadRequestException('Google account must have an email address');
    }

    // Check if user exists
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user from Google profile
      user = await this.usersService.create({
        email,
        role: UserRole.DEVELOPER, // Default role for Google signups
        isVerified: true, // Google emails are verified
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...tokens,
    };
  }

  async updateEmail(userId: string, newEmail: string): Promise<{ email: string }> {
    // Check if new email is already taken by another user
    const existing = await this.usersService.findByEmail(newEmail);
    if (existing && existing.id !== userId) {
      throw new ConflictException('Email already in use');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    return { email: user.email };
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'default-secret-key',
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ||
          '7d') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('REFRESH_TOKEN_SECRET') ||
          'default-refresh-secret',
        expiresIn: (this.configService.get<string>(
          'REFRESH_TOKEN_EXPIRES_IN',
        ) || '30d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
