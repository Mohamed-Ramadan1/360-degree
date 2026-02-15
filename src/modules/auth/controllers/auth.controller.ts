import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import {
  AccessTokenResponseDto,
  CreateUserDto,
  LoginResponseDto,
  LoginUserDto,
  SignUpResponseDto,
  OperationSuccessDto,
} from '../dtos/index';
import { Throttle } from '@nestjs/throttler';
import { SetRefreshCookieInterceptor } from '../interceptors/set-refresh-cookie.interceptor';
import { TransformAuthResponseInterceptor } from '../interceptors/transform-auth-response.interceptor';
import { Public } from 'src/common/decorators/public.decorator';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { Request } from 'express';
import { ClearRefreshCookieInterceptor } from '../interceptors/clear-refresh.cookie.interceptor';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Public()
@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User sign-up',
    description:
      'Registers a new user and returns user details along with access and refresh tokens. The refresh token is set as an HTTP-only cookie.',
  })
  @ApiOkResponse({
    type: SignUpResponseDto,
    description: 'User signed up successfully.',
    example: {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
      },
      tokenPair: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Invalid sign-up data.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data',
    examples: {
      valid: {
        summary: 'Valid sign-up data',
        value: {
          email: 'user@example.com',
          name: 'John Doe',
          password: 'strongPassword123',
        },
      },
      invalid: {
        summary: 'Invalid sign-up data',
        value: {
          email: 'invalid-email',
          name: '',
          password: 'weak',
        },
      },
    },
  })
  @UseInterceptors(
    TransformAuthResponseInterceptor,
    SetRefreshCookieInterceptor,
  )
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SignUpResponseDto> {
    return await this.authService.signUp(createUserDto);
  }

  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticates a user and returns user details along with access and refresh tokens. The refresh token is set as an HTTP-only cookie.',
  })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'User logged in successfully.',
    example: {
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
      },
      tokenPair: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid email or password.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Invalid login data.',
  })
  @ApiBody({
    type: LoginUserDto,
    description: 'User login credentials',
    examples: {
      valid: {
        summary: 'Valid login data',
        value: {
          email: 'user@example.com',
          password: 'strongPassword123',
        },
      },
      invalid: {
        summary: 'Invalid login data',
        value: {
          email: 'invalid-email',
          password: '',
        },
      },
    },
  })
  @UseInterceptors(
    TransformAuthResponseInterceptor,
    SetRefreshCookieInterceptor,
  )
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const { user, tokenPair } = await this.authService.login(loginUserDto);
    return { user, tokenPair };
  }

  @ApiOperation({
    summary: 'Create new access token using refresh token',
    description:
      'Generates a new access token using a valid refresh token. The refresh token must be sent as an HTTP-only cookie.',
  })
  @ApiOkResponse({
    type: AccessTokenResponseDto,
    description: 'New access token created successfully.',
    example: {
      message: 'new access token created',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing refresh token.',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Invalid user refresh token.',
  })
  @UseInterceptors(TransformResponseInterceptor)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(RefreshTokenGuard)
  @Post('access-token')
  @HttpCode(HttpStatus.OK)
  accessToken(@Req() req: Request): AccessTokenResponseDto {
    const accessToken: string = this.authService.generateNewAccessToken(
      req.user,
    );
    return { message: 'new access token created', accessToken };
  }

  @ApiOperation({
    summary: 'Logout user and invalidate refresh token',
    description:
      'Logs out the user by invalidating the refresh token and clearing the refresh token cookie.',
  })
  @ApiOkResponse({
    type: OperationSuccessDto,
    description: 'User logged out successfully.',
    example: { message: 'user logged out successfully.' },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. Invalid user or token.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing authentication.',
  })
  @UseInterceptors(TransformResponseInterceptor)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(ClearRefreshCookieInterceptor)
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request): Promise<OperationSuccessDto> {
    const user = req.user;
    await this.authService.logout(user.id);
    return {
      message: 'user logged out successfully.',
    };
  }
}
