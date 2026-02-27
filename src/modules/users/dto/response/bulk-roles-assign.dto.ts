import { ApiProperty } from '@nestjs/swagger';
export class BulkRolesAssignResponseDto {
  @ApiProperty({
    description: 'Operation message',
    example: 'Roles assigned successfully',
  })
  message: string;
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;
  @ApiProperty({
    description: 'Number of roles skipped',
    example: 2,
  })
  skipped: number;
  @ApiProperty({
    description: 'Number of roles updated',
    example: 5,
  })
  updated: number;
  @ApiProperty({
    description: 'Details of updated and skipped user IDs',
    example: {
      updatedUserIds: ['user1', 'user2'],
      skippedUserIds: ['user3'],
    },
  })
  details: {
    updatedUserIds: string[];
    skippedUserIds: string[];
  };
}
