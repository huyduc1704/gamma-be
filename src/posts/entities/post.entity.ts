import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export enum PostType {
  PROJECT = 'project',
  SERVICE = 'service',
  NEWS = 'news',
  KNOWLEDGE = 'knowledge',
  PRICING = 'pricing',
  ABOUT = 'about',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PostType })
  type: PostType;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true, type: 'text' })
  excerpt: string;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  // Gallery ảnh — chỉ dùng cho project
  @Column({ type: 'jsonb', default: [] })
  gallery: string[];

  // Metadata đặc thù theo type
  // project: { client, location, scale, area, year }
  // service: { features: string[] }
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ default: 0 })
  views: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  publishedAt: Date | null;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
