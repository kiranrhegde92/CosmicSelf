import { AuthUser } from '../store/authStore';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const authService = {
  async login(email: string, _password: string): Promise<AuthUser> {
    await wait(700);
    return {
      id: 'usr_demo',
      name: email.split('@')[0] || 'Seeker',
      email,
    };
  },

  async signup(name: string, email: string, _password: string): Promise<AuthUser> {
    await wait(900);
    return {
      id: 'usr_demo',
      name,
      email,
    };
  },

  async logout(): Promise<void> {
    await wait(200);
  },
};
