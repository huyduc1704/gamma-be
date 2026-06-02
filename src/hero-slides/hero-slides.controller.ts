import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { HeroSlidesService } from './hero-slides.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { ReorderHeroSlidesDto } from './dto/reorder-hero-slides.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const uploadOptions = { storage: memoryStorage() };

@ApiTags('Hero Slides')
@Controller('hero-slides')
export class HeroSlidesController {
  constructor(private readonly service: HeroSlidesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách hero slides (public)' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Chỉ lấy slides đang active' })
  findAll(@Query('active') active?: string) {
    return this.service.findAll(active === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết 1 hero slide' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Tạo hero slide mới (kèm upload ảnh)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        highlight: { type: 'string' },
        ctaText: { type: 'string' },
        ctaLink: { type: 'string' },
        order: { type: 'integer' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateHeroSlideDto) {
    return this.service.create(dto, file);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Sắp xếp lại thứ tự slides (kéo thả)' })
  reorder(@Body() dto: ReorderHeroSlidesDto) {
    return this.service.reorder(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cập nhật text/CTA của slide (không đổi ảnh)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHeroSlideDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/image')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Thay ảnh của slide' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  updateImage(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.service.updateImage(id, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xoá slide (dọn ảnh Cloudinary luôn)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
