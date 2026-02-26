<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo区域 -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            <path d="M18 8c1.1 0 2 .9 2 2s-.9 2-2 2"/>
            <path d="M6 8c-1.1 0-2 .9-2 2s.9 2 2 2"/>
          </svg>
        </div>
        <transition name="fade-slide">
          <div v-show="!sidebarCollapsed" class="logo-text">
            <span class="logo-title">情绪识别</span>
            <span class="logo-sub">智能分析系统</span>
          </div>
        </transition>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none' }">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          :title="sidebarCollapsed ? item.label : ''"
        >
          <div class="nav-icon" v-html="item.icon"></div>
          <transition name="fade-slide">
            <span v-show="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          </transition>
          <transition name="fade">
            <span v-show="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
          </transition>
        </router-link>
      </nav>

      <!-- 底部用户信息 -->
      <div class="sidebar-footer">
        <div class="user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
        <transition name="fade-slide">
          <div v-show="!sidebarCollapsed" class="user-info">
            <span class="user-name">系统管理员</span>
            <span class="user-role">Administrator</span>
          </div>
        </transition>
        <transition name="fade">
          <button v-show="!sidebarCollapsed" class="logout-btn" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </transition>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-wrapper">
      <!-- 顶部导航栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <div class="breadcrumb">
            <span class="breadcrumb-home">首页</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="breadcrumb-sep">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span class="breadcrumb-current">{{ pageTitle }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-time">{{ currentTime }}</div>
          <div class="topbar-status">
            <span class="status-dot"></span>
            <span>系统正常</span>
          </div>
          <div class="topbar-notify">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notify-badge">3</span>
          </div>
          <div class="topbar-user">
            <div class="topbar-avatar">A</div>
            <span>Admin</span>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const sidebarCollapsed = ref(false);
const currentTime = ref('');

let timer = null;

const updateTime = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${h}:${m}:${s}`;
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const navItems = [
  {
    path: '/',
    label: '控制台',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>`
  },
  {
    path: '/realtime',
    label: '实时检测',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M23 7l-7 5 7 5V7z"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>`
  },
  {
    path: '/history',
    label: '历史记录',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`
  },
  {
    path: '/reports',
    label: '统计报表',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>`
  },
  {
    path: '/device',
    label: '设备管理',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>`
  },
  {
    path: '/alerts',
    label: '告警管理',
    badge: '3',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>`
  },
  {
    path: '/logs',
    label: '日志管理',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>`
  },
  {
    path: '/users',
    label: '用户管理',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`
  },
  {
    path: '/config',
    label: '系统配置',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41"/>
    </svg>`
  },
];

const titleMap = {
  '/': '控制台',
  '/realtime': '实时识别',
  '/history': '历史记录',
  '/reports': '统计报表',
  '/config': '系统配置',
  '/device': '设备管理',
  '/alerts': '告警管理',
  '/logs': '日志管理',
  '/users': '用户管理'
};

const pageTitle = computed(() => titleMap[route.path] || '控制台');

const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

const handleLogout = () => {
  console.log('logout');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif;
  background: #f0f4ff;
  color: #2d3436;
  min-height: 100vh;
}

:root {
  --primary: #6c8ef0;
  --primary-light: #eef1ff;
  --primary-dark: #4a6cf7;
  --mint: #00cec9;
  --mint-light: #e8fffe;
  --pink: #fd79a8;
  --pink-light: #fff0f6;
  --yellow: #fdcb6e;
  --yellow-light: #fffbf0;
  --green: #00b894;
  --green-light: #e8fff9;
  --lavender: #a29bfe;
  --lavender-light: #f4f3ff;
  --sidebar-width: 240px;
  --sidebar-collapsed: 68px;
  --topbar-height: 64px;
  --radius: 12px;
  --shadow: 0 2px 20px rgba(108, 142, 240, 0.08);
  --shadow-hover: 0 8px 30px rgba(108, 142, 240, 0.15);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 50%, #f0fff8 100%);
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: var(--sidebar-width);
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(108, 142, 240, 0.08);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  min-height: 72px;
  position: relative;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--lavender) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
  stroke: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
}

.logo-title {
  font-size: 15px;
  font-weight: 700;
  color: #2d3436;
  letter-spacing: 0.5px;
}

.logo-sub {
  font-size: 11px;
  color: #b2bec3;
  margin-top: 1px;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: var(--transition);
}

.collapse-btn:hover {
  background: var(--primary-light);
}

.collapse-btn svg {
  width: 14px;
  height: 14px;
  stroke: #636e72;
  transition: transform 0.3s ease;
}

/* 导航 */
.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #636e72;
  margin-bottom: 4px;
  transition: var(--transition);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 60%;
  background: var(--primary);
  border-radius: 0 4px 4px 0;
  transition: transform 0.2s ease;
}

.nav-item:hover {
  background: var(--primary-light);
  color: var(--primary);
  transform: translateX(2px);
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.nav-item.active::before {
  transform: translateY(-50%) scaleY(1);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.nav-label {
  font-size: 14px;
  flex: 1;
}

.nav-badge {
  background: var(--pink);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* 底部用户 */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--mint) 0%, var(--primary) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar svg {
  width: 18px;
  height: 18px;
  stroke: white;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #2d3436;
}

.user-role {
  font-size: 11px;
  color: #b2bec3;
}

.logout-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: var(--transition);
  flex-shrink: 0;
}

.logout-btn:hover {
  background: #fff0f6;
}

.logout-btn svg {
  width: 16px;
  height: 16px;
  stroke: #fd79a8;
}

/* ===== 主内容区 ===== */
.main-wrapper {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed ~ .main-wrapper {
  margin-left: var(--sidebar-collapsed);
}

/* 顶部栏 */
.topbar {
  height: var(--topbar-height);
  background: white;
  box-shadow: 0 2px 12px rgba(108, 142, 240, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb-home {
  font-size: 13px;
  color: #b2bec3;
}

.breadcrumb-sep {
  width: 14px;
  height: 14px;
  stroke: #dfe6e9;
}

.breadcrumb-current {
  font-size: 14px;
  font-weight: 600;
  color: #2d3436;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.topbar-time {
  font-size: 13px;
  color: #636e72;
  font-variant-numeric: tabular-nums;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 4px 10px;
  border-radius: 6px;
}

.topbar-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--green);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--green);
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

.topbar-notify {
  position: relative;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8f9fa;
  transition: var(--transition);
}

.topbar-notify:hover {
  background: var(--primary-light);
}

.topbar-notify svg {
  width: 18px;
  height: 18px;
  stroke: #636e72;
}

.notify-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: var(--pink);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #2d3436;
  font-weight: 500;
}

.topbar-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--lavender) 100%);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

/* 页面内容 */
.page-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* ===== 过渡动画 ===== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-enter-active {
  animation: page-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
  animation: page-out 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes page-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes page-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}

/* ===== 全局卡片样式 ===== */
.card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin-bottom: 20px;
  border: 1px solid rgba(108, 142, 240, 0.06);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-hover);
}

.card-header {
  padding: 18px 22px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h4, .card-title {
  font-size: 16px;
  font-weight: 700;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-body {
  padding: 20px 22px;
}

/* ===== 全局按钮 ===== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: var(--transition);
  text-decoration: none;
  white-space: nowrap;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-sm {
  padding: 5px 12px;
  font-size: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--lavender) 100%);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, var(--green) 0%, #00a381 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, var(--yellow) 0%, #e17055 100%);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #74b9ff 0%, var(--primary) 100%);
  color: white;
}

.btn-secondary {
  background: #f0f4ff;
  color: var(--primary);
  border: 1px solid #dce4ff;
}

.btn-secondary:hover {
  background: var(--primary-light);
}

/* ===== 全局表格 ===== */
.fresh-table {
  width: 100%;
  border-collapse: collapse;
}

.fresh-table thead tr {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
}

.fresh-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #636e72;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 2px solid #eef1ff;
}

.fresh-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: #2d3436;
  border-bottom: 1px solid #f8f9fa;
  transition: background 0.2s ease;
}

.fresh-table tbody tr {
  transition: var(--transition);
}

.fresh-table tbody tr:hover td {
  background: #fafbff;
}

.fresh-table tbody tr:last-child td {
  border-bottom: none;
}

/* ===== 全局徽章 ===== */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.badge-success {
  background: var(--green-light);
  color: var(--green);
}

.badge-danger {
  background: var(--pink-light);
  color: var(--pink);
}

.badge-warning {
  background: var(--yellow-light);
  color: #e17055;
}

.badge-info {
  background: var(--primary-light);
  color: var(--primary);
}

/* ===== 全局表单 ===== */
.form-control {
  width: 100%;
  padding: 9px 14px;
  border: 1.5px solid #e8ecf4;
  border-radius: 8px;
  font-size: 13px;
  color: #2d3436;
  background: white;
  transition: var(--transition);
  outline: none;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(108, 142, 240, 0.1);
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #dfe6e9;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b2bec3;
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .main-wrapper {
    margin-left: 0;
  }
}
</style>
