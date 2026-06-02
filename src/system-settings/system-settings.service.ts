import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { SystemSetting } from './entities/system-setting.entity';
import { SocialButton, SocialButtonType } from './entities/social-button.entity';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { CreateSocialButtonDto } from './dto/create-social-button.dto';
import { UpdateSocialButtonDto } from './dto/update-social-button.dto';
import { ResolvedSocialButton } from './entities/resolved-social-button';
import { ReorderSocialButtonsDto } from './dto/reorder-social-buttons.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
    @InjectRepository(SocialButton)
    private readonly socialRepo: Repository<SocialButton>,
    private readonly config: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  // ─── SYSTEM SETTING (single record) ───────────────────────────────────────

  async getSetting(): Promise<SystemSetting & { resolvedSocialButtons: ResolvedSocialButton[] }> {
    const setting = await this.getOrCreateSetting();
    const buttons = await this.socialRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
    return { ...setting, resolvedSocialButtons: buttons.map(this.resolveLink) };
  }

  async updateSetting(dto: UpdateSystemSettingDto): Promise<SystemSetting> {
    const setting = await this.getOrCreateSetting();
    Object.assign(setting, dto);
    return this.settingRepo.save(setting);
  }

  async uploadImage(
    field: 'logoUrl' | 'faviconUrl' | 'feedbackImageUrl',
    file: Express.Multer.File,
  ): Promise<SystemSetting> {
    const setting = await this.getOrCreateSetting();

    // Xoá ảnh cũ trên Cloudinary nếu có
    if (setting[field]) {
      const publicId = this.extractPublicId(setting[field]);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => null);
    }

    const result = await this.uploadToCloudinary(file.buffer, `kita/settings`);
    setting[field] = result.secure_url;
    return this.settingRepo.save(setting);
  }

  // ─── SOCIAL BUTTONS ───────────────────────────────────────────────────────

  async getAllSocialButtons(): Promise<(SocialButton & { resolvedLink: string })[]> {
    const buttons = await this.socialRepo.find({ order: { order: 'ASC' } });
    return buttons.map(this.resolveLink);
  }

  async createSocialButton(dto: CreateSocialButtonDto): Promise<SocialButton & { resolvedLink: string }> {
    const button = this.socialRepo.create(dto);
    const saved = await this.socialRepo.save(button);
    return this.resolveLink(saved);
  }

  async updateSocialButton(id: number, dto: UpdateSocialButtonDto): Promise<SocialButton & { resolvedLink: string }> {
    const button = await this.findButtonOrFail(id);
    Object.assign(button, dto);
    const saved = await this.socialRepo.save(button);
    return this.resolveLink(saved);
  }

  async uploadSocialButtonIcon(id: number, file: Express.Multer.File): Promise<SocialButton & { resolvedLink: string }> {
    const button = await this.findButtonOrFail(id);

    if (button.iconUrl) {
      const publicId = this.extractPublicId(button.iconUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => null);
    }

    const result = await this.uploadToCloudinary(file.buffer, `kita/social-icons`);
    button.iconUrl = result.secure_url;
    const saved = await this.socialRepo.save(button);
    return this.resolveLink(saved);
  }

  async reorderSocialButtons(dto: ReorderSocialButtonsDto): Promise<void> {
    await Promise.all(
      dto.items.map(({ id, order }) => this.socialRepo.update(id, { order })),
    );
  }

  async deleteSocialButton(id: number): Promise<void> {
    const button = await this.findButtonOrFail(id);
    if (button.iconUrl) {
      const publicId = this.extractPublicId(button.iconUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => null);
    }
    await this.socialRepo.remove(button);
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private async getOrCreateSetting(): Promise<SystemSetting> {
    let setting = await this.settingRepo.findOne({ where: { id: 1 } });
    if (!setting) {
      setting = this.settingRepo.create({ companyName: 'GAMMA HOME' });
      setting = await this.settingRepo.save(setting);
    }
    return setting;
  }

  private async findButtonOrFail(id: number): Promise<SocialButton> {
    const button = await this.socialRepo.findOne({ where: { id } });
    if (!button) throw new NotFoundException('Không tìm thấy social button');
    return button;
  }

  // Format link dựa theo type
  private resolveLink(button: SocialButton): SocialButton & { resolvedLink: string } {
    let resolvedLink = button.value;
    switch (button.type) {
      case SocialButtonType.PHONE:
        resolvedLink = `tel:${button.value.replace(/\D/g, '')}`;
        break;
      case SocialButtonType.ZALO:
        resolvedLink = `https://zalo.me/${button.value.replace(/\D/g, '')}`;
        break;
      case SocialButtonType.MESSENGER:
        resolvedLink = button.value.startsWith('http')
          ? button.value
          : `https://www.messenger.com/t/${button.value}/`;
        break;
    }
    return { ...button, resolvedLink };
  }

  private uploadToCloudinary(buffer: Buffer, folder: string) {
    return new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: 'image' }, (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        })
        .end(buffer);
    });
  }

  private extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1].split('.')[0];
      const folder = parts[parts.length - 2];
      return `${folder}/${filename}`;
    } catch {
      return null;
    }
  }
}

