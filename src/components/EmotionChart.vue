<template>
  <div class="emotion-chart">
    <div class="chart-header">
      <h5>{{ title }}</h5>
      <el-select v-model="chartType" size="small" @change="updateChart">
        <el-option label="饼图" value="pie"></el-option>
        <el-option label="柱状图" value="bar"></el-option>
        <el-option label="折线图" value="line"></el-option>
      </el-select>
    </div>
    <div class="chart-container">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  title: {
    type: String,
    default: '情绪分析'
  },
  data: {
    type: Object,
    default: () => ({
      happy: 0,
      sad: 0,
      angry: 0,
      neutral: 0,
      fearful: 0,
      surprised: 0,
      disgusted: 0
    })
  },
  trendData: {
    type: Object,
    default: () => ({
      times: [],
      values: []
    })
  }
});

const chartRef = ref(null);
const chartType = ref('pie');
let chartInstance = null;

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};

// 更新图表
const updateChart = () => {
  if (!chartInstance) return;
  
  let option = {};
  
  switch (chartType.value) {
    case 'pie':
      option = getPieOption();
      break;
    case 'bar':
      option = getBarOption();
      break;
    case 'line':
      option = getLineOption();
      break;
    default:
      option = getPieOption();
  }
  
  chartInstance.setOption(option);
};

// 获取饼图配置
const getPieOption = () => {
  const emotionData = Object.entries(props.data).map(([key, value]) => ({
    name: getEmotionName(key),
    value: value
  }));
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: emotionData.map(item => item.name)
    },
    series: [
      {
        name: '情绪分布',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: emotionData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
};

// 获取柱状图配置
const getBarOption = () => {
  const emotionNames = Object.keys(props.data).map(key => getEmotionName(key));
  const emotionValues = Object.values(props.data);
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: emotionNames,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '情绪数量',
        type: 'bar',
        data: emotionValues,
        itemStyle: {
          color: function(params) {
            const colors = ['#67c23a', '#409eff', '#f56c6c', '#909399', '#e6a23c', '#909399', '#909399'];
            return colors[params.dataIndex];
          }
        }
      }
    ]
  };
};

// 获取折线图配置
const getLineOption = () => {
  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: props.trendData.times || []
    },
    yAxis: {
      type: 'value',
      name: '情绪强度'
    },
    series: [
      {
        name: '情绪强度',
        type: 'line',
        data: props.trendData.values || [],
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  };
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

// 响应式调整
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 监听数据变化
watch(() => props.data, () => {
  updateChart();
}, { deep: true });

watch(() => props.trendData, () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.emotion-chart {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h5 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 300px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>