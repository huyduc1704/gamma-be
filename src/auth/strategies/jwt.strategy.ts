import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { Admin } from '../../admin/entities/admin.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {
    const opts: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies as Record<string, string>)?.access_token ?? null,
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    };
    super(opts);
  }

  async validate(payload: { sub: number; email: string }) {
    const admin = await this.adminRepo.findOne({ where: { id: payload.sub, isActive: true } });
    if (!admin) throw new UnauthorizedException();
    return admin;
  }
}
