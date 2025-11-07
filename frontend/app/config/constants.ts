export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const routes = {
  welcome: '/',
  login: '/auth/login',
  register: '/auth/register',
  home: '/home',
  profile: '/profile',
};
