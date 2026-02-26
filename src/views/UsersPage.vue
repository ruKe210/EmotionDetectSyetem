<template>
  <div class="users-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon" style="background: linear-gradient(135deg, #a29bfe, #6c8ef0)">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <div class="page-title">用户管理</div>
          <div class="page-sub">共 <strong>{{ users.length }}</strong> 名用户 · <strong style="color: var(--green)">{{ activeCount }}</strong> 活跃</div>
        </div>
      </div>
      <div class="page-actions">
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="搜索用户..." v-model="searchText" class="form-control form-control-sm" />
        </div>
        <button class="btn btn-primary" @click="showAddModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          添加用户
        </button>
      </div>
    </div>

    <!-- 角色统计 -->
    <div class="role-stats">
      <div class="role-stat" v-for="role in roleStats" :key="role.name" :class="role.cls">
        <div class="rs-avatar" :style="{ background: role.gradient }">{{ role.initial }}</div>
        <div>
          <div class="rs-count">{{ role.count }}</div>
          <div class="rs-label">{{ role.name }}</div>
        </div>
        <div class="rs-badge">{{ role.permission }}</div>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="card">
      <div class="card-header">
        <h4>
          <span class="header-dot" style="background: var(--lavender)"></span>
          用户列表
        </h4>
        <div class="filter-tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            class="filter-tab"
            :class="{ active: activeStatus === tab.value }"
            @click="activeStatus = tab.value"
          >{{ tab.label }}</button>
        </div>
      </div>
      <div class="card-body p0">
        <table class="fresh-table">
          <thead>
            <tr>
              <th>用户信息</th>
              <th>用户名</th>
              <th>角色</th>
              <th>邮箱</th>
              <th>最后登录</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, i) in filteredUsers" :key="user.id" :style="{ animationDelay: i * 0.06 + 's' }" class="row-anim">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-lg" :style="{ background: user.gradient }">{{ user.name.charAt(0) }}</div>
                  <div>
                    <div class="user-real-name">{{ user.name }}</div>
                    <div class="user-id-sub">ID: #{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="username-cell">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  {{ user.username }}
                </div>
              </td>
              <td>
                <div class="role-badge" :class="user.roleCls">{{ user.role }}</div>
              </td>
              <td class="email-cell">{{ user.email }}</td>
              <td class="time-cell">{{ user.lastLogin }}</td>
              <td>
                <div class="status-indicator" :class="user.status === '激活' ? 'online' : 'offline'">
                  <span class="status-dot-sm"></span>
                  {{ user.status }}
                </div>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-primary btn-sm" @click="editUser(user)">编辑</button>
                  <button class="btn btn-warning btn-sm" v-if="user.status === '激活'" @click="toggleUser(user)">禁用</button>
                  <button class="btn btn-success btn-sm" v-else @click="toggleUser(user)">启用</button>
                  <button class="btn btn-danger btn-sm" @click="deleteUser(user)">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="empty-state">
                <div class="empty-icon">👤</div>
                <div>暂无用户数据</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <div class="modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
      <div class="modal-dialog">
        <div class="modal-header">
          <h4>添加新用户</h4>
          <button class="modal-close" @click="showAddModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>姓名</label>
            <input type="text" class="form-control" v-model="newUser.name" placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>用户名</label>
            <input type="text" class="form-control" v-model="newUser.username" placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input type="email" class="form-control" v-model="newUser.email" placeholder="请输入邮箱" />
          </div>
          <div class="form-group">
            <label>角色</label>
            <select class="form-control" v-model="newUser.role">
              <option value="管理员">管理员</option>
              <option value="操作员">操作员</option>
              <option value="查看员">查看员</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="addUser">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchText = ref('');
const activeStatus = ref('all');
const showAddModal = ref(false);

const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '激活', value: '激活' },
  { label: '已禁用', value: '禁用' },
];

const users = ref([
  { id: 1, name: '系统管理员', username: 'admin', role: '管理员', roleCls: 'admin', email: 'admin@example.com', status: '激活', lastLogin: '刚刚', gradient: 'linear-gradient(135deg, #6c8ef0, #a29bfe)' },
  { id: 2, name: '张操作员', username: 'operator', role: '操作员', roleCls: 'operator', email: 'operator@example.com', status: '激活', lastLogin: '2小时前', gradient: 'linear-gradient(135deg, #00cec9, #00b894)' },
  { id: 3, name: '李查看员', username: 'viewer', role: '查看员', roleCls: 'viewer', email: 'viewer@example.com', status: '激活', lastLogin: '昨天', gradient: 'linear-gradient(135deg, #fdcb6e, #e17055)' },
  { id: 4, name: '王测试员', username: 'tester', role: '操作员', roleCls: 'operator', email: 'tester@example.com', status: '禁用', lastLogin: '3天前', gradient: 'linear-gradient(135deg, #fd79a8, #e84393)' },
]);

const newUser = ref({ name: '', username: '', email: '', role: '查看员' });

const activeCount = computed(() => users.value.filter(u => u.status === '激活').length);

const roleStats = computed(() => [
  { name: '管理员', initial: 'A', count: users.value.filter(u => u.role === '管理员').length, cls: 'admin', gradient: 'linear-gradient(135deg, #6c8ef0, #a29bfe)', permission: '全部权限' },
  { name: '操作员', initial: 'O', count: users.value.filter(u => u.role === '操作员').length, cls: 'operator', gradient: 'linear-gradient(135deg, #00cec9, #00b894)', permission: '操作权限' },
  { name: '查看员', initial: 'V', count: users.value.filter(u => u.role === '查看员').length, cls: 'viewer', gradient: 'linear-gradient(135deg, #fdcb6e, #e17055)', permission: '只读权限' },
]);

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    if (activeStatus.value !== 'all' && u.status !== activeStatus.value) return false;
    if (searchText.value && !u.name.includes(searchText.value) && !u.username.includes(searchText.value)) return false;
    return true;
  });
});

