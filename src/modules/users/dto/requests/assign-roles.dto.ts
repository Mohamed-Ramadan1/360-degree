import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { UserRoles } from 'src/common/consts';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'At least one role must be assigned' })
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({
    enum: UserRoles,
    isArray: true,
    description: 'Roles will be assigned to the user.',
    example: [UserRoles.ADMIN, UserRoles.SUPER_ADMIN],
  })
  roles: UserRoles[];
}
