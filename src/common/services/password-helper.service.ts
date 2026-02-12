import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHelperService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