const editUser = (user) => console.log('edit', user);
const toggleUser = (user) => { user.status = user.status === '激活' ? '禁用' : '激活'; };
const deleteUser = (user) => {
  const idx = users.value.findIndex(u => u.id === user.id);
  if (idx > -1) users.value.splice(idx, 1);
};
const addUser = () => {
  if (!newUser.value.name || !newUser.value.username) return;
  users.value.push({
    id: users.value.length + 1,
    name: newUser.value.name,
    username: newUser.value.username,
    role: newUser.value.role,
    roleCls: newUser.value.role === '管理员' ? 'admin' : newUser.value.role === '操作员' ? 'operator' : 'viewer',
    email: newUser.value.email,
    status: '激活',
    lastLogin: '刚刚',
    gradient: 'linear-gradient(135deg, #a29bfe, #6c8ef0)',
  });
  newUser.value = { name: '', username: '', email: '', role: '查看员' };
  showAddModal.value = false;
};
</script>

<style scoped>
.users-page { animation: fade-up 0.3s ease; }

@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header-left { display: flex; align-items: center; gap: 14px; }

.page-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(162, 155, 254, 0.35);
}

.page-icon svg { width: 24px; height: 24px; }
.page-title { font-size: 20px; font-weight: 800; color: #2d3436; }
.page-sub { font-size: 13px; color: #b2bec3; margin-top: 2px; }
.page-sub strong { color: var(--primary); }

.page-actions { display: flex; gap: 10px; align-items: center; }

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-wrap svg {
  position: absolute;
  left: 10px;
  width: 15px;
  height: 15px;
  stroke: #b2bec3;
  z-index: 1;
}

.search-wrap .form-control { padding-left: 32px; min-width: 200px; }
.form-control-sm { padding: 7px 12px; font-size: 13px; }

/* 角色统计 */
.role-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.role-stat {
  background: white;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(108, 142, 240, 0.06);
}

.role-stat:hover { transform: translateY(-2px); }
.role-stat.admin { border-color: #eef1ff; }
.role-stat.operator { border-color: var(--mint-light); }
.role-stat.viewer { border-color: var(--yellow-light); }

.rs-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}

.rs-count { font-size: 22px; font-weight: 800; color: #2d3436; }
.rs-label { font-size: 12px; color: #b2bec3; font-weight: 600; }

.rs-badge {
  margin-left: auto;
  font-size: 11px;
  color: #b2bec3;
  background: #f8f9fa;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

/* 表格 */
.header-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.filter-tabs { display: flex; gap: 4px; }

.filter-tab {
  padding: 5px 14px;
  border: 1.5px solid #eef1ff;
  border-radius: 20px;
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: #b2bec3;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab.active { background: var(--primary); border-color: var(--primary); color: white; }
.filter-tab:hover:not(.active) { border-color: var(--primary); color: var(--primary); }

.p0 { padding: 0; }

/* 用户单元格 */
.user-cell { display: flex; align-items: center; gap: 12px; }

.user-avatar-lg {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}

.user-real-name { font-size: 13px; font-weight: 700; color: #2d3436; }
.user-id-sub { font-size: 11px; color: #b2bec3; margin-top: 2px; }

.username-cell {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #636e72;
  background: #f8f9fa;
  padding: 4px 10px;
  border-radius: 20px;
}

.username-cell svg { width: 12px; height: 12px; stroke: #b2bec3; }

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.role-badge.admin { background: var(--primary-light); color: var(--primary); }
.role-badge.operator { background: var(--mint-light); color: var(--mint); }
.role-badge.viewer { background: var(--yellow-light); color: #e17055; }

.email-cell { font-size: 12px; color: #636e72; }
.time-cell { font-size: 12px; color: #b2bec3; white-space: nowrap; }

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.status-dot-sm {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-indicator.online { color: var(--green); background: var(--green-light); }
.status-indicator.online .status-dot-sm { background: var(--green); animation: pulse 2s infinite; }
.status-indicator.offline { color: #b2bec3; background: #f8f9fa; }
.status-indicator.offline .status-dot-sm { background: #b2bec3; }

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.6; }
}

.action-btns { display: flex; gap: 6px; }

.empty-state {
  text-align: center;
  padding: 48px !important;
  color: #b2bec3;
  font-size: 14px;
}

.empty-icon { font-size: 40px; margin-bottom: 12px; }

.row-anim { animation: row-in 0.3s ease backwards; }
@keyframes row-in { from { opacity: 0; } to { opacity: 1; } }

/* 模态框 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 52, 54, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlay-in 0.2s ease;
}

@keyframes overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background: white;
  border-radius: 20px;
  width: 440px;
  max-width: calc(100vw - 40px);
  box-shadow: 0 20px 60px rgba(45, 52, 54, 0.2);
  animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h4 { font-size: 16px; font-weight: 800; color: #2d3436; }

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover { background: #fff0f6; }
.modal-close svg { width: 16px; height: 16px; stroke: #636e72; }

.modal-body { padding: 24px; }

.form-group { margin-bottom: 16px; }

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #b2bec3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
