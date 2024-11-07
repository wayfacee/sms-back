import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [DataController],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}
