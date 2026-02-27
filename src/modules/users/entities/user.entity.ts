import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IUser } from '../interfaces/entities/user.interface';
import { UserRoles } from 'src/common/consts';

const defaultProfileImage =
  'https://res.cloudinary.com/dsui5qi7x/image/upload/v1771461357/360-degree/uploads/1771461354544-test.jpg.jpg';
@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'timestamptz', nullable: true })
  passwordLastChangedAt: Date;

  @Column({ type: 'boolean', nullable: false, default: true })
  notificationsEnabled: boolean;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  phoneNumberVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  phoneNumberVerifiedAt: Date | null;

  @Column({ type: 'boolean', default: false, nullable: false })
  isVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true }) // Use timestamptz for timezone awareness
  verifiedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'boolean', nullable: false, default: false })
  accountToBeDeleted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  toBeDeletedAt: Date | null;

  @Column({ type: 'boolean', nullable: false, default: false })
  isDisabled: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  termsAccepted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  termsAcceptedAt: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  termsVersion: string | null;

  @Column({
    type: 'enum',
    enum: UserRoles,
    array: true,
    default: [UserRoles.USER],
  })
  roles: UserRoles[];

  @Column({ type: 'text', nullable: false, default: defaultProfileImage }) // text for potentially long URLs
  profileImage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImageKey: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
