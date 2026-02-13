import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @IsString()
  newPassword: string;
}
