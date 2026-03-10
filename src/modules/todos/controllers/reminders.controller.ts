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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@UseInterceptors(TransformResponseInterceptor)
@Throttle({ default: { limit: 25, ttl: 600000 } })
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
      req.user.id,
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
  @Patch(':reminderId')
  updateReminder() {}

  // Delete a specific reminder for a specific todo
  @Delete(':reminderId')
  deleteReminder() {}
}
