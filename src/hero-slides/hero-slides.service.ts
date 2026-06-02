import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { HeroSlide } from './entities/hero-slide.entity';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { ReorderHeroSlidesDto } from './dto/reorder-hero-slides.dto';

@Injectable()
export class HeroSlidesService {
  constructor(
    @InjectRepository(HeroSlide)
    private readonly repo: Repository<HeroSlide>,
    private readonly config: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  findAll(onlyActive = false): Promise<HeroSlide[]> {
    return this.repo.find({
      where: onlyActive ? { isActive: true } : {},
      order: { order: 'ASC' },
    });
  }

  findOne(id: number): Promise<HeroSlide> {
    return this.findOrFail(id);
  }

  async create(dto: CreateHeroSlideDto, file: Express.Multer.File): Promise<HeroSlide> {
    const imageUrl = await this.upload(file);
    const slide = this.repo.create({ ...dto, imageUrl });
    return this.repo.save(slide);
  }

  async update(id: number, dto: UpdateHeroSlideDto): Promise<HeroSlide> {
    const slide = await this.findOrFail(id);
    Object.assign(slide, dto);
    return this.repo.save(slide);
  }

  async updateImage(id: number, file: Express.Multer.File): Promise<HeroSlide> {
    const slide = await this.findOrFail(id);
    await this.deleteFromCloudinary(slide.imageUrl);
    slide.imageUrl = await this.upload(file);
    return this.repo.save(slide);
  }

  async reorder(dto: ReorderHeroSlidesDto): Promise<void> {
    await Promise.all(
      dto.items.map(({ id, order }) => this.repo.update(id, { order })),
    );
  }

  async remove(id: number): Promise<void> {
    const slide = await this.findOrFail(id);
    await this.deleteFromCloudinary(slide.imageUrl);
    await this.repo.remove(slide);
  }

  private async findOrFail(id: number): Promise<HeroSlide> {
    const slide = await this.repo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException('Không tìm thấy hero slide');
    return slide;
  }

  private upload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'kita/hero-slides', resource_type: 'image' }, (err, result) => {
          if (err || !result) return reject(err);
          resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }

  private async deleteFromCloudinary(url: string): Promise<void> {
    if (!url || url.startsWith('/')) return; // bỏ qua local path
    try {
      const parts = url.split('/');
      const file = parts[parts.length - 1].split('.')[0];
      const folder = parts[parts.length - 2];
      await cloudinary.uploader.destroy(`${folder}/${file}`);
    } catch {}
  }
}
