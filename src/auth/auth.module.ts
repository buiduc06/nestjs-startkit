import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AmbassadorController } from './ambassador.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, SharedModule, UserModule],
  controllers: [AdminController, AmbassadorController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
