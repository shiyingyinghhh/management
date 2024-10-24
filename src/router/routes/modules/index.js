import { DEFAULT_LAYOUT } from '@/router/constants'

export default {
  path: '/',
  name: 'root',
  component: DEFAULT_LAYOUT,
  meta: {
    order: 0,
  },
  children: [
    {
      path: 'home',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
      meta: {
        title: '首页',
        icon: 'icon-home',
        order: 0,
      }
    },
    {
      path: '/projects',
      name: 'projectManagement',
      component: () => import('@/views/projects/index.vue'),
      meta: {
        title: '项目管理',
      }
    },
    {
      path: '/projects/project/:projectNumber',
      name: 'projectDetail',
      component: () => import('@/views/projects/project-[projectNumber].vue'),
      meta: {
        title: '项目详情',
      }
    },
    {
      path: '/template',
      name: 'templateManagement',
      component: () => import('@/views/template/index.vue'),
      meta: {
        title: '模板管理',
      }
    },
    {
      path: '/material',
      name: 'materialManagement',
      component: () => import('@/views/material/index.vue'),
      meta: {
        title: '���材管理',
      }
    },
    {
      path: '/certificate',
      name: 'certificateManagement',
      component: () => import('@/views/certificate/index.vue'),
      meta: {
        title: '证书管理',
      }
    }
  ]
}
