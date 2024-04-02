import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { model } from 'src/config/model';
import { DB_CONNECTION_NAME } from 'src/constants';
import { UsersService } from './users.service';
import { UsersMicroserviec } from './users.microservice';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [MongooseModule.forFeature(model, DB_CONNECTION_NAME)],
  controllers: [UsersMicroserviec],
  providers: [UsersService, ConfigService, JwtService, AuthService],
  exports: [UsersService],
})
export class UsersModule {}
