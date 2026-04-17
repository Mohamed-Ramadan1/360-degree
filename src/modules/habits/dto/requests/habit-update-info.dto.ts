import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class HabitUpdateInfoDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;
}
