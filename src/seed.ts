import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminService } from './admin/admin.service';
import { AdminRole } from './admin/entities/admin.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  try {
    await adminService.create({
      email: 'admin@gammahome.vn',
      password: 'Admin@123',
      fullName: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
    });
    console.log('✅ Seed admin thành công: admin@gammahome.vn / Admin@123');
  } catch (e) {
    if (e.message?.includes('đã tồn tại')) {
      console.log('⚠️  Admin đã tồn tại, bỏ qua seed');
    } else {
      throw e;
    }
  }

  await app.close();
}

seed();
