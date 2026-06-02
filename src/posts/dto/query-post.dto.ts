import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PostType } from '../entities/post.entity';

export class QueryPostDto {
  @ApiPropertyOptional({ enum: PostType, description: 'Lọc theo loại bài' })
  @IsOptional() @IsEnum(PostType)
  type?: PostType;

  @ApiPropertyOptional({ description: 'Slug của category' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'ID của category' })
  @IsOptional()
  @Transform(({ value }) => (value ? +value : undefined))
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo title' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Chỉ lấy bài đang active', example: 'true' })
  @IsOptional() @IsString()
  active?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? +value : 1))
  @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Transform(({ value }) => (value ? +value : 12))
  @IsInt() @Min(1)
  limit?: number = 12;
}
