import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
    private readonly config: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  // ─── LIST với filter + pagination ─────────────────────────────────────────

  async findAll(query: QueryPostDto) {
    const { type, category, categoryId, search, active, page = 1, limit = 12 } = query;

    const qb = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('category.group', 'group')
      .orderBy('post.order', 'ASC')
      .addOrderBy('post.createdAt', 'DESC');

    if (type) qb.andWhere('post.type = :type', { type });
    if (active === 'true') qb.andWhere('post.isActive = true');
    if (categoryId) qb.andWhere('post.categoryId = :categoryId', { categoryId });
    if (category) qb.andWhere('category.slug = :slug', { slug: category });
    if (search) qb.andWhere('post.title ILIKE :search', { search: `%${search}%` });

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── DETAIL theo slug (public — tăng views) ───────────────────────────────

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.repo.findOne({
      where: { slug },
      relations: { category: { group: true } },
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    await this.repo.increment({ id: post.id }, 'views', 1);
    post.views += 1;
    return post;
  }

  async findOne(id: number): Promise<Post> {
    return this.findOrFail(id);
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────

  async create(dto: CreatePostDto, file?: Express.Multer.File): Promise<Post> {
    await this.ensureSlugUnique(dto.slug);

    const thumbnailUrl = file ? await this.upload(file, 'kita/posts') : undefined;
    const metadata = dto.metadata ? this.parseMetadata(dto.metadata) : undefined;

    const post = this.repo.create({ ...dto, thumbnailUrl, metadata });
    const saved = await this.repo.save(post);
    return this.findOrFail(saved.id);
  }

  // ─── UPDATE text fields ───────────────────────────────────────────────────

  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findOrFail(id);
    if (dto.slug && dto.slug !== post.slug) await this.ensureSlugUnique(dto.slug);

    const metadata = dto.metadata ? this.parseMetadata(dto.metadata) : post.metadata;
    Object.assign(post, { ...dto, metadata });
    await this.repo.save(post);
    return this.findOrFail(id);
  }

  // ─── THUMBNAIL ────────────────────────────────────────────────────────────

  async updateThumbnail(id: number, file: Express.Multer.File): Promise<Post> {
    const post = await this.findOrFail(id);
    if (post.thumbnailUrl) await this.deleteFromCloudinary(post.thumbnailUrl);
    post.thumbnailUrl = await this.upload(file, 'kita/posts');
    await this.repo.save(post);
    return this.findOrFail(id);
  }

  // ─── GALLERY (chỉ dùng cho project) ──────────────────────────────────────

  async addGalleryImage(id: number, file: Express.Multer.File): Promise<Post> {
    const post = await this.findOrFail(id);
    const url = await this.upload(file, 'kita/gallery');
    post.gallery = [...(post.gallery ?? []), url];
    await this.repo.save(post);
    return this.findOrFail(id);
  }

  async removeGalleryImage(id: number, imageIndex: number): Promise<Post> {
    const post = await this.findOrFail(id);
    if (imageIndex < 0 || imageIndex >= (post.gallery?.length ?? 0)) {
      throw new BadRequestException('Index ảnh không hợp lệ');
    }
    const url = post.gallery[imageIndex];
    await this.deleteFromCloudinary(url);
    post.gallery = post.gallery.filter((_, i) => i !== imageIndex);
    await this.repo.save(post);
    return this.findOrFail(id);
  }

  // ─── TOGGLE PUBLISH ───────────────────────────────────────────────────────

  async togglePublish(id: number): Promise<Post> {
    const post = await this.findOrFail(id);
    post.isActive = !post.isActive;
    post.publishedAt = post.isActive ? new Date() : null;
    await this.repo.save(post);
    return post;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────

  async remove(id: number): Promise<void> {
    const post = await this.findOrFail(id);
    // Xóa thumbnail và tất cả ảnh gallery trên Cloudinary
    const urls = [post.thumbnailUrl, ...(post.gallery ?? [])].filter(Boolean);
    await Promise.all(urls.map((url) => this.deleteFromCloudinary(url)));
    await this.repo.remove(post);
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private async findOrFail(id: number): Promise<Post> {
    const post = await this.repo.findOne({
      where: { id },
      relations: { category: { group: true } },
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  private async ensureSlugUnique(slug: string): Promise<void> {
    const exists = await this.repo.findOne({ where: { slug } });
    if (exists) throw new ConflictException(`Slug "${slug}" đã tồn tại`);
  }

  private parseMetadata(raw: string): Record<string, unknown> {
    try {
      return JSON.parse(raw);
    } catch {
      throw new BadRequestException('metadata phải là JSON hợp lệ');
    }
  }

  private upload(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: 'image' }, (err, result) => {
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
