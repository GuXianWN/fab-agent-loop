import type { User } from '@recovery-assistant/shared';
import { DEMO_USER_ID } from '../database/entities';

const demoUser: User = {
  id: DEMO_USER_ID,
  name: 'Demo User',
  username: 'demo_user',
  avatar: 'https://github.com/nuxt.png',
};

export function getUser(): User {
  return demoUser;
}
