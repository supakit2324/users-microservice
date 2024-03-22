import {
  Controller,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { playloadCreateUserInterface } from './interface/payload-create-user.interface';
import { AuthService } from '../auth/auth.service';
import { USER_CMD } from 'src/constants';
import { loginterface } from '../auth/interface/login.interface';
import { Users } from './users.schema';
import { payloadUpdateUserInterface } from './interface/payload-update-user.interface';
import StatusUser from './enum/status-user.enum';
import {
  PaginationInterface,
  PaginationResponseInterface,
} from 'src/interfaces/pagination.interface';
import { FindOptionsInterface } from 'src/interfaces/find-options.interface';

@Controller('users')
export class UsersMicroserviec {
  private readonly logger = new Logger(UsersMicroserviec.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @MessagePattern({
    cmd: USER_CMD,
    method: 'login',
  })
  async login(@Payload() payload: { email: string }): Promise<loginterface> {
    const { email } = payload;

    let jwtSign: loginterface;
    try {
      jwtSign = await this.authService.createTokens(email);
    } catch (e) {
      this.logger.error(
        `catch on login-createTokens: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }

    const update = {
      token: jwtSign[0],
      refreshToken: jwtSign[1],
      latestLogin: Date.now(),
    };

    try {
      await this.usersService
        .getUserModel()
        .updateOne({ email }, { ...update });
    } catch (e) {
      this.logger.error(
        `catch on login-update: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
    return {
      accessToken: jwtSign[0],
      refreshToken: jwtSign[1],
    };
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'register',
  })
  async register(
    @Payload() payload: playloadCreateUserInterface,
  ): Promise<void> {
    try {
      await this.usersService
        .getUserModel()
        .create({ ...payload, password: payload.hashPassword });
    } catch (error) {
      this.logger.error(
        `catch on createUser: ${error?.message ?? JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException({
        message: error?.message ?? error,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'getByUserId',
  })
  async getByUserId(@Payload() userId: string): Promise<Users> {
    try {
      return this.authService.getByUserId(userId);
    } catch (error) {
      this.logger.error(
        `catch on getByUserId: ${error?.message ?? JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException({
        message: error?.message ?? error,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'getByEmail',
  })
  async getByEmail(@Payload() email: string): Promise<Users> {
    try {
      return this.authService.getByEmail(email);
    } catch (error) {
      this.logger.error(
        `catch on getByEmail: ${error?.message ?? JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException({
        message: error?.message ?? error,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'getByUsername',
  })
  async getByUsername(@Payload() username: string): Promise<Users> {
    try {
      return this.authService.getByUsername(username);
    } catch (error) {
      this.logger.error(
        `catch on getByUsername: ${error?.message ?? JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException({
        message: error?.message ?? error,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'getBlockUser',
  })
  async getBlockUser(email: string): Promise<Users> {
    try {
      return this.authService.blockUser(email);
    } catch (error) {
      this.logger.error(
        `catch on getBlockUser: ${error?.message ?? JSON.stringify(error)}`,
      );
      throw new InternalServerErrorException({
        message: error?.message ?? error,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'changePassword',
  })
  async changePasswordUser(payload: {
    userId: string;
    hashPassword;
  }): Promise<void> {
    const { userId, hashPassword } = payload;
    try {
      await this.usersService
        .getUserModel()
        .updateOne({ userId }, { password: hashPassword });
    } catch (e) {
      this.logger.error(
        `catch on changePassword: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'updateUser',
  })
  async updateUser(
    @Payload() payload: { userId: string; update: payloadUpdateUserInterface },
  ): Promise<void> {
    const { userId, update } = payload;
    try {
      await this.usersService
        .getUserModel()
        .updateOne({ userId }, { ...update });
    } catch (e) {
      this.logger.error(
        `catch on updateUser: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'deleteUser',
  })
  async deleteUser(@Payload() userId: string): Promise<void> {
    try {
      await this.usersService.deleteOneByUserId(userId);
    } catch (e) {
      this.logger.error(
        `catch on deleteUser: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'find-new-user',
  })
  async findNewUser(): Promise<Users> {
    try {
      return await this.usersService.findNewAllUser();
    } catch (e) {
      this.logger.error(
        `catch on find-new-user: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'ban-user',
  })
  async banUser(@Payload() userId: string): Promise<void> {
    try {
      await this.usersService.getUserModel().updateOne(
        {
          userId,
        },
        {
          status: StatusUser.INACTIVE,
        },
      );
    } catch (e) {
      this.logger.error(
        `catch on ban-user: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'un-ban-user',
  })
  async unBanUser(@Payload() userId: string): Promise<void> {
    try {
      await this.usersService.getUserModel().updateOne(
        {
          userId,
        },
        {
          status: StatusUser.ACTIVE,
        },
      );
    } catch (e) {
      this.logger.error(
        `catch on ban-user: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'update-role',
  })
  async updateRole(
    @Payload() update: { userId: string; roles: string },
  ): Promise<void> {
    const { userId, roles } = update;
    const roleUpdate = {
      $set: {
        roles: roles,
      },
    };
    try {
      await this.usersService.getUserModel().updateOne({ userId }, roleUpdate);
    } catch (e) {
      this.logger.error(
        `catch on update-roles: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'getPagination',
  })
  async getPagination(
    @Payload()
    payload: PaginationInterface & FindOptionsInterface<Users>,
  ): Promise<PaginationResponseInterface<Users>> {
    const { filter, page, perPage, select, sort } = payload;

    try {
      const [records, count] = await this.usersService.getPagination(
        filter,
        {
          page,
          perPage,
        },
        sort,
        select,
      );
      return {
        page,
        perPage,
        count,
        records,
      };
    } catch (e) {
      this.logger.error(
        `catch on getPagination: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }

  @MessagePattern({
    cmd: USER_CMD,
    method: 'get-admin-role',
  })
  async getAdminRole(email: string): Promise<Users> {
    try {
      return await this.authService.getAdminRole(email);
    } catch (e) {
      this.logger.error(
        `catch on getAdminRole: ${e?.message ?? JSON.stringify(e)}`,
      );
      throw new InternalServerErrorException({
        message: e?.message ?? e,
      });
    }
  }
}
