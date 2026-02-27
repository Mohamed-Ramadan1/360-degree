// dtos imports
import { IUser } from 'src/modules/users/interfaces/entities/user.interface';
import { CreateUserDto } from '../../dtos/requests/create-user.dto';
import { LoginUserDto } from '../../dtos/requests/login-user.dto';

/**
 * Interface for the AuthService, defining the contract for authentication-related operations.
 * This includes user signup and login functionality, handling user creation, token generation,
 * and email notifications.
 */
export interface IAuthService {
  /**
   * Registers a new user with the provided details, hashes their password, generates authentication tokens,
   * and sends a welcome email.
   *
   * @param userData - The data transfer object containing user signup information (email, name, password).
   * @returns A promise resolving to an object containing the created user (with sensitive fields included)
   *          and a token pair (access and refresh tokens).
   * @throws {ConflictException} If the email already exists in the database (PostgreSQL error code 23505).
   * @throws {Error} For other unexpected errors during user creation, token generation, or email sending.
   */
  signUp(userData: CreateUserDto): Promise<{
    user: {
      id: string | number;
      email: string;
      name: string;
      password: string;
      [key: string]: any;
    };
    tokenPair: {
      accessToken: string;
      refreshToken: string;
    };
  }>;

  /**
   * Authenticates a user by verifying their email and password, and generates authentication tokens upon success.
   *
   * @param loginUserDto - The data transfer object containing login credentials (email, password).
   * @returns A promise resolving to an object containing the authenticated user (with sensitive fields included)
   *          and a token pair (access and refresh tokens).
   * @throws {NotFoundException} If no user is found with the provided email.
   * @throws {UnauthorizedException} If the provided password is invalid.
   * @throws {Error} For other unexpected errors during user lookup or token generation.
   */
  login(loginUserDto: LoginUserDto): Promise<{
    user: {
      id: string | number;
      email: string;
      name: string;
      password: string;
      [key: string]: any;
    };
    tokenPair: {
      accessToken: string;
      refreshToken: string;
    };
  }>;

  generateNewAccessToken(user: IUser): string;
  logout(userId: string): Promise<void>;
}
