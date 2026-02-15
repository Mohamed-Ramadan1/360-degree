import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: true,
  })
  name;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
    required: true,
  })
  email;

  @IsString()
  @IsNotEmpty()
  @Length(8, 128)
  @ApiProperty({
    description: 'The password of the user',
    example: 'strongPassword123',
    required: true,
  })
  password;
}
