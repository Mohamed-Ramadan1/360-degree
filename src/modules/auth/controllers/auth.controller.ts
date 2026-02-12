import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signUp(createAuthDto);
  }
}
