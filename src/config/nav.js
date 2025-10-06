export const navConfig = {
  guest: [
    { name: 'Home', to: '/home' },
    {
      name: 'Events',
      children: [{ name: 'Map', to: '/events/map' }],
    },{ name: 'Login', to: '/login' },
    { name: 'Register', to: '/register' },
  ],
  viewer: [
    {
      name: 'User',
      children: [
        { name: 'profile', to: '/user/profile' },
        { name: 'logout', to: '/login' },
      ],
    },
    { name: 'Recipes', to: '/recipe' },
    {
      name: 'Events',
      children: [
        { name: 'List', to: '/events/list' },
        { name: 'Map', to: '/events/map' },
      ],
    },
    { name: 'Log out', to: '/login' },
  ],
  auth: [
    { name: 'Login', to: '/login' },
    { name: 'Register', to: '/register' },
  ],
}
