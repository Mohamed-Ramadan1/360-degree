import { IUser } from '@modules/users/interfaces/entities/user.interface';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
  namespace Multer {
    interface File {
      path: string;
      filename: string;
    }
  }
}

export {};
