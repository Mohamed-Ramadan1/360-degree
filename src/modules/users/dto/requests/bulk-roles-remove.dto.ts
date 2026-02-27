import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { UserRoles } from 'src/common/consts';
import { ApiProperty } from '@nestjs/swagger';

export class BulkRolesRemoveDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'At least one role must be removed' })
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({
    enum: UserRoles,
    isArray: true,
    description: 'Roles to be removed from the selected users.',
    example: [UserRoles.ADMIN, UserRoles.SUPPORT_ADMIN],
  })
  roles: UserRoles[];

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'At least one user must be selected' })
  @ApiProperty({
    isArray: true,
    description: 'Users from whom the roles will be removed.',
    example: ['userId1', 'userId2', 'userId3'],
  })
  users: string[];
}
