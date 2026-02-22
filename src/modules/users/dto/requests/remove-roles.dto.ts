import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { UserRoles } from 'src/common/consts/roles';
import { ApiProperty } from '@nestjs/swagger';

export class RemovedRolesDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'At least one role must be removed' })
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({
    enum: UserRoles,
    isArray: true,
    description: 'Roles to be removed from the user.',
    example: [UserRoles.ADMIN, UserRoles.SUPPORT_ADMIN],
  })
  roles: UserRoles[];
}
