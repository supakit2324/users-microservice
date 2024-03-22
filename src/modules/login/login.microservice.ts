import {
  Controller,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AMOUNT_LOGIN_CMD } from 'src/constants';
import { AmountLogin } from './login.schema';
import * as dayjs from 'dayjs';
import 'dayjs/plugin/timezone';
import 'dayjs/plugin/isToday';
import { Users } from '../users/users.schema';
import { UsersService } from '../users/users.service';

dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/isToday'));

@Controller('amount-login')
export class LoginMicroservice {
  private readonly logger = new Logger(LoginMicroservice.name);
  constructor(
    private readonly loginService: LoginService,
    private readonly usersSersvice: UsersService,
  ) {}

  @MessagePattern({
    cmd: AMOUNT_LOGIN_CMD,
    method: 'update-amount-login',
  })
  async updateAmountLogin(
    @Payload() payload: { amountLogin: number },
  ): Promise<void> {
    const { amountLogin } = payload;
    try {
      const today = dayjs().startOf('day').toISOString();
      const login = await this.loginService.getamountLoginModel().findOne({
        firstTime: { $gte: today },
      });

      if (login) {
        await this.loginService.getamountLoginModel().updateOne(
          {
            firstTime: { $gte: today },
          },
          {
            $inc: {
              amountLogin: amountLogin,
            },
          },
        );
      } else {
        await this.loginService.getamountLoginModel().create({
          amountLogin: amountLogin,
          firstTime: today,
        });
      }
    } catch (e) {
      this.logger.error(
        `catch on update-amount-login: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: AMOUNT_LOGIN_CMD,
    method: 'get-amount-users-login',
  })
  async getAmountUsersLogin(query: { date: Date }): Promise<AmountLogin> {
    const { date } = query;
    try {
      const formattedDate = dayjs(date);
      const startOfDay = formattedDate.startOf('day');
      const endOfDay = formattedDate.endOf('day');

      const dayQuery = await this.loginService.getamountLoginModel().findOne(
        {
          createdAt: {
            $gte: startOfDay.toDate(),
            $lte: endOfDay.toDate(),
          },
        },
        {
          _id: 0,
          firstTime: 0,
          updatedAt: 0,
        },
      );
      return dayQuery;
    } catch (e) {
      this.logger.error(
        `catch on update-amount-login: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: AMOUNT_LOGIN_CMD,
    method: 'get-last-users-login',
  })
  async lastUsersLogin(query: { date: Date }): Promise<Users[]> {
    const { date } = query;
    const formattedDate = dayjs(date);
    const startOfDay = formattedDate.startOf('day');
    const endOfDay = formattedDate.endOf('day');
    try {
      return await this.usersSersvice
        .getUserModel()
        .find(
          {
            latestLogin: {
              $gte: startOfDay.toDate(),
              $lte: endOfDay.toDate(),
            },
          },
          {
            _id: 0,
            email: 1,
            roles: 1,
            latestLogin: 1,
            userId: 1,
            createdAt: 1,
          },
        )
        .sort({ latestLogin: -1 })
        .lean();
    } catch (e) {
      this.logger.error(
        `catch on last-users-login: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }
}
