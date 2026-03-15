import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { UsersService } from './users.service';

@Module({
  imports: [ServicesModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
