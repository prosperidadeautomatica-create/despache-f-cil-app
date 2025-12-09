import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';
import { FirestoreService } from '../firestore/firestore.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private firestoreService: FirestoreService,
    private i18n: I18nService,
  ) {}

  async validateClientCredentials(
    email: string,
    password: string,
  ): Promise<any> {
    const client = await this.firestoreService.getClientByEmail(email);
    if (!client) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      client.passwordHash,
    );
    if (!isPasswordValid) {
      return null;
    }

    return {
      clientId: client.clientId,
      email: client.email,
      name: client.name,
    };
  }

  async validateClient(clientId: string): Promise<any> {
    const client = await this.firestoreService.getClient(clientId);
    if (!client) {
      return null;
    }
    return {
      clientId: client.clientId,
      email: client.email,
      name: client.name,
    };
  }

  async signup(signupDto: SignupDto): Promise<LoginResponseDto> {
    // Check if client already exists
    const existingClient = await this.firestoreService.getClientByEmail(
      signupDto.email,
    );

    if (existingClient) {
      throw new ConflictException(
        this.i18n.t('auth.EMAIL_ALREADY_REGISTERED'),
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(signupDto.password, saltRounds);

    // Create new client
    const clientId = await this.firestoreService.createClient({
      email: signupDto.email,
      name: signupDto.name,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate JWT token
    const payload = {
      email: signupDto.email,
      clientId: clientId,
    };

    return {
      token: this.jwtService.sign(payload),
      clientId: clientId,
      name: signupDto.name,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const client = await this.validateClientCredentials(
      loginDto.email,
      loginDto.password,
    );

    if (!client) {
      throw new UnauthorizedException(
        this.i18n.t('auth.INVALID_CREDENTIALS'),
      );
    }

    const payload = {
      email: client.email,
      clientId: client.clientId,
    };

    return {
      token: this.jwtService.sign(payload),
      clientId: client.clientId,
      name: client.name,
    };
  }
}

