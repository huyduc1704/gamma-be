import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { SocialButtonPosition, SocialButtonType } from '../entities/social-button.entity';

export class CreateSocialButtonDto {
  @ApiProperty({ enum: SocialButtonType, example: SocialButtonType.ZALO })
  @IsEnum(SocialButtonType)
  type: SocialButtonType;

  @ApiProperty({
    example: '0827972555',
    description: 'Số điện thoại (phone/zalo) hoặc URL đầy đủ (các type khác)',
  })
  @IsString() @IsNotEmpty()
  value: string;

  @ApiProperty({ example: 'Zalo Chat' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ enum: SocialButtonPosition, example: SocialButtonPosition.FLOATING })
  @IsOptional() @IsEnum(SocialButtonPosition)
  position?: SocialButtonPosition;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
