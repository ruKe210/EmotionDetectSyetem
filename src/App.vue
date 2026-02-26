<template>
  <div class="app">
    <el-container>
      <el-header height="60px" class="header">
        <div class="header-left">
          <h1 class="logo">人脸情绪识别系统</h1>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="small" :src="userAvatar"></el-avatar>
              <span class="username">{{ currentUser?.name || '未登录' }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogin">登录</el-dropdown-item>
                <el-dropdown-item @click="handleLogout" v-if="currentUser">退出</el-dropdown-item>
                <el-dropdown-item @click="goToConfig" v-if="currentUser">系统配置</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/">
              <el-icon><videocam /></el-icon>
              <span>实时识别</span>
            </el-menu-item>
            <el-menu-item index="/history">
              <el-icon><timer /></el-icon>
              <span>历史数据</span>
            </el-menu-item>
            <el-menu-item index="/config" v-if="currentUser">
              <el-icon><setting /></el-icon>
              <span>系统配置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemStore } from './store/modules/systemStore'
import { ArrowDown, Videocam, Timer, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const systemStore = useSystemStore()

const currentUser = computed(() => systemStore.currentUser)
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const activeMenu = computed(() => {
  return router.currentRoute.value.path
})

const handleMenuSelect = (key) => {
  router.push(key)
}

const handleLogin = () => {
  // 模拟登录
  systemStore.setCurrentUser({
    id: 1,
    username: 'admin',
    name: '系统管理员',
    role: 'admin'
  })
}

const handleLogout = () => {
  systemStore.setCurrentUser(null)
  router.push('/')
}

const goToConfig = () => {
  router.push('/config')
}

onMounted(() => {
  // 初始化系统
  systemStore.initSystem()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.sidebar {
  background: #2d3748;
  height: calc(100vh - 60px);
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.sidebar-menu .el-menu-item {
  color: #cbd5e0;
  height: 60px;
  line-height: 60px;
  font-size: 14px;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-menu-item.is-active {
  background: #4a5568;
  color: white;
}

.main-content {
  background: #f7fafc;
  padding: 20px;
  min-height: calc(100vh - 60px);
}
</style>