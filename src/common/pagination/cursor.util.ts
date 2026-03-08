import { BadRequestException } from '@nestjs/common';

export const encodeCursor = (id: string): string =>
  Buffer.from(id).toString('base64url');

export const decodeCursor = (cursor: string): string => {
  try {
    const id = Buffer.from(cursor, 'base64url').toString('utf-8');
    if (!id) throw new Error();
    return id;
  } catch {
    throw new BadRequestException('Invalid cursor');
  }
};
