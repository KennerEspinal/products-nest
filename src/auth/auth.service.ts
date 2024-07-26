import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO, LoginUserDTO } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interface/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User) private readonly userRespository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDTO) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRespository.create({
        ...userData,
        password: await bcrypt.hashSync(password, 10),
      });
      await this.userRespository.save(user);
      delete user.password;
      return { ...user, ...this.JwtToken({ id: user.id }) };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDTO: LoginUserDTO) {
    const { email, password } = loginUserDTO;
    const user = await this.userRespository.findOne({
      where: { email },
      select: { password: true, email: true, id: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials');

    delete user.password;
    return { ...user, ...this.JwtToken({ id: user.id }) };
  }

  async checkAuthStatus(user: User) {
    delete user.roles;
    delete user.password;
    return { ...user, ...this.JwtToken({ id: user.id }) };
  }

  private JwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return {
      token,
    };
  }

  private handleDBErrors(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Please check the server logs');
  }
}
