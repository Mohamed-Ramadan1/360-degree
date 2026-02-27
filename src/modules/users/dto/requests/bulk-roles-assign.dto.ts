import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { UserRoles } from 'src/common/consts/roles';
import { ApiProperty } from '@nestjs/swagger';
export class BulkRolesAssignDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'At least one role must be assigned' })
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({
    enum: UserRoles,
    isArray: true,
    description: 'Roles to be assigned to the selected users.',
    example: [UserRoles.ADMIN, UserRoles.SUPPORT_ADMIN],
  })
  roles: UserRoles[];

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'At least one user must be selected' })
  @ApiProperty({
    isArray: true,
    description: 'Users to whom the roles will be assigned.',
    example: ['userId1', 'userId2', 'userId3'],
  })
  users: string[];
}
