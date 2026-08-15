export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface Session {
  user: User | null;
}
