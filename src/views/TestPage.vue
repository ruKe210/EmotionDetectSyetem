<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <div class="welcome-icon">🌸</div>
        <div>
          <div class="welcome-title">欢迎回来，管理员</div>
          <div class="welcome-sub">{{ todayStr }} · 今天也是美好的一天</div>
        </div>
      </div>
      <div class="welcome-right">
        <div class="quick-action" @click="$router.push('/realtime')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          开始检测
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div
        v-for="(stat, i) in stats"
        :key="stat.key"
        class="stat-card"
        :style="{ animationDelay: i * 0.08 + 's' }"
      >
        <div class="stat-icon-wrap" :style="{ background: stat.gradient }">
          <div class="stat-icon" v-html="stat.icon"></div>
        </div>
        <div class="stat-info">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value" :class="stat.valueClass">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trendType">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline :points="stat.trendType === 'up' ? '23 6 13.5 15.5 8.5 10.5 1 18' : '1 6 10.5 15.5 15.5 10.5 23 18'"/>
            </svg>
            {{ stat.trend }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="dashboard-grid">
      <!-- 实时监控 -->
      <div class="card monitor-card">
        <div class="card-header">
          <h4>
            <span class="header-dot" style="background: var(--green)"></span>
            实时监控
          </h4>
          <div class="live-badge">
            <span class="live-dot"></span>
            LIVE
          </div>
        </div>
        <div class="card-body">
          <div class="camera-grid">
            <div class="camera-item" v-for="cam in cameras" :key="cam.id">
              <div class="camera-feed" :class="{ offline: cam.status === 'offline' }">
                <div class="camera-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M23 7l-7 5 7 5V7z"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                  <span>{{ cam.status === 'online' ? '实时画面' : '设备离线' }}</span>
                </div>
                <div class="camera-info-overlay">
                  <span class="camera-name">{{ cam.name }}</span>
                  <span class="camera-emotion" :class="cam.emotionClass">{{ cam.emotion }}</span>
                </div>
                <div class="camera-status-dot" :class="cam.status"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 情绪分布 -->
      <div class="card emotion-card">
        <div class="card-header">
          <h4>
            <span class="header-dot" style="background: var(--lavender)"></span>
            今日情绪分布
          </h4>
          <span class="card-date">今天</span>
        </div>
        <div class="card-body">
          <div class="emotion-bars">
            <div
              v-for="em in emotions"
              :key="em.name"
              class="emotion-bar-item"
            >
              <div class="emotion-bar-header">
                <span class="emotion-name">{{ em.emoji }} {{ em.name }}</span>
                <span class="emotion-pct">{{ em.pct }}%</span>
              </div>
              <div class="emotion-bar-track">
                <div
                  class="emotion-bar-fill"
                  :style="{ width: em.pct + '%', background: em.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近告警 -->
      <div class="card alerts-card">
        <div class="card-header">
          <h4>
            <span class="header-dot" style="background: var(--pink)"></span>
            最近告警
          </h4>
          <a class="view-all" @click="$router.push('/alerts')">查看全部 →</a>
        </div>
        <div class="card-body">
          <div class="alert-list">
            <div
              v-for="alert in recentAlerts"
              :key="alert.id"
              class="alert-item"
              :class="alert.level"
            >
              <div class="alert-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-time">{{ alert.time }} · {{ alert.device }}</div>
              </div>
              <span class="badge" :class="alert.badgeClass">{{ alert.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 识别趋势 -->
      <div class="card trend-card">
        <div class="card-header">
          <h4>
            <span class="header-dot" style="background: var(--mint)"></span>
            今日识别趋势
          </h4>
        </div>
        <div class="card-body">
          <div class="mini-chart">
            <div
              v-for="(bar, i) in trendData"
              :key="i"
              class="mini-bar"
              :style="{ height: bar.height + '%' }"
              :title="bar.label + ': ' + bar.value"
            >
              <div class="mini-bar-fill" :style="{ background: bar.color }"></div>
              <span class="mini-bar-label">{{ bar.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const today = new Date();
const todayStr = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日 ${days[today.getDay()]}`;
});

const stats = ref([
  {
    key: 'devices',
    label: '在线设备',
    value: '2 / 3',
    valueClass: 'value-primary',
    trend: '较昨日持平',
    trendType: 'neutral',
    gradient: 'linear-gradient(135deg, #6c8ef0, #a29bfe)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>`
  },
  {
    key: 'recognition',
    label: '今日识别',
    value: '1,248',
    valueClass: 'value-mint',
    trend: '↑ 12% 较昨日',
    trendType: 'up',
    gradient: 'linear-gradient(135deg, #00cec9, #00b894)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>`
  },
  {
    key: 'alerts',
    label: '今日告警',
    value: '3',
    valueClass: 'value-pink',
    trend: '↓ 2 较昨日',
    trendType: 'down',
    gradient: 'linear-gradient(135deg, #fd79a8, #e84393)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>`
  },
  {
    key: 'accuracy',
    label: '识别准确率',
    value: '94.6%',
    valueClass: 'value-yellow',
    trend: '↑ 0.8% 较上周',
    trendType: 'up',
    gradient: 'linear-gradient(135deg, #fdcb6e, #e17055)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`
  }
]);

const cameras = ref([
  { id: 1, name: '摄像头 1', status: 'online', emotion: '😊 快乐', emotionClass: 'happy' },
  { id: 2, name: '摄像头 2', status: 'online', emotion: '😐 中性', emotionClass: 'neutral' },
  { id: 3, name: '摄像头 3', status: 'offline', emotion: '离线', emotionClass: '' },
]);

const emotions = ref([
  { name: '快乐', emoji: '😊', pct: 42, color: 'linear-gradient(90deg, #fdcb6e, #e17055)' },
  { name: '中性', emoji: '😐', pct: 28, color: 'linear-gradient(90deg, #74b9ff, #6c8ef0)' },
  { name: '悲伤', emoji: '😢', pct: 12, color: 'linear-gradient(90deg, #a29bfe, #6c8ef0)' },
  { name: '愤怒', emoji: '😠', pct: 8, color: 'linear-gradient(90deg, #fd79a8, #e84393)' },
  { name: '惊讶', emoji: '😲', pct: 6, color: 'linear-gradient(90deg, #00cec9, #00b894)' },
  { name: '恐惧', emoji: '😨', pct: 4, color: 'linear-gradient(90deg, #b2bec3, #636e72)' },
]);

const recentAlerts = ref([
  { id: 1, title: '检测到异常情绪：愤怒', device: '摄像头1', time: '14:30', level: 'high', status: '未处理', badgeClass: 'badge-danger' },
  { id: 2, title: '检测到持续负面情绪', device: '摄像头2', time: '13:45', level: 'mid', status: '处理中', badgeClass: 'badge-warning' },
  { id: 3, title: '识别置信度偏低', device: '摄像头1', time: '12:20', level: 'low', status: '已处理', badgeClass: 'badge-success' },
]);

const trendData = ref([
  { label: '8时', value: 45, height: 30, color: 'linear-gradient(to top, #6c8ef0, #a29bfe)' },
  { label: '9时', value: 80, height: 53, color: 'linear-gradient(to top, #6c8ef0, #a29bfe)' },
  { label: '10时', value: 120, height: 80, color: 'linear-gradient(to top, #00cec9, #00b894)' },
  { label: '11时', value: 150, height: 100, color: 'linear-gradient(to top, #00cec9, #00b894)' },
  { label: '12时', value: 90, height: 60, color: 'linear-gradient(to top, #fdcb6e, #e17055)' },
  { label: '13时', value: 110, height: 73, color: 'linear-gradient(to top, #6c8ef0, #a29bfe)' },
  { label: '14时', value: 135, height: 90, color: 'linear-gradient(to top, #00cec9, #00b894)' },
]);
</script>

<style scoped>
.dashboard {
  animation: fade-up 0.4s ease;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #6c8ef0 0%, #a29bfe 50%, #fd79a8 100%);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 8px 30px rgba(108, 142, 240, 0.3);
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-icon {
  font-size: 36px;
  animation: wave 2s infinite;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-5deg); }
}

.welcome-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.welcome-sub {
  font-size: 13px;
  opacity: 0.85;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.quick-action:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.quick-action svg {
  width: 18px;
  height: 18px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 20px rgba(108, 142, 240, 0.07);
  border: 1px solid rgba(108, 142, 240, 0.06);
  animation: card-in 0.5s ease backwards;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(108, 142, 240, 0.15);
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.stat-info { flex: 1; }

.stat-label {
  font-size: 12px;
  color: #b2bec3;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.value-primary { color: var(--primary); }
.value-mint { color: var(--mint); }
.value-pink { color: var(--pink); }
.value-yellow { color: #e17055; }

.stat-trend {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.stat-trend.up { color: var(--green); }
.stat-trend.down { color: var(--pink); }
.stat-trend.neutral { color: #b2bec3; }

.stat-trend svg {
  width: 12px;
  height: 12px;
}

/* 主内容网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
}

@media (max-width: 1100px) {
  .dashboard-grid { grid-template-columns: 1fr; }
}

/* 监控卡片 */
.monitor-card {
  grid-column: 1;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff0f6;
  color: var(--pink);
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 1px;
}

.live-dot {
  width: 6px;
  height: 6px;
  background: var(--pink);
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.camera-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.camera-feed {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f4ff, #e8f0fe);
  aspect-ratio: 16/10;
  border: 1.5px solid #eef1ff;
  transition: all 0.3s ease;
}

.camera-feed:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(108, 142, 240, 0.15);
}

.camera-feed.offline {
  background: linear-gradient(135deg, #f8f9fa, #f0f0f0);
  border-color: #e0e0e0;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #b2bec3;
}

.camera-placeholder svg {
  width: 28px;
  height: 28px;
}

.camera-placeholder span {
  font-size: 11px;
}

.camera-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(45, 52, 54, 0.7));
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.camera-name {
  font-size: 11px;
  color: white;
  font-weight: 600;
}

.camera-emotion {
  font-size: 11px;
  color: white;
  font-weight: 700;
}

.camera-status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid white;
}

.camera-status-dot.online {
  background: var(--green);
}

.camera-status-dot.offline {
  background: #b2bec3;
}

/* 情绪分布 */
.emotion-card {
  grid-column: 2;
}

.card-date {
  font-size: 12px;
  color: #b2bec3;
  background: #f8f9fa;
  padding: 3px 10px;
  border-radius: 20px;
}

.emotion-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.emotion-bar-item {}

.emotion-bar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.emotion-name {
  font-size: 13px;
  color: #636e72;
  font-weight: 600;
}

.emotion-pct {
  font-size: 13px;
  color: #2d3436;
  font-weight: 700;
}

.emotion-bar-track {
  height: 8px;
  background: #f0f4ff;
  border-radius: 10px;
  overflow: hidden;
}

.emotion-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  animation: bar-grow 1s ease backwards;
}

@keyframes bar-grow {
  from { width: 0 !important; }
}

.header-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 告警列表 */
.alerts-card {
  grid-column: 1;
}

.view-all {
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
}

.view-all:hover {
  text-decoration: underline;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 1.5px solid;
  transition: all 0.2s ease;
}

.alert-item:hover {
  transform: translateX(2px);
}

.alert-item.high {
  border-color: #ffe0ec;
  background: #fff8fb;
}

.alert-item.mid {
  border-color: #fff3dd;
  background: #fffcf5;
}

.alert-item.low {
  border-color: #e0f5ee;
  background: #f5fffa;
}

.alert-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff0f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon-wrap svg {
  width: 18px;
  height: 18px;
  stroke: var(--pink);
}

.alert-item.mid .alert-icon-wrap {
  background: #fff8ed;
}

.alert-item.mid .alert-icon-wrap svg {
  stroke: var(--yellow);
}

.alert-item.low .alert-icon-wrap {
  background: var(--green-light);
}

.alert-item.low .alert-icon-wrap svg {
  stroke: var(--green);
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 13px;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 2px;
}

.alert-time {
  font-size: 11px;
  color: #b2bec3;
}

/* 趋势迷你图 */
.trend-card {
  grid-column: 2;
}

.mini-chart {
  height: 140px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.mini-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.mini-bar-fill {
  width: 100%;
  flex: 1;
  border-radius: 6px 6px 0 0;
  transition: height 0.5s ease;
  animation: bar-rise 0.8s ease backwards;
}

@keyframes bar-rise {
  from { transform: scaleY(0); transform-origin: bottom; }
  to { transform: scaleY(1); }
}

.mini-bar-label {
  font-size: 10px;
  color: #b2bec3;
  white-space: nowrap;
}
</style>
