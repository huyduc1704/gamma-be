import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean, IsEnum, IsInt, IsNotEmpty,
  IsOptional, IsString, Min,
} from 'class-validator';
import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ enum: PostType, example: PostType.PROJECT })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ example: 'Nhà Phố Hiện Đại 8x28m - Anh Nghĩa' })
  @IsString() @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'nha-pho-hien-dai-8x28m-anh-nghia' })
  @IsString() @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Mô tả ngắn về công trình...' })
  @IsOptional() @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ example: '<p>Nội dung chi tiết...</p>' })
  @IsOptional() @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID category' })
  @IsOptional()
  @Transform(({ value }) => (value ? +value : undefined))
  @IsInt()
  categoryId?: number;

  // metadata dạng JSON string (vì gửi qua multipart/form-data)
  @ApiPropertyOptional({
    example: '{"client":"Anh Nghĩa","location":"Bình Phước","scale":"2 Tầng","area":"224 m2","year":"2025"}',
    description: 'JSON string — project: {client, location, scale, area, year} | service: {features: []}',
  })
  @IsOptional() @IsString()
  metadata?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? +value : undefined))
  @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}
