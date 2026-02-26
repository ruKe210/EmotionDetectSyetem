<template>
  <div class="users-page">
    <div class="card">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h4>用户管理</h4>
          <button class="btn btn-primary">
            <i class="fa fa-plus"></i> 添加用户
          </button>
        </div>
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>姓名</th>
              <th>角色</th>
              <th>邮箱</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>admin</td>
              <td>系统管理员</td>
              <td>管理员</td>
              <td>admin@example.com</td>
              <td><span class="badge badge-success">激活</span></td>
              <td>
                <button class="btn btn-primary btn-sm mr-2">
                  <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="btn btn-danger btn-sm mr-2">
                  <i class="fa fa-trash"></i> 删除
                </button>
                <button class="btn btn-warning btn-sm">
                  <i class="fa fa-lock"></i> 禁用
                </button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>operator</td>
              <td>操作员</td>
              <td>操作员</td>
              <td>operator@example.com</td>
              <td><span class="badge badge-success">激活</span></td>
              <td>
                <button class="btn btn-primary btn-sm mr-2">
                  <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="btn btn-danger btn-sm mr-2">
                  <i class="fa fa-trash"></i> 删除
                </button>
                <button class="btn btn-warning btn-sm">
                  <i class="fa fa-lock"></i> 禁用
                </button>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>viewer</td>
              <td>查看员</td>
              <td>查看员</td>
              <td>viewer@example.com</td>
              <td><span class="badge badge-success">激活</span></td>
              <td>
                <button class="btn btn-primary btn-sm mr-2">
                  <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="btn btn-danger btn-sm mr-2">
                  <i class="fa fa-trash"></i> 删除
                </button>
                <button class="btn btn-warning btn-sm">
                  <i class="fa fa-lock"></i> 禁用
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
// 用户管理页面
</script>

<style scoped>
.users-page {
  padding: 0;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.mr-2 {
  margin-right: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.table th {
  background-color: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.table tr:hover {
  background-color: #f7fafc;
}
</style>