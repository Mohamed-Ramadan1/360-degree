import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'New access token generated successfully',
    required: true,
  })
  message: string;
  @ApiProperty({
    description: 'Newly generated access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    required: true,
  })
  accessToken: string;
}
