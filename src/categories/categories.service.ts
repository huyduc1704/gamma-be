import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Group } from './entities/group.entity';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly config: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  // ─── GROUPS ───────────────────────────────────────────────────────────────

  // Trả về groups kèm số lượng categories — dùng cho sidebar admin
  async getGroups(): Promise<(Group & { categoryCount: number })[]> {
    const groups = await this.groupRepo.find({ order: { order: 'ASC' } });
    const result = await Promise.all(
      groups.map(async (g) => ({
        ...g,
        categoryCount: await this.categoryRepo.count({ where: { groupId: g.id } }),
      })),
    );
    return result;
  }

  // ─── CATEGORIES ───────────────────────────────────────────────────────────

  // Lấy categories theo group slug hoặc groupId — public endpoint dùng cho kita-fe
  async getCategories(filter: { groupSlug?: string; groupId?: number; onlyActive?: boolean }): Promise<Category[]> {
    const qb = this.categoryRepo
      .createQueryBuilder('cat')
      .leftJoinAndSelect('cat.group', 'group')
      .orderBy('cat.order', 'ASC');

    if (filter.onlyActive) qb.andWhere('cat.isActive = true');
    if (filter.groupSlug) qb.andWhere('group.slug = :slug', { slug: filter.groupSlug });
    if (filter.groupId) qb.andWhere('cat.groupId = :gid', { gid: filter.groupId });

    return qb.getMany();
  }

  async findOne(id: number): Promise<Category> {
    return this.findOrFail(id);
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    await this.ensureGroupExists(dto.groupId);
    await this.ensureSlugUnique(dto.slug);
    const cat = this.categoryRepo.create(dto);
    const saved = await this.categoryRepo.save(cat);
    return this.categoryRepo.findOne({ where: { id: saved.id }, relations: { group: true } }) as Promise<Category>;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const cat = await this.findOrFail(id);
    if (dto.slug && dto.slug !== cat.slug) await this.ensureSlugUnique(dto.slug);
    Object.assign(cat, dto);
    await this.categoryRepo.save(cat);
    return this.categoryRepo.findOne({ where: { id }, relations: { group: true } }) as Promise<Category>;
  }

  async uploadThumbnail(id: number, file: Express.Multer.File): Promise<Category> {
    const cat = await this.findOrFail(id);
    if (cat.thumbnailUrl) await this.deleteFromCloudinary(cat.thumbnailUrl);
    cat.thumbnailUrl = await this.upload(file);
    await this.categoryRepo.save(cat);
    return this.categoryRepo.findOne({ where: { id }, relations: { group: true } }) as Promise<Category>;
  }

  async reorder(dto: ReorderCategoriesDto): Promise<void> {
    await Promise.all(
      dto.items.map(({ id, order }) => this.categoryRepo.update(id, { order })),
    );
  }

  async remove(id: number): Promise<void> {
    const cat = await this.findOrFail(id);
    if (cat.thumbnailUrl) await this.deleteFromCloudinary(cat.thumbnailUrl);
    await this.categoryRepo.remove(cat);
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private async findOrFail(id: number): Promise<Category> {
    const cat = await this.categoryRepo.findOne({ where: { id }, relations: { group: true } });
    if (!cat) throw new NotFoundException('Không tìm thấy danh mục');
    return cat;
  }

  private async ensureGroupExists(groupId: number): Promise<void> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException(`Không tìm thấy group với id ${groupId}`);
  }

  private async ensureSlugUnique(slug: string): Promise<void> {
    const exists = await this.categoryRepo.findOne({ where: { slug } });
    if (exists) throw new ConflictException(`Slug "${slug}" đã tồn tại`);
  }

  private upload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'kita/categories', resource_type: 'image' }, (err, result) => {
          if (err || !result) return reject(err);
          resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }

  private async deleteFromCloudinary(url: string): Promise<void> {
    if (!url || url.startsWith('/')) return;
    try {
      const parts = url.split('/');
      const file = parts[parts.length - 1].split('.')[0];
      const folder = parts[parts.length - 2];
      await cloudinary.uploader.destroy(`${folder}/${file}`);
    } catch {}
  }
}
