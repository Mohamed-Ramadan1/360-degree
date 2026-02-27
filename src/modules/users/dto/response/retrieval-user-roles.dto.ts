import { ApiProperty } from '@nestjs/swagger';
export class RetrieveUserRolesResponseDto {
  @ApiProperty({
    description: 'List of roles assigned to the user',
    example: ['admin', 'user', 'super_admin'],
  })
  roles: string[];
}
