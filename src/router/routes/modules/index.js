import { DEFAULT_LAYOUT } from '@/router/constants'
import { PROJECT_LAYOUT } from '../base';

const projectDetailRoute = {
  path: '/projects/project/:projectNumber',
  name: 'projectDetail',
  component: PROJECT_LAYOUT,
  meta: {
    requiresAuth: true,
    icon: 'icon-dashboard', 
    hideInMenu: true,
  },
  children: [
    {
      path: '',
      name: 'ProjectOverview',
      component: () => import('@/views/projects/ProjectDetail.vue'),
      meta: {
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'template',
      name: 'templateManagement',
      component: () => import('@/views/template/index.vue'),
      meta: {
        title: '证书模板',
        order: 2,
      },
    },
    {
      path: 'material',
      name: 'materialManagement',
      component: () => import('@/views/material/index.vue'),
      meta: {
        title: '模板素材',
        order: 3,
      },
    },
    {
      path: 'certificate',
      name: 'certificateManagement',
      component: () => import('@/views/certificate/index.vue'),
      meta: {
        title: '证书管理',
        icon: 'icon-file',
        order: 4,
      },
    },
  ],
};

export default [
  {
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
    ]
  },
  projectDetailRoute
]
