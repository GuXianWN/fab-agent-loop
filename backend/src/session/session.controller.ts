import { Controller, Get, Post } from '@nestjs/common';
import { R } from '../common/r';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  get() {
    return R.success().data(this.sessionService.get());
  }

  @Post('login')
  login() {
    return R.success().data(this.sessionService.login());
  }

  @Post('logout')
  logout() {
    return R.success().data(this.sessionService.logout());
  }
}
