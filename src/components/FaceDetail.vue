<template>
  <el-dialog
    v-model="visible"
    title="人脸详情"
    width="600px"
    @close="handleClose"
  >
    <div v-if="faceData" class="face-detail">
      <div class="face-info">
        <div class="face-basic">
          <div class="face-id">
            <span class="label">人脸ID:</span>
            <span class="value">{{ faceData.id }}</span>
          </div>
          <div class="face-time">
            <span class="label">检测时间:</span>
            <span class="value">{{ formatTime(faceData.timestamp) }}</span>
          </div>
        </div>
        
        <div class="emotion-info">
          <h5>情绪分析</h5>
          <div class="emotion-tags">
            <span 
              v-for="(value, key) in faceData.expressions" 
              :key="key"
              class="emotion-tag"
              :class="key"
            >
              {{ getEmotionName(key) }}: {{ (value * 100).toFixed(1) }}%
            </span>
          </div>
        </div>
        
        <div class="emotion-model">
          <h5>情感模型</h5>
          <div class="model-tabs">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="环形情感模型" name="circumplex">
                <div class="model-chart">
                  <canvas ref="circumplexChart"></canvas>
                </div>
                <div class="model-values">
                  <div class="value-item">
                    <span class="label">效价:</span>
                    <span class="value">{{ faceData.valence?.toFixed(2) || 'N/A' }}</span>
                  </div>
                  <div class="value-item">
                    <span class="label">唤醒度:</span>
                    <span class="value">{{ faceData.arousal?.toFixed(2) || 'N/A' }}</span>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="三维情感模型" name="3d">
                <div class="model-chart">
                  <canvas ref="dimension3dChart"></canvas>
                </div>
                <div class="model-values">
                  <div class="value-item">
                    <span class="label">愉悦度:</span>
                    <span class="value">{{ faceData.pleasure?.toFixed(2) || 'N/A' }}</span>
                  </div>
                  <div class="value-item">
                    <span class="label">强度:</span>
                    <span class="value">{{ faceData.intensity?.toFixed(2) || 'N/A' }}</span>
                  </div>
                  <div class="value-item">
                    <span class="label">关注度:</span>
                    <span class="value">{{ faceData.attention?.toFixed(2) || 'N/A' }}</span>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
        
        <div class="emotion-trend">
          <h5>情绪变化趋势</h5>
          <div class="trend-chart">
            <canvas ref="trendChart"></canvas>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="loading">
      <el-loading type="spinner" text="加载中..."></el-loading>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  faceData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'close']);

const activeTab = ref('circumplex');
const circumplexChart = ref(null);
const dimension3dChart = ref(null);
const trendChart = ref(null);
let circumplexChartInstance = null;
let dimension3dChartInstance = null;
let trendChartInstance = null;

// 处理关闭
const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 获取情绪名称
const getEmotionName = (emotion) => {
  const emotionMap = {
    neutral: '中性',
    happy: '开心',
    sad: '悲伤',
    angry: '愤怒',
    fearful: '恐惧',
    disgusted: '厌恶',
    surprised: '惊讶'
  };
  return emotionMap[emotion] || emotion;
};

// 初始化环形情感模型图表
const initCircumplexChart = () => {
  if (circumplexChart.value && props.faceData) {
    circumplexChartInstance = echarts.init(circumplexChart.value);
    updateCircumplexChart();
  }
};

// 更新环形情感模型图表
const updateCircumplexChart = () => {
  if (!circumplexChartInstance || !props.faceData) return;
  
  const { valence = 0, arousal = 0 } = props.faceData;
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: [
        { name: '积极', max: 1 },
        { name: '兴奋', max: 1 },
        { name: '消极', max: 1 },
        { name: '平静', max: 1 }
      ],
      radius: '70%'
    },
    series: [
      {
        name: '情感状态',
        type: 'radar',
        data: [
          {
            value: [
              Math.max(0, valence),
              Math.max(0, arousal),
              Math.max(0, -valence),
              Math.max(0, -arousal)
            ],
            name: '当前状态'
          }
        ]
      }
    ]
  };
  
  circumplexChartInstance.setOption(option);
};

// 初始化三维情感模型图表
const initDimension3dChart = () => {
  if (dimension3dChart.value && props.faceData) {
    dimension3dChartInstance = echarts.init(dimension3dChart.value);
    updateDimension3dChart();
  }
};

// 更新三维情感模型图表
const updateDimension3dChart = () => {
  if (!dimension3dChartInstance || !props.faceData) return;
  
  const { pleasure = 0, intensity = 0, attention = 0 } = props.faceData;
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: [
        { name: '愉悦度', max: 1 },
        { name: '强度', max: 1 },
        { name: '关注度', max: 1 }
      ],
      radius: '70%'
    },
    series: [
      {
        name: '情感状态',
        type: 'radar',
        data: [
          {
            value: [pleasure, intensity, attention],
            name: '当前状态'
          }
        ]
      }
    ]
  };
  
  dimension3dChartInstance.setOption(option);
};

// 初始化情绪趋势图表
const initTrendChart = () => {
  if (trendChart.value && props.faceData) {
    trendChartInstance = echarts.init(trendChart.value);
    updateTrendChart();
  }
};

// 更新情绪趋势图表
const updateTrendChart = () => {
  if (!trendChartInstance || !props.faceData) return;
  
  // 模拟趋势数据
  const times = [];
  const values = [];
  
  for (let i = 9; i >= 0; i--) {
    const time = new Date(Date.now() - i * 60000);
    times.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    values.push(Math.random() * 100);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: times
    },
    yAxis: {
      type: 'value',
      name: '情绪强度',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '情绪强度',
        type: 'line',
        data: values,
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  };
  
  trendChartInstance.setOption(option);
};

// 初始化所有图表
const initCharts = () => {
  initCircumplexChart();
  initDimension3dChart();
  initTrendChart();
};

// 更新所有图表
const updateCharts = () => {
  updateCircumplexChart();
  updateDimension3dChart();
  updateTrendChart();
};

// 响应式调整
const handleResize = () => {
  if (circumplexChartInstance) circumplexChartInstance.resize();
  if (dimension3dChartInstance) dimension3dChartInstance.resize();
  if (trendChartInstance) trendChartInstance.resize();
};

// 监听faceData变化
watch(() => props.faceData, () => {
  updateCharts();
}, { deep: true });

// 监听visible变化
watch(() => props.visible, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      initCharts();
    }, 100);
  }
});

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (circumplexChartInstance) circumplexChartInstance.dispose();
  if (dimension3dChartInstance) dimension3dChartInstance.dispose();
  if (trendChartInstance) trendChartInstance.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.face-detail {
  padding: 10px 0;
}

.face-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.face-basic {
  display: flex;
  gap: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.face-id,
.face-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.value {
  font-size: 14px;
  color: #303133;
}

.emotion-info h5,
.emotion-model h5,
.emotion-trend h5 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emotion-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.emotion-tag.neutral { background: #909399; color: white; }
.emotion-tag.happy { background: #67c23a; color: white; }
.emotion-tag.sad { background: #409eff; color: white; }
.emotion-tag.angry { background: #f56c6c; color: white; }
.emotion-tag.fearful { background: #e6a23c; color: white; }
.emotion-tag.disgusted { background: #909399; color: white; }
.emotion-tag.surprised { background: #909399; color: white; }

.model-chart {
  height: 200px;
  margin-bottom: 15px;
}

.model-values {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.value-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-chart {
  height: 200px;
}

.loading {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .face-basic {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .model-values {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .model-chart,
  .trend-chart {
    height: 250px;
  }
}
</style>