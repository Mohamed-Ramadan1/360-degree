import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { HabitsService } from '../services/habits-service';
import {
  GetHabitsDto,
  HabitCreateDto,
  HabitUpdateDto,
  HabitUpdateInfoDto,
} from '../dto';

@Controller()
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createHabit(@Body() createHabitDto: HabitCreateDto, @Req() req) {
    const habit = await this.habitsService.createHabit(
      createHabitDto,
      req.user,
    );
    return {
      message: 'Habit created successfully',
      habit,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateHabitInfo(
    @Param('id', new ParseUUIDPipe()) habitId: string,
    @Body() updateHabitDto: HabitUpdateInfoDto,
    @Req() req,
  ) {
    await this.habitsService.updateHabitInfo(habitId, updateHabitDto, req.user);
    return {
      message: 'Habit info updated successfully',
    };
  }

  @Patch(':id/schedule')
  @HttpCode(HttpStatus.OK)
  async updateHabitSchedule(
    @Param('id', new ParseUUIDPipe()) habitId: string,
    @Body() updateHabitDto: HabitUpdateDto,
    @Req() req,
  ) {
    await this.habitsService.updateHabitSchedule(
      habitId,
      updateHabitDto,
      req.user,
    );
    return {
      message: 'Habit schedule updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteHabit(
    @Param('id', new ParseUUIDPipe()) habitId: string,
    @Req() req,
  ) {
    await this.habitsService.deleteHabit(habitId, req.user);
    return {
      message: 'Habit deleted successfully',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getHabits(@Query() getHabitsDto: GetHabitsDto, @Req() req) {
    const result = await this.habitsService.getHabits(req.user, getHabitsDto);
    return {
      message: 'Habits fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getHabitById(
    @Param('id', new ParseUUIDPipe()) habitId: string,
    @Req() req,
  ) {
    const habit = await this.habitsService.getHabitById(habitId, req.user);
    return {
      message: 'Habit fetched successfully',
      habit,
    };
  }
}
