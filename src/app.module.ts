import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { HeroSlidesModule } from './hero-slides/hero-slides.module';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';
import { ConsultationLeadsModule } from './consultation-leads/consultation-leads.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        extra: { max: 1 }, // giới hạn connection pool cho serverless
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    AdminModule,
    SystemSettingsModule,
    HeroSlidesModule,
    CategoriesModule,
    PostsModule,
    ConsultationLeadsModule,
    UploadModule,
  ],
})
export class AppModule {}
