import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItem {
  @ApiProperty() @IsInt() id: number;
  @ApiProperty() @IsInt() order: number;
}

export class ReorderSocialButtonsDto {
  @ApiProperty({ type: [ReorderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items: ReorderItem[];
}
