import { ApiProperty } from '@nestjs/swagger';

export class OperationSuccessDto {
  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'A message indicating the success of the operation',
  })
  message: string;
}
