/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Availability } from '../../../generated/prisma/client.js';

export class UpdateDeveloperProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsUrl()
  @IsOptional()
  github?: string;

  @IsUrl()
  @IsOptional()
  twitter?: string;

  @IsUrl()
  @IsOptional()
  linkedin?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(Availability)
  @IsOptional()
  availability?: Availability;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

