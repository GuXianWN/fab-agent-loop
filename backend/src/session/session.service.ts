import { Injectable } from '@nestjs/common';
import type { Session, User } from '../../../shared/types';
import { DEMO_USER_ID } from '../database/entities';

const user: User = {
  id: DEMO_USER_ID,
  name: 'Demo User',
  username: 'demo_user',
  avatar: 'https://github.com/nuxt.png',
};

@Injectable()
export class SessionService {
  private loggedIn = false;

  get(): Session {
    return { user: this.loggedIn ? user : null };
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
