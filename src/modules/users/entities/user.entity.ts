import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IUser } from '../interfaces/entities/user.interface';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Index('idx_user_email')
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  // @Index('idx_user_phone')
  // @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  // phoneNumber: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  isVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true }) // Use timestamptz for timezone awareness
  verifiedAt: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  isDisabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
