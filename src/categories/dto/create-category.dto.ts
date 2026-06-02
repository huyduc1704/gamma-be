import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Xây Nhà Trọn Gói' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'xay-nha-tron-goi' })
  @IsString() @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 1, description: 'ID của group (lấy từ GET /categories/groups)' })
  @Type(() => Number) @IsInt()
  groupId: number;

  @ApiPropertyOptional({ example: 'Dịch vụ xây nhà trọn gói từ A-Z' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean()
  isActive?: boolean;
}
