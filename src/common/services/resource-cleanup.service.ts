import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
@Injectable()
export class ResourceCleanupService {
  constructor(private readonly logger: LoggerService) {}
  // private method gon be refactored again later to a shared service
  async deleteFileFromCloudinary(key: string) {
    try {
      await cloudinary.uploader.destroy(key);
      this.logger.log(`Deleted file: ${key} from Cloudinary`);
      return { success: true };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(
        `Error deleting file with key: ${key} from Cloudinary - ${err.message}`,
        err,
      );
    }
  }
}
