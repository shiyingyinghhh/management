export const WHITE_LIST = [
  { name: 'notFound', children: [] },
  { name: 'login', children: [] },
];

export const NOT_FOUND = {
  name: 'notFound',
};

export const REDIRECT_ROUTE_NAME = 'Redirect';

export const DEFAULT_ROUTE_NAME = 'HOME';

export const DEFAULT_LAYOUT = () => import('@/layout/default-layout.vue')

export const DEFAULT_ROUTE = {
  title: 'HOME',
  name: DEFAULT_ROUTE_NAME,
  fullPath: '/home',
};
