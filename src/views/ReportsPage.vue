<template>
  <div class="reports-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon" style="background: linear-gradient(135deg, #fdcb6e, #e17055)">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <div>
          <div class="page-title">统计报表</div>
          <div class="page-sub">情绪识别数据分析与统计</div>
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" @click="exportPDF">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          导出PDF
        </button>
        <button class="btn btn-primary" @click="generateReport">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          生成报表
        </button>
      </div>
    </div>

    <!-- 报表配置 -->
    <div class="card config-card">
      <div class="card-header">
        <h4>
          <span class="header-dot" style="background: var(--yellow)"></span>
          报表配置
        </h4>
      </div>
      <div class="card-body">
        <div class="config-grid">
          <div class="config-item">
            <label>报表类型</label>
            <div class="type-selector">
              <button
                v-for="t in reportTypes"
                :key="t.value"
                class="type-btn"
                :class="{ active: reportType === t.value }"
                @click="reportType = t.value"
              >{{ t.label }}</button>
            </div>
          </div>
          <div class="config-item">
            <label>开始日期</label>
            <input type="date" class="form-control" v-model="startDate" />
          </div>
          <div class="config-item">
            <label>结束日期</label>
            <input type="date" class="form-control" v-model="endDate" />
          </div>
          <div class="config-item">
            <label>设备选择</label>
            <select class="form-control" v-model="selectedDevice">
              <option value="">所有设备</option>
              <option value="cam1">摄像头 1</option>
              <option value="cam2">摄像头 2</option>
              <option value="cam3">摄像头 3</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据摘要 -->
    <div class="summary-grid">
      <div class="summary-card" v-for="s in summaryData" :key="s.key" :class="s.cls">
        <div class="sc-icon-wrap">
          <div class="sc-icon" v-html="s.icon"></div>
        </div>
        <div class="sc-content">
          <div class="sc-value">{{ s.value }}</div>
          <div class="sc-label">{{ s.label }}</div>
          <div class="sc-change" :class="s.changeType">{{ s.change }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 情绪占比 -->
      <div class="card chart-card">
        <div class="card-header">
          <h4>
            <span class="header-dot" style="background: var(--primary)"></span>
            情绪占比分布
          </h4>
          <span class="period-tag">{{ reportType === 'daily' ? '今天' : reportType === 'weekly' ? '本周' : '本月' }}</span>
        </div>
        <div class="card-body">
          <div class="donut-chart-wrap">
            <div class="donut-chart">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#f0f4ff" stroke-width="30"/>
                <circle
                  v-for="(seg, i) in donutSegments"
                  :key="i"
                  cx="100" cy="100" r="80"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="30"
                  :stroke-dasharray="seg.dash"
                  :stroke-dashoffset="seg.offset"
                  stroke-linecap="round"
                  style="transition: stroke-dasharray 1s ease;"
                />
              </svg>
              <div class="donut-center">
                <div class="donut-total">1,248</div>
                <div class="donut-sub">次识别</div>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-item" v-for="em in emotionData" :key="em.name">
                <span class="legend-dot" :style="{ background: em.color }"></span>
                <span class="legend-name">{{ em.emoji }} {{ em.name }}</span>
                <span class="legend-pct">{{ em.pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时段分布 -->
      <div class="card chart-card">
        <div class="card-header">
          <h4>
            <span class="header-dot" style="background: var(--mint)"></span>
            时段识别频次
          </h4>
        </div>
        <div class="card-body">
          <div class="bar-chart">
            <div class="bar-chart-inner">
              <div
                v-for="bar in hourlyData"
                :key="bar.hour"
                class="bar-col"
              >
                <div class="bar-value">{{ bar.value }}</div>
                <div class="bar-fill-wrap">
                  <div
                    class="bar-fill"
                    :style="{ height: (bar.value / maxHourly * 100) + '%', background: bar.color }"
                  ></div>
                </div>
                <div class="bar-label">{{ bar.hour }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 趋势折线 -->
      <div class="card chart-card wide">
        <div class="card-header">
          <h4>
            <span class="header-dot" style="background: var(--lavender)"></span>
            近7日识别趋势
          </h4>
          <div class="legend-tabs">
            <span class="legend-chip" style="background: var(--primary-light); color: var(--primary)">
              <span class="legend-dot" style="background: var(--primary)"></span>总识别
            </span>
            <span class="legend-chip" style="background: var(--pink-light); color: var(--pink)">
              <span class="legend-dot" style="background: var(--pink)"></span>异常情绪
            </span>
          </div>
        </div>
        <div class="card-body">
          <div class="line-chart">
            <svg viewBox="0 0 600 200" preserveAspectRatio="none" class="line-svg">
              <!-- 网格线 -->
              <line v-for="y in [50, 100, 150]" :key="y" x1="0" :y1="y" x2="600" :y2="y" stroke="#f0f4ff" stroke-width="1"/>
              <!-- 面积 -->
              <path :d="areaPath" fill="url(#areaGrad)" opacity="0.3"/>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#6c8ef0" stop-opacity="0.5"/>
                  <stop offset="100%" stop-color="#6c8ef0" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- 折线 -->
              <polyline :points="linePoints" fill="none" stroke="#6c8ef0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- 告警线 -->
              <polyline :points="alertPoints" fill="none" stroke="#fd79a8" stroke-width="2" stroke-dasharray="5,3" stroke-linecap="round"/>
              <!-- 数据点 -->
              <circle v-for="(pt, i) in linePointsArr" :key="i" :cx="pt.x" :cy="pt.y" r="4" fill="white" stroke="#6c8ef0" stroke-width="2"/>
            </svg>
            <!-- X轴标签 -->
            <div class="x-axis">
              <span v-for="d in weekDays" :key="d">{{ d }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const reportType = ref('daily');
const startDate = ref('2026-02-20');
const endDate = ref('2026-02-26');
const selectedDevice = ref('');

const reportTypes = [
  { label: '日报表', value: 'daily' },
  { label: '周报表', value: 'weekly' },
  { label: '月报表', value: 'monthly' },
  { label: '年报表', value: 'yearly' },
];

const summaryData = ref([
  { key: 'total', label: '总识别次数', value: '1,248', change: '↑ 12.4%', changeType: 'up', cls: 'primary', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>` },
  { key: 'accuracy', label: '平均准确率', value: '94.6%', change: '↑ 0.8%', changeType: 'up', cls: 'mint', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  { key: 'alerts', label: '告警次数', value: '3', change: '↓ 40%', changeType: 'down', cls: 'pink', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>` },
  { key: 'dominant', label: '主导情绪', value: '😊 快乐', change: '42% 占比', changeType: 'neutral', cls: 'yellow', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` },
]);

const emotionData = [
  { name: '快乐', emoji: '😊', pct: 42, color: '#fdcb6e' },
  { name: '中性', emoji: '😐', pct: 28, color: '#74b9ff' },
  { name: '悲伤', emoji: '😢', pct: 12, color: '#a29bfe' },
  { name: '愤怒', emoji: '😠', pct: 8, color: '#fd79a8' },
  { name: '惊讶', emoji: '😲', pct: 6, color: '#00cec9' },
  { name: '恐惧', emoji: '😨', pct: 4, color: '#b2bec3' },
];

// 甜甜圈图数据
const circumference = 2 * Math.PI * 80;
const donutSegments = computed(() => {
  let offset = 0;
  return emotionData.map(em => {
    const dashLength = (em.pct / 100) * circumference;
    const seg = {
      color: em.color,
      dash: `${dashLength - 4} ${circumference - dashLength + 4}`,
      offset: -(offset - circumference / 4)
    };
    offset += dashLength;
    return seg;
  });
});

const hourlyData = [
  { hour: '8时', value: 45, color: 'linear-gradient(to top, #6c8ef0, #a29bfe)' },
  { hour: '9时', value: 80, color: 'linear-gradient(to top, #6c8ef0, #a29bfe)' },
  { hour: '10时', value: 120, color: 'linear-gradient(to top, #00cec9, #6c8ef0)' },
  { hour: '11时', value: 150, color: 'linear-gradient(to top, #00cec9, #6c8ef0)' },
  { hour: '12时', value: 90, color: 'linear-gradient(to top, #fdcb6e, #e17055)' },
  { hour: '13时', value: 110, color: 'linear-gradient(to top, #6c8ef0, #a29bfe)' },
  { hour: '14时', value: 135, color: 'linear-gradient(to top, #00cec9, #6c8ef0)' },
  { hour: '15时', value: 160, color: 'linear-gradient(to top, #00cec9, #6c8ef0)' },
];

const maxHourly = computed(() => Math.max(...hourlyData.map(d => d.value)));

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const weekData = [850, 920, 780, 1100, 1248, 960, 1050];
const alertDataWeek = [5, 3, 8, 2, 3, 4, 2];

const linePointsArr = computed(() => {
  return weekData.map((v, i) => ({
    x: i * (600 / 6) + 50,
    y: 180 - (v / 1300 * 160)
  }));
});

const linePoints = computed(() =>
  linePointsArr.value.map(p => `${p.x},${p.y}`).join(' ')
);

const areaPath = computed(() => {
  const pts = linePointsArr.value;
  const start = `M${pts[0].x},180`;
  const line = pts.map(p => `L${p.x},${p.y}`).join(' ');
  const end = `L${pts[pts.length - 1].x},180 Z`;
  return `${start} ${line} ${end}`;
});

const alertPoints = computed(() => {
  return alertDataWeek.map((v, i) => {
    const x = i * (600 / 6) + 50;
    const y = 180 - (v / 10 * 80);
    return `${x},${y}`;
  }).join(' ');
});

const generateReport = () => console.log('generate');
const exportPDF = () => console.log('export pdf');
</script>

<style scoped>
.reports-page { animation: fade-up 0.3s ease; }

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
  box-shadow: 0 4px 12px rgba(253, 203, 110, 0.4);
}

.page-icon svg { width: 24px; height: 24px; }
.page-title { font-size: 20px; font-weight: 800; color: #2d3436; }
.page-sub { font-size: 13px; color: #b2bec3; margin-top: 2px; }
.page-actions { display: flex; gap: 10px; }

/* 配置卡片 */
.config-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  align-items: end;
}

@media (max-width: 1100px) {
  .config-grid { grid-template-columns: repeat(2, 1fr); }
}

.config-item { display: flex; flex-direction: column; gap: 8px; }

.config-item label {
  font-size: 12px;
  font-weight: 700;
  color: #b2bec3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-selector { display: flex; gap: 4px; }

.type-btn {
  padding: 7px 14px;
  border: 1.5px solid #eef1ff;
  border-radius: 8px;
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: #b2bec3;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn.active {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
  border-color: transparent;
  color: white;
}

.type-btn:hover:not(.active) { border-color: var(--primary); color: var(--primary); }

/* 数据摘要 */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

@media (max-width: 1100px) {
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}

.summary-card {
  background: white;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1.5px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(108, 142, 240, 0.06);
}

.summary-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(108, 142, 240, 0.12); }

.sc-icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sc-icon :deep(svg) { width: 22px; height: 22px; }

.summary-card.primary .sc-icon-wrap { background: var(--primary-light); }
.summary-card.primary .sc-icon :deep(svg) { stroke: var(--primary); }
.summary-card.mint .sc-icon-wrap { background: var(--mint-light); }
.summary-card.mint .sc-icon :deep(svg) { stroke: var(--mint); }
.summary-card.pink .sc-icon-wrap { background: var(--pink-light); }
.summary-card.pink .sc-icon :deep(svg) { stroke: var(--pink); }
.summary-card.yellow .sc-icon-wrap { background: var(--yellow-light); }
.summary-card.yellow .sc-icon :deep(svg) { stroke: #e17055; }

.sc-value { font-size: 22px; font-weight: 800; color: #2d3436; }
.sc-label { font-size: 12px; color: #b2bec3; font-weight: 600; margin-top: 2px; }
.sc-change { font-size: 11px; font-weight: 700; margin-top: 3px; }
.sc-change.up { color: var(--green); }
.sc-change.down { color: var(--pink); }
.sc-change.neutral { color: #b2bec3; }

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card.wide { grid-column: 1 / -1; }

@media (max-width: 1100px) {
  .charts-grid { grid-template-columns: 1fr; }
  .chart-card.wide { grid-column: 1; }
}

.header-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.period-tag {
  background: #f8f9fa;
  color: #b2bec3;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
}

/* 甜甜圈图 */
.donut-chart-wrap {
  display: flex;
  align-items: center;
  gap: 24px;
}

.donut-chart {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.donut-chart svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total { font-size: 22px; font-weight: 800; color: #2d3436; }
.donut-sub { font-size: 11px; color: #b2bec3; }

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name { flex: 1; color: #636e72; }
.legend-pct { font-weight: 700; color: #2d3436; }

/* 柱状图 */
.bar-chart {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.bar-chart-inner {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.bar-value { font-size: 10px; font-weight: 700; color: #636e72; flex-shrink: 0; }

.bar-fill-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  border-radius: 6px 6px 0 0;
  animation: bar-rise 0.8s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

@keyframes bar-rise {
  from { transform: scaleY(0); transform-origin: bottom; }
  to { transform: scaleY(1); }
}

.bar-label { font-size: 10px; color: #b2bec3; white-space: nowrap; flex-shrink: 0; }

/* 折线图 */
.line-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.line-svg {
  width: 100%;
  height: 200px;
}

.x-axis {
  display: flex;
  justify-content: space-around;
  padding: 0 50px;
}

.x-axis span {
  font-size: 12px;
  color: #b2bec3;
  text-align: center;
}

.legend-tabs { display: flex; gap: 8px; }

.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}
</style>
