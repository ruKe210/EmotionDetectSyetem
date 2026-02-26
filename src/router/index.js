import { createRouter, createWebHistory } from 'vue-router';

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/RealTimeRecog.vue'),
    meta: {
      title: '实时识别',
      requiresAuth: true
    }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryData.vue'),
    meta: {
      title: '历史数据',
      requiresAuth: true
    }
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('../views/SystemConfig.vue'),
    meta: {
      title: '系统配置',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '情绪识别系统'} - 人脸情绪识别管理系统`;
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (token) {
      // 有token，允许访问
      next();
    } else {
      // 无token，允许访问（开发环境）
      // 实际生产环境应该跳转到登录页
      next();
    }
  } else {
    // 不需要认证的页面，直接访问
    next();
  }
});

export default router;