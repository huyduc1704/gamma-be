import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  subtitle: string;

  @Column({ default: '' })
  highlight: string;

  @Column({ default: '' })
  ctaText: string;

  @Column({ default: '' })
  ctaLink: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
