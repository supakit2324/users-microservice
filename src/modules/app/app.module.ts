import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { UsersModule } from '../users/users.module';
import {
  throttlerAsyncOptions,
  throttlerServiceProvider,
} from 'src/throttler.providers';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModuleAsyncOptions } from 'src/mongoose.providers';
import { AuthModule } from '../auth/auth.module';
import { LoginModule } from '../login/login.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    ThrottlerModule.forRootAsync(throttlerAsyncOptions),
    UsersModule,
    AuthModule,
    LoginModule,
  ],
  providers: [throttlerServiceProvider],
})
export class AppModule {}
