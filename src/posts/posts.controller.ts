import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiOperation, ApiCookieAuth,
  ApiConsumes, ApiBody, ApiParam,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const uploadOptions = { storage: memoryStorage() };

const multipartBody = (extra: Record<string, unknown> = {}) => ({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary', description: 'Ảnh thumbnail' },
      type: { type: 'string', enum: ['project', 'service', 'news', 'knowledge', 'pricing'] },
      title: { type: 'string' },
      slug: { type: 'string' },
      excerpt: { type: 'string' },
      content: { type: 'string' },
      categoryId: { type: 'integer' },
      metadata: { type: 'string', description: 'JSON string' },
      order: { type: 'integer' },
      isActive: { type: 'boolean' },
      ...extra,
    },
  },
});

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  // ─── PUBLIC ───────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết — filter type, category, search, pagination' })
  findAll(@Query() query: QueryPostDto) {
    return this.service.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết bài viết theo slug (tự tăng views)' })
  @ApiParam({ name: 'slug', example: 'nha-pho-hien-dai-8x28m-anh-nghia' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Chi tiết bài viết theo ID (admin, không tăng views)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Tạo bài viết mới (kèm upload thumbnail)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(multipartBody({ required: ['type', 'title', 'slug'] }))
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreatePostDto) {
    return this.service.create(dto, file);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cập nhật bài viết (không đổi ảnh)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/thumbnail')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Thay thumbnail' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  updateThumbnail(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.service.updateThumbnail(id, file);
  }

  @Post(':id/gallery')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Thêm ảnh vào gallery (project)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  addGallery(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.service.addGalleryImage(id, file);
  }

  @Delete(':id/gallery/:index')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xoá 1 ảnh gallery theo index' })
  removeGallery(
    @Param('id', ParseIntPipe) id: number,
    @Param('index', ParseIntPipe) index: number,
  ) {
    return this.service.removeGalleryImage(id, index);
  }

  @Put(':id/toggle-publish')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Bật/tắt publish bài viết' })
  togglePublish(@Param('id', ParseIntPipe) id: number) {
    return this.service.togglePublish(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xoá bài viết + dọn toàn bộ ảnh Cloudinary' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
