import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async create(dto: CreateAdminDto): Promise<Omit<Admin, 'password' | 'refreshToken'>> {
    const existing = await this.adminRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const hashed = await bcrypt.hash(dto.password, 10);
    const admin = this.adminRepo.create({ ...dto, password: hashed });
    const saved = await this.adminRepo.save(admin);
    const { password, refreshToken, ...result } = saved;
    return result;
  }

  async findAll(): Promise<Omit<Admin, 'password' | 'refreshToken'>[]> {
    const admins = await this.adminRepo.find({ order: { createdAt: 'DESC' } });
    return admins.map(({ password, refreshToken, ...rest }) => rest);
  }

  async findOne(id: number): Promise<Omit<Admin, 'password' | 'refreshToken'>> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Không tìm thấy admin');
    const { password, refreshToken, ...result } = admin;
    return result;
  }

  async update(id: number, dto: UpdateAdminDto): Promise<Omit<Admin, 'password' | 'refreshToken'>> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Không tìm thấy admin');
    Object.assign(admin, dto);
    const saved = await this.adminRepo.save(admin);
    const { password, refreshToken, ...result } = saved;
    return result;
  }

  async remove(id: number): Promise<void> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Không tìm thấy admin');
    await this.adminRepo.remove(admin);
  }
}
