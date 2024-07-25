import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, LoginUserDTO } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Request } from 'express';
import { GetUser, RawHeader } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDTO) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDTO) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  privateRoute(
    @Req() request: Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeader() rawHeaders: string,
  ) {
    // console.log(request.rawHeaders);
    return {
      message: 'This is a private route',
      user,
      userEmail,
      rawHeaders,
    };
  }
}
