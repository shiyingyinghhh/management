import { DEFAULT_LAYOUT } from '@/router/constants'
export default {
  path: '/index',
  name: 'index',
  component: DEFAULT_LAYOUT,
  meta: {
    title: '首页',
    icon: 'icon-dashboard',
    order: 0,
  },
  children: [
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/module/home/index.vue'),
      meta: {
        title: 'HOME',
      }
    }
  ]
}