import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller(':id/reminders')
export class RemindersController {
  constructor() {}

  // Post a reminder for a specific todo
  @Post()
  postReminder() {}

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
