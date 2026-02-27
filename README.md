# 前端项目 README

## 项目概述

这是一个基于 Vue.js 的人脸和情绪识别前端系统，与后端服务配合使用，实现实时人脸检测、情绪识别和数据分析功能。

## 功能特性

### 🎯 核心功能
- **实时视频流**：通过 WebSocket 接收后端推送的视频流
- **人脸检测**：显示检测到的人脸位置
- **情绪识别**：识别并显示人脸的情绪状态
- **情绪分析**：实时统计和分析情绪数据
- **历史数据**：查看历史情绪数据和趋势
- **系统监控**：监控系统状态和性能

### 📊 数据可视化
- 情绪分布图表
- 实时统计数据
- 历史趋势分析
- 告警信息展示

## 技术栈

- **前端框架**：Vue.js 3
- **构建工具**：Vite
- **状态管理**：Vuex
- **路由**：Vue Router
- **图表库**：ECharts
- **WebSocket**：实时数据通信
- **CSS 预处理器**：SCSS

## 项目结构

```
src/
├── api/                 # API 调用模块
│   ├── common.js        # 通用 API
│   ├── face.js          # 人脸相关 API
│   └── request.js       # 请求封装
├── assets/              # 静态资源
│   └── css/             # 样式文件
├── components/          # 组件
│   ├── EmotionChart.vue  # 情绪图表
│   ├── FaceCanvas.vue    # 人脸画布
│   ├── FaceDetail.vue    # 人脸详情
│   ├── GlobalStats.vue   # 全局统计
│   └── VideoPlayer.vue   # 视频播放器
├── hooks/               # 自定义钩子
│   ├── useEcharts.js     # ECharts 钩子
│   ├── useFaceClick.js   # 人脸点击钩子
│   └── useWebSocket.js   # WebSocket 钩子
├── router/              # 路由
│   └── index.js         # 路由配置
├── store/               # 状态管理
│   ├── modules/         # 模块
│   └── index.js         # 状态配置
├── utils/               # 工具函数
│   ├── format.js        # 格式化工具
│   ├── storage.js       # 存储工具
│   └── validate.js      # 验证工具
├── views/               # 页面
│   ├── RealTimeRecog.vue # 实时识别
│   ├── HistoryData.vue   # 历史数据
│   ├── ReportsPage.vue   # 报告页面
│   ├── AlertsPage.vue    # 告警页面
│   ├── DevicePage.vue    # 设备管理
│   ├── SystemConfig.vue  # 系统配置
│   └── UsersPage.vue     # 用户管理
├── App.vue              # 应用入口
└── main.js              # 主文件
```

## 快速开始

### 1. 环境要求
- Node.js 16.0+
- npm 7.0+ 或 yarn 1.22+

### 2. 安装依赖

```bash
# 进入前端目录
cd f:\.bishe\test

# 安装依赖
npm install
# 或
yarn install
```

### 3. 配置后端地址

编辑 `src/api/request.js` 文件，修改后端服务地址：

```javascript
// 后端服务基础 URL
const BASE_URL = 'http://localhost:8000';
```

### 4. 启动开发服务器

```bash
# 启动开发服务器
npm run dev
# 或
yarn dev
```

### 5. 构建生产版本

```bash
# 构建生产版本
npm run build
# 或
yarn build
```

## 主要页面

### 实时识别页面 (`RealTimeRecog.vue`)
- 显示实时视频流
- 展示人脸检测结果
- 显示情绪识别结果
- 实时统计数据

### 历史数据页面 (`HistoryData.vue`)
- 查看历史情绪数据
- 按时间范围筛选
- 导出数据报告

### 报告页面 (`ReportsPage.vue`)
- 生成情绪分析报告
- 数据可视化图表
- 导出 PDF 报告

### 告警页面 (`AlertsPage.vue`)
- 显示系统告警信息
- 告警历史记录
- 告警设置

## WebSocket 连接

### 主要 WebSocket 端点
- `ws://localhost:8000/ws/face` - 人脸数据
- `ws://localhost:8000/ws/video` - 视频流
- `ws://localhost:8000/ws/stats` - 统计数据
- `ws://localhost:8000/ws/alerts` - 告警信息

### 心跳机制
前端实现了 30 秒一次的心跳机制，确保 WebSocket 连接稳定。

## API 接口

### 人脸相关接口
- `GET /api/face/stats` - 获取人脸统计数据
- `GET /api/face/history` - 获取历史人脸数据
- `GET /api/face/emotions` - 获取情绪分布

### 系统相关接口
- `GET /api/system/status` - 获取系统状态
- `GET /api/system/stats` - 获取系统统计
- `POST /api/system/config` - 更新系统配置

## 常见问题

### 1. 视频流连接失败
- 检查后端服务是否运行
- 确认 WebSocket 地址配置正确
- 检查网络连接

### 2. 人脸检测不准确
- 确保光线充足
- 调整摄像头位置
- 检查后端模型配置

### 3. 页面加载缓慢
- 清除浏览器缓存
- 检查网络速度
- 优化浏览器性能

## 调试指南

### 前端调试
- 打开浏览器开发者工具
- 查看控制台日志
- 检查网络请求
- 监控 WebSocket 连接状态

### 后端调试
- 查看后端服务日志
- 检查模型加载状态
- 监控推理性能

## 部署指南

### 开发环境
- 本地启动前后端服务
- 前端使用 `npm run dev`
- 后端使用 `python start.py`

### 生产环境
1. 构建前端生产版本：`npm run build`
2. 将构建产物部署到静态文件服务器
3. 配置 Nginx 反向代理
4. 启动后端服务

## 技术支持

### 联系信息
- 项目维护者：[Your Name]
- 邮箱：[your-email@example.com]
- 文档：[项目文档地址]

### 版本历史
- v1.0.0 - 初始版本
- v1.0.1 - 修复 WebSocket 连接问题
- v1.0.2 - 优化人脸检测性能

---

**注意**：本项目需要与后端服务配合使用，确保后端服务已正确部署和运行。