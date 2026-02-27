import {
  IsPhoneNumber,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  @ApiProperty({
    example: 'John Doe',
    required: false,
    description: 'The name of the user.',
  })
  name?: string;

  @IsString()
  @IsPhoneNumber('EG')
  @IsOptional()
  @ApiProperty({
    example: '+201234567890',
    required: false,
    description: 'The phone number of the user in E.164 format.',
  })
  phoneNumber?: string;
}
