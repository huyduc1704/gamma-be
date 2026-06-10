import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../../admin/entities/admin.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {
    const opts: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => ((req as any)?.cookies as Record<string, string>)?.refresh_token ?? null,
        (req: Request) => ((req as any)?.headers?.['x-refresh-token'] as string) ?? null,
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    };
    super(opts);
  }

  async validate(req: Request, payload: { sub: number }) {
    const refreshToken = ((req as any)?.cookies as Record<string, string>)?.refresh_token
      || ((req as any)?.headers?.['x-refresh-token'] as string);
    const admin = await this.adminRepo.findOne({ where: { id: payload.sub, isActive: true } });
    if (!admin || !admin.refreshToken) throw new UnauthorizedException();

    const matches = await bcrypt.compare(refreshToken, admin.refreshToken);
    if (!matches) throw new UnauthorizedException();

    return admin;
  }
}
