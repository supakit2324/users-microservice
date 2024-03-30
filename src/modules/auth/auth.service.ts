import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Users } from '../users/users.schema';
import { UsersService } from '../users/users.service';
import StatusUser from '../users/enum/status-user.enum';
import RoleUser from '../users/enum/roles-user.enum';
import { UsersInterface } from '../users/interface/users.interface';
import { LoginInterface } from './interface/login.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  async getRoleByEmail(email: string): Promise<Users> {
    return this.usersService
      .getUserModel()
      .findOne({ email }, { email: 1, roles: 1 })
      .lean();
  }

  async createTokens(email: string): Promise<LoginInterface> {
    const jwtOption: JwtSignOptions = {
      expiresIn: '2day',
      secret: this.configService.get<string>('authentication.secret'),
    };

    const userRoles = await this.getRoleByEmail(email);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          email,
          roles: userRoles,
        },
        jwtOption,
      ),
      this.jwtService.signAsync(
        {
          email,
        },
        jwtOption,
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  getByUserId(userId: string): Promise<Users> {
    return this.usersService.getUserModel().findOne({ userId }).lean();
  }

  getByEmail(email: string): Promise<Users> {
    return this.usersService.getUserModel().findOne({ email }).lean();
  }

  getByUsername(username: string): Promise<Users> {
    return this.usersService.getUserModel().findOne({ username }).lean();
  }

  blockUser(email: string): Promise<Users> {
    return this.usersService
      .getUserModel()
      .findOne({
        email,
        status: StatusUser.INACTIVE,
      })
      .lean();
  }

  getAdminRole(email: string): Promise<Users> {
    return this.usersService.getUserModel().findOne({
      email: email,
      roles: RoleUser.ADMIN,
    });
  }
}
