import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  name;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email;

  @IsString()
  @IsNotEmpty()
  @Length(8, 128)
  password;
}
