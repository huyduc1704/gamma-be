import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultationLead, LeadStatus } from './entities/consultation-lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { QueryLeadDto } from './dto/query-lead.dto';

@Injectable()
export class ConsultationLeadsService {
  constructor(
    @InjectRepository(ConsultationLead)
    private readonly repo: Repository<ConsultationLead>,
  ) {}

  // ─── PUBLIC: khách điền form ──────────────────────────────────────────────

  async submit(dto: CreateLeadDto): Promise<ConsultationLead> {
    const lead = this.repo.create(dto);
    return this.repo.save(lead);
  }

  // ─── ADMIN: danh sách + filter ────────────────────────────────────────────

  async findAll(query: QueryLeadDto) {
    const { status, search, page = 1, limit = 20 } = query;

    const qb = this.repo
      .createQueryBuilder('lead')
      .orderBy('lead.createdAt', 'DESC');

    if (status) qb.andWhere('lead.status = :status', { status });
    if (search) {
      qb.andWhere('(lead.name ILIKE :s OR lead.phone ILIKE :s)', { s: `%${search}%` });
    }

    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * limit).take(limit).getMany();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<ConsultationLead> {
    return this.findOrFail(id);
  }

  // ─── ADMIN: cập nhật trạng thái ───────────────────────────────────────────

  async updateStatus(id: number, dto: UpdateLeadStatusDto): Promise<ConsultationLead> {
    const lead = await this.findOrFail(id);
    Object.assign(lead, dto);
    return this.repo.save(lead);
  }

  // ─── ADMIN: xóa ───────────────────────────────────────────────────────────

  async remove(id: number): Promise<void> {
    const lead = await this.findOrFail(id);
    await this.repo.remove(lead);
  }

  // ─── ADMIN: thống kê nhanh ────────────────────────────────────────────────

  async getStats() {
    const counts = await this.repo
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany();

    const total = await this.repo.count();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const today = await this.repo
      .createQueryBuilder('lead')
      .where('lead.createdAt >= :start', { start: todayStart })
      .getCount();

    const byStatus = Object.fromEntries(
      Object.values(LeadStatus).map((s) => [s, 0]),
    );
    counts.forEach(({ status, count }) => {
      byStatus[status] = +count;
    });

    return { total, today, byStatus };
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private async findOrFail(id: number): Promise<ConsultationLead> {
    const lead = await this.repo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Không tìm thấy lead');
    return lead;
  }
}
