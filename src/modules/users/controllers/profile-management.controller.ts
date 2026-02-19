import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ProfileManagementService } from '../services/profile-management.service';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OperationSuccessDto } from 'src/modules/auth/dtos';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { UpdateUserPasswordDto, UpdateUserProfileDto } from '../dto';

@UseInterceptors(TransformResponseInterceptor)
@ApiBearerAuth('JWT-auth')
@Controller('profile-management')
export class ProfileManagementController {
  constructor(
    private readonly profileManagementService: ProfileManagementService,
  ) {}

  @ApiOperation({
    summary: 'Update User Password',
    description: 'Allows a user to update their account password securely.',
  })
  @ApiOkResponse({
    description: 'Password updated successfully',
    type: OperationSuccessDto,
    example: { message: 'Password updated successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or password requirements not met',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiBody({
    type: UpdateUserPasswordDto,
    description: 'Payload to update user password',
    examples: {
      updatePassword: {
        summary: 'Update Password Example',
        value: {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewSecurePassword456@',
        },
      },
      example: {
        summary: 'Invalid Password Example',
        value: {
          currentPassword: 'WrongOldPassword',
          newPassword: 'weak',
        },
      },
    },
  })
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @Patch('update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Req() req: Request,
    @Body() updatePasswordDto: UpdateUserPasswordDto,
  ) {
    await this.profileManagementService.updatePassword(
      req.user,
      updatePasswordDto,
    );

    return { message: 'Password updated successfully' };
  }

  @ApiOperation({
    summary: 'Update User Profile',
    description: 'Allows a user to update their profile information.',
  })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: OperationSuccessDto,
    example: { message: 'Profile updated successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @ApiBody({
    type: UpdateUserProfileDto,
    description: 'Payload to update user profile information',
    examples: {
      updateProfile: {
        summary: 'Update Profile Example',
        value: {
          name: 'John Doe',
          phoneNumber: '+1234567890',
        },
      },
      example: {
        summary: 'Invalid Profile Example',
        value: {
          name: 'J',
          phoneNumber: 'invalid-phone',
        },
      },
    },
  })
  @Throttle({ default: { limit: 10, ttl: 600000 } })
  @Patch('update-profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    await this.profileManagementService.updateProfile(
      req.user,
      updateProfileDto,
    );

    return { message: 'Profile updated successfully' };
  }

  @ApiOperation({
    summary: 'Update Profile Image',
    description: 'Allows a user to update their profile image.',
  })
  @ApiOkResponse({
    description: 'Profile image updated successfully',
    type: OperationSuccessDto,
    example: { message: 'Profile image updated successfully' },
  })
  @ApiBadRequestResponse({
    description: 'Invalid image file',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  @Throttle({ default: { limit: 10, ttl: 600000 } })
  @UseInterceptors(FileInterceptor('profileImage', multerOptions))
  @Patch('profile-image')
  @HttpCode(HttpStatus.OK)
  async updateProfileImage(
    @UploadedFile() uploadedImage: Express.Multer.File,
    @Req() req: Request,
  ) {
    const cloudinaryImage = uploadedImage as Express.Multer.File & {
      path: string;
      filename: string;
    };
    await this.profileManagementService.updateProfileImage(req.user, {
      imageUrl: cloudinaryImage.path,
      imageLocation: cloudinaryImage.filename,
    });

    return {
      message: 'Profile image updated successfully',
    };
  }
}
