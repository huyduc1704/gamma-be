import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './categories/entities/group.entity';

const GROUPS = [
  { slug: 'dich-vu', name: 'Dịch Vụ', order: 0 },
  { slug: 'du-an', name: 'Dự Án', order: 1 },
  { slug: 'noi-that', name: 'Nội Thất', order: 2 },
  { slug: 'kien-thuc', name: 'Kiến Thức', order: 3 },
  { slug: 'tin-tuc', name: 'Tin Tức', order: 4 },
  { slug: 'gioi-thieu', name: 'Giới Thiệu', order: 5 },
];

async function seedGroups() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get<Repository<Group>>(getRepositoryToken(Group));

  for (const g of GROUPS) {
    const exists = await repo.findOne({ where: { slug: g.slug } });
    if (!exists) {
      await repo.save(repo.create(g));
      console.log(`✅ Tạo group: ${g.name}`);
    } else {
      console.log(`⚠️  Group đã tồn tại: ${g.name}`);
    }
  }

  await app.close();
  console.log('✨ Seed groups hoàn tất');
}

seedGroups();
