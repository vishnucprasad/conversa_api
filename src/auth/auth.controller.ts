import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticatedUser, PublicResource } from '@conversa/common';
import {
  ChangePasswordDto,
  SignupDto,
  EditUserDto,
  SigninDto,
  UserDto,
} from './dtos';
import { RtGuard } from './guards';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('user')
  public getAuthenticatedUser(@AuthenticatedUser() user: UserDto): UserDto {
    return new UserDto(user);
  }

  @PublicResource()
  @Post('local/signup')
  public localSignup(@Body() dto: SignupDto): Promise<Tokens> {
    return this.authService.localSignup(dto);
  }

  @PublicResource()
  @HttpCode(HttpStatus.OK)
  @Post('local/signin')
  public localSignin(@Body() dto: SigninDto): Promise<Tokens> {
    return this.authService.localSignin(dto);
  }

  @PublicResource()
  @UseGuards(RtGuard)
  @Post('refresh')
  public refreshTokens(
    @AuthenticatedUser('_id') userId: string,
    @AuthenticatedUser('rt') rt: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, rt);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('user/edit')
  public editUser(
    @AuthenticatedUser('_id') userId: string,
    @Body() dto: EditUserDto,
  ): Promise<UserDto> {
    return this.authService.editUser(userId, dto);
  }

  @Patch('user/password')
  public changePassword(
    @AuthenticatedUser('_id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ChangePasswordDto> {
    return this.authService.changePassword(userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('signout')
  public signout(@AuthenticatedUser('_id') userId: string): Promise<void> {
    return this.authService.signout(userId);
  }
}
