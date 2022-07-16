import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.model';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Link]), SharedModule, AuthModule],
  providers: [LinkService],
  controllers: [LinkController],
  exports: [LinkService],
})
export class LinkModule {}
