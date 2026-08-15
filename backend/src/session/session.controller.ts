import { Controller, Get, Post } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  get() {
    return this.sessionService.get();
  }

  @Post('login')
  login() {
    return this.sessionService.login();
  }

  @Post('logout')
  logout() {
    return this.sessionService.logout();
  }
}
