<template>
  <div class="main-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <h3><i class="fa fa-smile-o"></i> 情绪识别系统</h3>
      <nav>
        <div class="nav-item">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            <i class="fa fa-dashboard"></i>
            <span>控制台</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/realtime" class="nav-link" :class="{ active: $route.path === '/realtime' }">
            <i class="fa fa-video-camera"></i>
            <span>实时检测</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/history" class="nav-link" :class="{ active: $route.path === '/history' }">
            <i class="fa fa-history"></i>
            <span>历史记录</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/reports" class="nav-link" :class="{ active: $route.path === '/reports' }">
            <i class="fa fa-bar-chart"></i>
            <span>统计报表</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/config" class="nav-link" :class="{ active: $route.path === '/config' }">
            <i class="fa fa-cog"></i>
            <span>系统配置</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/device" class="nav-link" :class="{ active: $route.path === '/device' }">
            <i class="fa fa-server"></i>
            <span>设备管理</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/alerts" class="nav-link" :class="{ active: $route.path === '/alerts' }">
            <i class="fa fa-bell"></i>
            <span>告警管理</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/logs" class="nav-link" :class="{ active: $route.path === '/logs' }">
            <i class="fa fa-file-text-o"></i>
            <span>日志管理</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/users" class="nav-link" :class="{ active: $route.path === '/users' }">
            <i class="fa fa-users"></i>
            <span>用户管理</span>
          </router-link>
        </div>
      </nav>
      <div class="mt-auto">
        <hr style="border-color: #4a5568;">
        <button class="btn btn-danger btn-block">
          <i class="fa fa-sign-out"></i> 退出登录
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="content">
      <!-- 页面头部 -->
      <div class="header">
        <h2>{{ pageTitle }}</h2>
        <div class="user-info">
          <span id="currentUser">系统管理员</span>
          <i class="fa fa-user-circle" style="font-size: 24px; color: #667eea;"></i>
        </div>
      </div>

      <!-- 页面内容 -->
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 根据当前路由计算页面标题
const pageTitle = computed(() => {
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
  return titleMap[window.location.pathname] || '控制台';
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.main-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background: #2d3748;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.sidebar h3 {
  margin-bottom: 30px;
  font-weight: 600;
  color: #667eea;
}

.nav-item {
  margin-bottom: 8px;
}

.nav-link {
  color: #cbd5e0;
  padding: 12px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.nav-link:hover, .nav-link.active {
  background: #4a5568;
  color: white;
  text-decoration: none;
}

.content {
  flex: 1;
  padding: 20px;
  background: #f7fafc;
  overflow-y: auto;
}

.header {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #2d3748;
}

.card-body {
  padding: 20px;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-content h4 {
  margin: 0;
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.stat-content p {
  margin: 5px 0 0 0;
  font-size: 28px;
  font-weight: 600;
  color: #2d3748;
}

.btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 101, 101, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #718096 0%, #4a5568 100%);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(113, 128, 150, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #ed8936 0%, #c05621 100%);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
  color: white;
}

.btn-block {
  width: 100%;
  padding: 12px;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.badge-success {
  background-color: #48bb78;
  color: white;
}

.badge-danger {
  background-color: #f56565;
  color: white;
}

.badge-warning {
  background-color: #ed8936;
  color: white;
}

.badge-info {
  background-color: #4299e1;
  color: white;
}

.table {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
}

.table td {
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.table tr:hover {
  background: #f7fafc;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  outline: none;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 15px;
  }

  .dashboard-stats {
    grid-template-columns: 1fr;
  }
}
</style>