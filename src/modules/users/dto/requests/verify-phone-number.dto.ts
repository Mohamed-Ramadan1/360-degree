import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPhoneNumberDto {
  @IsNotEmpty({ message: 'OTP code is required' })
  @IsString({ message: 'OTP code must be a string' })
  @Length(6, 6, { message: 'OTP code must be exactly 6 characters' })
  @Matches(/^[0-9]+$/, { message: 'OTP code must contain only digits' })
  @ApiProperty({
    example: '123456',
    required: true,
    description: 'The OTP code sent to the user for phone number verification.',
  })
  otpCode: string;
}
