import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../admin/entities/admin.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email, isActive: true } });
    if (!admin) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const tokens = await this.generateTokens(admin.id, admin.email);
    await this.saveRefreshToken(admin.id, tokens.refreshToken);

    const { password, refreshToken, ...profile } = admin;
    return { ...tokens, admin: profile };
  }

  async refreshTokens(adminId: number) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();

    const tokens = await this.generateTokens(admin.id, admin.email);
    await this.saveRefreshToken(admin.id, tokens.refreshToken);
    return tokens;
  }

  async logout(adminId: number) {
    await this.adminRepo.update(adminId, { refreshToken: null });
  }

  async getMe(adminId: number) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();
    const { password, refreshToken, ...result } = admin;
    return result;
  }

  async changePassword(adminId: number, dto: ChangePasswordDto) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!valid) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    admin.password = await bcrypt.hash(dto.newPassword, 10);
    admin.refreshToken = null;
    await this.adminRepo.save(admin);
  }

  private async generateTokens(adminId: number, email: string) {
    const payload = { sub: adminId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(adminId: number, token: string) {
    const hashed = await bcrypt.hash(token, 10);
    await this.adminRepo.update(adminId, { refreshToken: hashed });
  }
}
