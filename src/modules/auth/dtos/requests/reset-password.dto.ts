import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @IsString()
  @ApiProperty({
    description: 'The new password for the user.',
    example: 'NewSecurePassword123!',
    required: true,
  })
  newPassword: string;
}
