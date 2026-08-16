import { Injectable } from '@nestjs/common';
import type { Session } from '@recovery-assistant/shared';
import { getUser } from '../common/user-context';

@Injectable()
export class SessionService {
  private loggedIn = false;

  get(): Session {
    return { user: this.loggedIn ? getUser() : null };
  }

  login() {
    this.loggedIn = true;
    return this.get();
  }

  logout() {
    this.loggedIn = false;
    return this.get();
  }
}
