import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsUrl } from 'class-validator';

export class CreateHackathonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ecosystem: string;

  @IsString()
  @IsNotEmpty()
  organizer: string;

  @IsNumber()
  @IsOptional()
  prizePool?: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsUrl()
  @IsNotEmpty()
  websiteUrl: string;
}
