import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UserResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
