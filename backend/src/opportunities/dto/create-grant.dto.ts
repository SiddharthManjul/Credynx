import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsUrl } from 'class-validator';

export class CreateGrantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ecosystem: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsUrl()
  @IsNotEmpty()
  websiteUrl: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;
}
