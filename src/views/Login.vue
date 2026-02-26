<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2><i class="el-icon-sunny"></i> 情绪识别管理系统</h2>
        <p>请登录以访问系统</p>
      </div>
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
            @keyup.enter="handleLogin"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            @keyup.enter="handleLogin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            @click="handleLogin"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <a href="#" class="forgot-password">忘记密码?</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from '../store/modules/systemStore';
import { validateUsername, validatePassword } from '../utils/validate';

const router = useRouter();
const systemStore = useSystemStore();

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

const loading = ref(false);

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (!validateUsername(value)) {
          callback(new Error('用户名长度3-20位，只能包含字母、数字、下划线和减号'));
        } else {
          callback();
        }
      }, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (!validatePassword(value)) {
          callback(new Error('密码至少8位，包含大小写字母和数字'));
        } else {
          callback();
        }
      }, trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  // 模拟登录验证
  loading.value = true;
  
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的模拟验证
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      // 登录成功
      const userInfo = {
        id: 1,
        username: 'admin',
        name: '系统管理员',
        role: 'admin',
        email: 'admin@example.com',
        token: 'mock-token-' + Date.now()
      };
      
      // 存储用户信息
      systemStore.setUser(userInfo);
      
      // 跳转到首页
      router.push('/');
    } else if (loginForm.username === 'operator' && loginForm.password === 'operator123') {
      // 操作员登录
      const userInfo = {
        id: 2,
        username: 'operator',
        name: '操作员',
        role: 'operator',
        email: 'operator@example.com',
        token: 'mock-token-' + Date.now()
      };
      
      systemStore.setUser(userInfo);
      router.push('/');
    } else if (loginForm.username === 'viewer' && loginForm.password === 'viewer123') {
      // 查看员登录
      const userInfo = {
        id: 3,
        username: 'viewer',
        name: '查看员',
        role: 'viewer',
        email: 'viewer@example.com',
        token: 'mock-token-' + Date.now()
      };
      
      systemStore.setUser(userInfo);
      router.push('/');
    } else {
      // 登录失败
      ElMessage.error('用户名或密码错误');
    }
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 400px;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-header p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.login-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4398 100%);
}

.login-footer {
  text-align: center;
}

.forgot-password {
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #66b1ff;
}

@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .login-header h2 {
    font-size: 20px;
  }
}
</style>