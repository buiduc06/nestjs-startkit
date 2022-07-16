import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AmbassadorController } from './ambassador.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, SharedModule],
  controllers: [AdminController, AmbassadorController],
  providers: [AuthService],
})
export class AuthModule {}
