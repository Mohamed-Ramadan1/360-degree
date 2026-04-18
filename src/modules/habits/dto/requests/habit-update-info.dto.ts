import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class HabitUpdateInfoDto {
  @ApiProperty({
    description: 'The new title of the habit',
    example: 'Drink water',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'The new description of the habit',
    example: 'Drink at least 8 glasses of water per day',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;
}
