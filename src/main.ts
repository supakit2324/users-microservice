import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dayjs from 'dayjs';
import 'dayjs/plugin/timezone';
import 'dayjs/plugin/isToday';

dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/isToday'));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('port');
  const provider = configService.get<string>('provider');
  const logger = new Logger();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      noAck: true,
      urls: [process.env.rmq],
      queue: provider,
      queueOptions: {
        durable: false,
      },
    },
  })

  app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log(`
      Application ${provider} started listen on port ${port}
      Local Timezone guess: ${dayjs.tz.guess()}
      Local Date: ${dayjs().toDate().toISOString()} ~ ${dayjs().format(
        'YYYY-MM-DD HH:mm:ss',
      )}
    `);
  });
}
bootstrap();
