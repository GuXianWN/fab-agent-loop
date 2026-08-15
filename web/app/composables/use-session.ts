import type { Session } from '~/types/session';

export function useSession() {
  const api = useApi();
  const session = useState<Session>('session', () => ({ user: null }));

  async function refresh() {
    session.value = await api.getSession();
  }

  async function login() {
    session.value = await api.login();
  }

  async function logout() {
    session.value = await api.logout();
  }

  return {
    session,
    user: computed(() => session.value.user),
    loggedIn: computed(() => session.value.user !== null),
    refresh,
    login,
    logout,
  };
}
