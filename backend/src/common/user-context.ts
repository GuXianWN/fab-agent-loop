import type { User } from '@recovery-assistant/shared';
const demoUser: User = {
  id: 'demo_user',
  name: 'Demo User',
  username: 'demo_user',
  avatar: 'https://github.com/nuxt.png',
};

export function getUser(): User {
  return demoUser;
}
