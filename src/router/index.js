import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/TestPage.vue'),
    meta: {
      title: '控制台',
      requiresAuth: false
    }
  },
  {
    path: '/realtime',
    name: 'RealTime',
    component: () => import('../views/RealTimeRecog.vue'),
    meta: {
      title: '实时识别',
      requiresAuth: false
    }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryData.vue'),
    meta: {
      title: '历史记录',
      requiresAuth: false
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/ReportsPage.vue'),
    meta: {
      title: '统计报表',
      requiresAuth: false
    }
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('../views/SystemConfig.vue'),
    meta: {
      title: '系统配置',
      requiresAuth: false
    }
  },
  {
    path: '/device',
    name: 'Device',
    component: () => import('../views/DevicePage.vue'),
    meta: {
      title: '设备管理',
      requiresAuth: false
    }
  },
  {
    path: '/alerts',
    name: 'Alerts',
    component: () => import('../views/AlertsPage.vue'),
    meta: {
      title: '告警管理',
      requiresAuth: false
    }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('../views/LogsPage.vue'),
    meta: {
      title: '日志管理',
      requiresAuth: false
    }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/UsersPage.vue'),
    meta: {
      title: '用户管理',
      requiresAuth: false
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫，设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title + ' - 人脸情绪识别系统';
  } else {
    document.title = '人脸情绪识别系统';
  }
  next();
});

export default router;