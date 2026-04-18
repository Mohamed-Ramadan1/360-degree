import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  GetRemindersResponse,
  ReminderCreateDto,
  ReminderCreateResponse,
  ReminderUpdateDto,
} from '../dto';
import { ReminderService } from '../services/reminder.service';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OperationSuccessDto } from 'src/modules/auth/dtos';

@UseInterceptors(TransformResponseInterceptor)
@Throttle({ default: { limit: 25, ttl: 600000 } })
@ApiTags('Reminders')
@ApiBearerAuth('JWT-auth')
@Controller(':id/reminders')
export class RemindersController {
  constructor(private readonly reminderService: ReminderService) {}

  // Post a reminder for a specific todo
  @ApiOperation({
    summary: 'Create a reminder for a specific todo',
    description:
      'Creates a reminder for a specific todo. The reminder will be sent to the user at the specified time.',
  })
  @ApiBody({
    type: ReminderCreateDto,
    description: 'The data required to create a new reminder',
    examples: {
      valid: {
        summary: 'Valid reminder creation request',
        value: {
          time: '2024-07-01T10:00:00Z',
          message: 'Reminder for my todo',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'The reminder was created successfully',
    type: ReminderCreateResponse,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to create a reminder.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. The request body must contain valid time and message fields.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the todo for which the reminder is being created',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Post()
  async postReminder(
    @Param('id', new ParseUUIDPipe()) todoId: string,
    @Body() reminderDto: ReminderCreateDto,
    @Req() req,
  ): Promise<ReminderCreateResponse> {
    const reminder = await this.reminderService.createReminder(
      todoId,
      reminderDto,
      req.user,
    );

    return {
      message: 'Reminder created successfully',
      reminder: reminder,
    };
  }

  // Get all reminders for a specific todo
  @ApiOperation({
    summary: 'Get all reminders for a specific todo',
    description:
      'Retrieves all reminders associated with a specific todo. The user must be the owner of the todo to access its reminders.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the todo for which to retrieve reminders',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Reminders retrieved successfully',
    type: GetRemindersResponse,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to retrieve reminders.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid todo ID. The provided ID must be a valid UUID corresponding to an existing todo.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the todo for which to retrieve reminders',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Get()
  async getReminders(
    @Param('id', new ParseUUIDPipe()) todoId: string,
    @Req() req,
  ): Promise<GetRemindersResponse> {
    const reminders = await this.reminderService.getRemindersForTodo(
      todoId,
      req.user.id,
    );
    return { message: 'Reminders retrieved successfully', reminders };
  }

  // Update a specific reminder for a specific todo
  @ApiOperation({
    summary: 'Update a specific reminder for a specific todo',
    description:
      'Updates a specific reminder associated with a todo. The user must be the owner of the todo to update its reminders.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the todo to which the reminder belongs',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'reminderId',
    description: 'The UUID of the reminder to be updated',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiBody({
    type: ReminderUpdateDto,
    description: 'The data required to update an existing reminder',
    examples: {
      valid: {
        summary: 'Valid reminder update request',
        value: {
          reminderAt: '2024-07-01T12:00:00Z',
        },
      },
      invalid: {
        summary: 'Invalid reminder update request',
        value: {
          reminderAt: 'invalid-date-format',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'The reminder was updated successfully',
    type: OperationSuccessDto,
    example: {
      message: 'Reminder updated successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to update a reminder.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. The request body must contain valid time and message fields.',
  })
  @Patch(':reminderId')
  async updateReminder(
    @Param('id', new ParseUUIDPipe()) todoId: string,
    @Param('reminderId', new ParseUUIDPipe()) reminderId: string,
    @Body() reminderDto: ReminderUpdateDto,
    @Req() req,
  ): Promise<OperationSuccessDto> {
    await this.reminderService.updateReminder(
      todoId,
      reminderId,
      reminderDto,
      req.user,
    );
    return { message: 'Reminder updated successfully' };
  }

  // Delete a specific reminder for a specific todo
  @ApiOperation({
    summary: 'Delete a specific reminder for a specific todo',
    description:
      'Deletes a specific reminder associated with a todo. The user must be the owner of the todo to delete its reminders.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the todo from which to delete the reminder',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'reminderId',
    description: 'The UUID of the reminder to be deleted',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiOkResponse({
    description: 'The reminder was deleted successfully',
    type: OperationSuccessDto,
    example: {
      message: 'Reminder deleted successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. The user must be authenticated to delete a reminder.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. The provided IDs must be valid UUIDs corresponding to existing todo and reminder.',
  })
  @Delete(':reminderId')
  async deleteReminder(
    @Param('id', new ParseUUIDPipe()) todoId: string,
    @Param('reminderId', new ParseUUIDPipe()) reminderId: string,
    @Req() req,
  ): Promise<OperationSuccessDto> {
    await this.reminderService.deleteReminder(todoId, reminderId, req.user.id);
    return { message: 'Reminder deleted successfully' };
  }
}
