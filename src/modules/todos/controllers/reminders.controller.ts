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
} from '@nestjs/common';
import { ReminderCreateDto } from '../dto';
import { ReminderService } from '../services/reminder.service';

@Controller(':id/reminders')
export class RemindersController {
  constructor(private readonly reminderService: ReminderService) {}

  // Post a reminder for a specific todo
  @Post()
  async postReminder(
    @Param('id', new ParseUUIDPipe()) todoId: string,
    @Body() reminderDto: ReminderCreateDto,
    @Req() req,
  ) {
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
  @Get()
  getReminders() {}

  // Update a specific reminder for a specific todo
  @Patch(':reminderId')
  updateReminder() {}

  // Delete a specific reminder for a specific todo
  @Delete(':reminderId')
  deleteReminder() {}
}
