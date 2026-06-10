import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'GAMMA HOME' })
  companyName: string;

  @Column({ nullable: true })
  taxCode: string;

  @Column({ nullable: true })
  slogan: string;

  @Column({ nullable: true })
  hotline: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, type: 'text' })
  addressNorth: string;

  @Column({ nullable: true, type: 'text' })
  addressSouth: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ nullable: true })
  feedbackImageUrl: string;

  @Column({ type: 'text', nullable: true })
  footerDescription: string;

  @Column({ nullable: true })
  footerCopyright: string;

  @Column({ nullable: true })
  footerFanpageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  homeConfig: any;

  @UpdateDateColumn()
  updatedAt: Date;
}
