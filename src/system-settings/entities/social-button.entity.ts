import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SocialButtonType {
  PHONE = 'phone',
  ZALO = 'zalo',
  MESSENGER = 'messenger',
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  CUSTOM = 'custom',
}

export enum SocialButtonPosition {
  FLOATING = 'floating',   // icon chạy dọc bên trái
  FOOTER = 'footer',       // icon trong footer
  BOTH = 'both',
}

@Entity('social_buttons')
export class SocialButton {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: SocialButtonType, default: SocialButtonType.CUSTOM })
  type: SocialButtonType;

  // Số điện thoại (phone/zalo) hoặc URL đầy đủ (các type còn lại)
  @Column()
  value: string;

  @Column({ default: '' })
  label: string;

  // Icon tuỳ chỉnh (upload Cloudinary) — nếu null thì dùng icon mặc định theo type
  @Column({ nullable: true })
  iconUrl: string;

  @Column({ type: 'enum', enum: SocialButtonPosition, default: SocialButtonPosition.FLOATING })
  position: SocialButtonPosition;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
