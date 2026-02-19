import {
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
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OperationSuccessDto } from 'src/modules/auth/dtos';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';

@UseInterceptors(TransformResponseInterceptor)
@ApiBearerAuth('JWT-auth')
@Controller('profile-management')
export class ProfileManagementController {
  constructor(
    private readonly profileManagementService: ProfileManagementService,
  ) {}

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
