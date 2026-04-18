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
  UseInterceptors,
} from '@nestjs/common';
import { HabitsService } from '../services/habits-service';
import {
  getHabitResponse,
  GetHabitsDto,
  GetHabitsResponse,
  HabitCreateDto,
  HabitCreateResponse,
  HabitUpdateDto,
  HabitUpdateInfoDto,
} from '../dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { Throttle } from '@nestjs/throttler';
import { OperationSuccessDto } from 'src/modules/auth/dtos';

@Throttle({ default: { limit: 25, ttl: 600000 } })
@UseInterceptors(TransformResponseInterceptor)
@ApiTags('Habits')
@Controller()
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @ApiOperation({
    summary: 'Create a new habit',
    description:
      'Create a new habit with the specified details. The habit will be associated with the authenticated user.',
  })
  @ApiOkResponse({
    type: HabitCreateResponse,
    description: 'The habit has been successfully created.',
    example: {
      message: 'Habit created successfully',
      habit: {
        id: '1',
        title: 'Drink water',
        description: 'Drink at least 8 glasses of water per day',
        recurrenceType: 'DAILY',
        time: '09:00',
        dayOfMonth: null,
        endDate: null,
        nextTriggerAt: new Date(),
        ownerId: 'user1',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. Please check the request body and try again.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. Please provide valid authentication credentials.',
  })
  @ApiBody({
    type: HabitCreateDto,
    description: 'The details of the habit to be created.',
    examples: {
      valid: {
        summary: 'Valid Habit Creation Request',
        value: {
          title: 'Morning Jog',
          description: 'Jog for 30 minutes every morning to stay fit.',
          recurrenceType: 'DAILY',
          time: '07:00',
        },
      },
      invalid: {
        summary: 'Invalid Habit Creation Request',
        value: {
          title: '',
          description:
            'This description is way too long and exceeds the maximum length allowed for the description field. It should be less than 500 characters.',
          recurrenceType: '',
          time: '07:00 AM',
        },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createHabit(
    @Body() createHabitDto: HabitCreateDto,
    @Req() req,
  ): Promise<HabitCreateResponse> {
    const habit = await this.habitsService.createHabit(
      createHabitDto,
      req.user,
    );
    return {
      message: 'Habit created successfully',
      habit,
    };
  }

  @ApiOperation({
    summary: 'Update habit information',
    description:
      'Update the title and/or description of an existing habit. The habit must belong to the authenticated user.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'The habit info has been successfully updated.',
    example: {
      message: 'Habit info updated successfully',
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. Please check the request body and try again.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. Please provide valid authentication credentials.',
  })
  @ApiBody({
    type: HabitUpdateInfoDto,
    description: 'The new title and/or description for the habit.',
    examples: {
      valid: {
        summary: 'Valid Habit Info Update Request',
        value: {
          title: 'Drink more water',
          description: 'Aim to drink at least 10 glasses of water per day.',
        },
      },
      invalid: {
        summary: 'Invalid Habit Info Update Request',
        value: {
          title: '',
          description:
            'This description is way too long and exceeds the maximum length allowed for the description field. It should be less than 500 characters.',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the habit to be updated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateHabitInfo(
    @Param('id', new ParseUUIDPipe()) habitId: string,
    @Body() updateHabitDto: HabitUpdateInfoDto,
    @Req() req,
  ): Promise<OperationSuccessDto> {
    await this.habitsService.updateHabitInfo(habitId, updateHabitDto, req.user);
    return {
      message: 'Habit info updated successfully',
    };
  }

  @ApiOperation({
    summary: 'Update habit schedule',
    description:
      'Update the schedule of an existing habit. The habit must belong to the authenticated user.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'The habit schedule has been successfully updated.',
    example: {
      message: 'Habit schedule updated successfully',
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. Please check the request body and try again.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. Please provide valid authentication credentials.',
  })
  @ApiBody({
    type: HabitUpdateDto,
    description: 'The new schedule details for the habit.',
    examples: {
      valid: {
        summary: 'Valid Habit Schedule Update Request',
        value: {
          time: '08:00',
          days: [1, 3, 5],
          dayOfMonth: null,
          endDate: '2026-12-31',
        },
      },
      invalid: {
        summary: 'Invalid Habit Schedule Update Request',
        value: {
          time: '8:00 AM',
          days: [1, 3, 5, 7, 10],
          dayOfMonth: 0,
          endDate: '2022-12-31',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the habit to be updated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Patch(':id/schedule')
  @HttpCode(HttpStatus.OK)
  async updateHabitSchedule(
    @Param('id', new ParseUUIDPipe()) habitId: string,
    @Body() updateHabitDto: HabitUpdateDto,
    @Req() req,
  ): Promise<OperationSuccessDto> {
    await this.habitsService.updateHabitSchedule(
      habitId,
      updateHabitDto,
      req.user,
    );
    return {
      message: 'Habit schedule updated successfully',
    };
  }

  @ApiOperation({
    summary: 'Delete a habit',
    description:
      'Delete an existing habit. The habit must belong to the authenticated user.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'The habit has been successfully deleted.',
    example: {
      message: 'Habit deleted successfully',
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. Please check the request body and try again.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. Please provide valid authentication credentials.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the habit to be deleted',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteHabit(
    @Param('id', new ParseUUIDPipe()) habitId: string,
    @Req() req,
  ): Promise<OperationSuccessDto> {
    await this.habitsService.deleteHabit(habitId, req.user);
    return {
      message: 'Habit deleted successfully',
    };
  }

  @ApiOperation({
    summary: 'Get all habits for the authenticated user',
    description: 'Retrieve a list of all habits for the authenticated user.',
  })
  @ApiOkResponse({
    type: GetHabitsResponse,
    description: 'A list of habits for the authenticated user.',
    example: {
      message: 'Habits retrieved successfully',
      data: [
        {
          id: '1',
          title: 'Drink water',
          description: 'Drink at least 8 glasses of water per day',
          recurrenceType: 'DAILY',
          time: '09:00',
          dayOfMonth: null,
          endDate: null,
          nextTriggerAt: '2027-10-01T09:00:00.000Z',
          ownerId: 'user1',
        },
        {
          id: '2',
          title: 'Morning Jog',
          description: 'Jog for 30 minutes every morning to stay fit.',
          recurrenceType: 'DAILY',
          time: '07:00',
          dayOfMonth: null,
          endDate: null,
          nextTriggerAt: '2027-10-01T07:00:00.000Z',
          ownerId: 'user1',
        },
      ],
      meta: {
        hasNextPage: false,
        nextCursor: null,
        limit: 20,
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. Please check the request parameters and try again.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. Please provide valid authentication credentials.',
  })
  @ApiQuery({
    type: GetHabitsDto,
    description: 'Query parameters for filtering and pagination of habits.',
    examples: {
      valid: {
        summary: 'Valid Get Habits Query',
        value: {
          title: 'Drink',
        },
      },
    },
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async getHabits(
    @Query() getHabitsDto: GetHabitsDto,
    @Req() req,
  ): Promise<GetHabitsResponse> {
    const result = await this.habitsService.getHabits(req.user, getHabitsDto);
    return {
      message: 'Habits fetched successfully',
      ...result,
    };
  }

  @ApiOperation({
    summary: 'Get habit by ID',
    description:
      'Retrieve details of a specific habit by its ID. The habit must belong to the authenticated user.',
  })
  @ApiOkResponse({
    type: getHabitResponse,
    description: 'The requested habit details.',
    example: {
      message: 'Habit retrieved successfully',
      habit: {
        id: '1',
        title: 'Drink water',
        description: 'Drink at least 8 glasses of water per day',
        recurrenceType: 'DAILY',
        time: '09:00',
        dayOfMonth: null,
        endDate: null,
        nextTriggerAt: '2027-10-01T09:00:00.000Z',
        ownerId: 'user1',
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data. Please check the request parameters and try again.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. Please provide valid authentication credentials.',
  })
  @ApiParam({
    name: 'id',
    description: 'The UUID of the habit to be retrieved',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getHabitById(
    @Param('id', new ParseUUIDPipe()) habitId: string,
    @Req() req,
  ): Promise<getHabitResponse> {
    const habit = await this.habitsService.getHabitById(habitId, req.user);
    return {
      message: 'Habit fetched successfully',
      habit,
    };
  }
}
