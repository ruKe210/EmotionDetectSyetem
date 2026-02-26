<template>
  <div class="real-time-recog">
    <div class="page-header">
      <h2>实时情绪识别</h2>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="startDetection"
          v-if="!isRunning"
        >
          <i class="el-icon-video-play"></i> 开始检测
        </el-button>
        <el-button
          type="danger"
          @click="stopDetection"
          v-else
        >
          <i class="el-icon-video-pause"></i> 停止检测
        </el-button>
        <el-select v-model="cameraId" class="ml-2" @change="changeCamera">
          <el-option
            v-for="camera in cameras"
            :key="camera.id"
            :label="camera.name"
            :value="camera.id"
          ></el-option>
        </el-select>
      </div>
    </div>

    <div class="content-grid">
      <div class="main-content">
        <div class="video-section">
          <div class="video-card">
            <div class="video-header">
              <h3>摄像头预览</h3>
              <span class="status-badge" :class="isRunning ? 'status-running' : 'status-stopped'">
                {{ isRunning ? '运行中' : '已停止' }}
              </span>
            </div>
            <div class="video-container">
              <FaceCanvas
                :camera-id="cameraId"
                :enable-detection="isRunning"
                @face-detected="handleFaceDetected"
                @detection-error="handleDetectionError"
              />
            </div>
          </div>

          <div class="emotion-trend">
            <div class="card-header">
              <h3>情绪变化趋势</h3>
            </div>
            <div class="chart-container">
              <EmotionChart
                title="情绪趋势"
                :data="emotionData"
                :trend-data="trendData"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <GlobalStats
          :stats="globalStats"
          @refresh="refreshStats"
        />

        <div class="face-list">
          <div class="card-header">
            <h3>当前检测人脸</h3>
            <span class="face-count">{{ currentFaces.length }} 人</span>
          </div>
          <div class="face-items">
            <div
              v-for="(face, index) in currentFaces"
              :key="index"
              class="face-item"
              @click="selectFace(face, index)"
            >
              <div class="face-info">
                <div class="face-id">人脸 {{ index + 1 }}</div>
                <div class="emotion-tag" :class="getEmotionClass(face)">
                  {{ getMainEmotion(face) }}
                </div>
              </div>
              <div class="confidence">{{ getConfidence(face) }}%</div>
            </div>
            <div v-if="currentFaces.length === 0" class="no-faces">
              未检测到人脸
            </div>
          </div>
        </div>

        <FaceDetail
          v-if="selectedFace"
          :visible="showFaceDetail"
          :face-data="selectedFace"
          @update:visible="showFaceDetail = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useFaceStore } from '../store/modules/faceStore';
import { useSystemStore } from '../store/modules/systemStore';
import FaceCanvas from '../components/FaceCanvas.vue';
import GlobalStats from '../components/GlobalStats.vue';
import FaceDetail from '../components/FaceDetail.vue';
import EmotionChart from '../components/EmotionChart.vue';

const faceStore = useFaceStore();
const systemStore = useSystemStore();

const isRunning = ref(false);
const cameraId = ref('');
const cameras = ref([]);
const currentFaces = ref([]);
const selectedFace = ref(null);
const showFaceDetail = ref(false);

const globalStats = computed(() => faceStore.globalStats);

const emotionData = reactive({
  happy: 0,
  sad: 0,
  angry: 0,
  neutral: 0,
  fearful: 0,
  surprised: 0,
  disgusted: 0
});

const trendData = reactive({
  times: [],
  values: []
});

// 开始检测
const startDetection = () => {
  isRunning.value = true;
  faceStore.startDetection();
};

// 停止检测
const stopDetection = () => {
  isRunning.value = false;
  faceStore.stopDetection();
};

// 切换摄像头
const changeCamera = (id) => {
  cameraId.value = id;
  faceStore.setCurrentCamera(id);
};

// 处理人脸检测结果
const handleFaceDetected = (faces) => {
  currentFaces.value = faces;
  faceStore.updateCurrentFaces(faces);
  
  // 更新情绪数据
  updateEmotionData(faces);
  updateTrendData();
};

// 处理检测错误
const handleDetectionError = (error) => {
  console.error('检测错误:', error);
  faceStore.setDetectionError(error);
};

// 更新情绪数据
const updateEmotionData = (faces) => {
  const distribution = {
    happy: 0,
    sad: 0,
    angry: 0,
    neutral: 0,
    fearful: 0,
    surprised: 0,
    disgusted: 0
  };
  
  faces.forEach(face => {
    if (face.expressions) {
      const maxExpression = Object.entries(face.expressions)
        .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: 'neutral', value: 0 });
      distribution[maxExpression.key]++;
    }
  });
  
  Object.assign(emotionData, distribution);
};

// 更新趋势数据
const updateTrendData = () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  trendData.times.push(timeStr);
  trendData.values.push(Math.random() * 100);
  
  // 保持数据长度在30个点
  if (trendData.times.length > 30) {
    trendData.times.shift();
    trendData.values.shift();
  }
};

// 选择人脸
const selectFace = (face, index) => {
  // 为face添加id和时间戳
  selectedFace.value = {
    id: `face-${index}-${Date.now()}`,
    timestamp: Date.now(),
    ...face,
    // 计算效价和唤醒度
    valence: calculateValence(face),
    arousal: calculateArousal(face),
    // 计算三维情感模型值
    pleasure: calculatePleasure(face),
    intensity: calculateIntensity(face),
    attention: calculateAttention(face)
  };
  showFaceDetail.value = true;
};

// 计算效价
const calculateValence = (face) => {
  if (!face.expressions) return 0;
  const { happy, sad, angry, fearful, disgusted, surprised, neutral } = face.expressions;
  return (happy + surprised * 0.5) - (sad + angry + fearful + disgusted);
};

// 计算唤醒度
const calculateArousal = (face) => {
  if (!face.expressions) return 0;
  const { happy, angry, fearful, surprised } = face.expressions;
  return happy + angry + fearful + surprised;
};

// 计算愉悦度
const calculatePleasure = (face) => {
  if (!face.expressions) return 0;
  const { happy, sad, angry, fearful, disgusted } = face.expressions;
  return happy - (sad + angry + fearful + disgusted);
};

// 计算强度
const calculateIntensity = (face) => {
  if (!face.expressions) return 0;
  const values = Object.values(face.expressions);
  return Math.max(...values);
};

// 计算关注度
const calculateAttention = (face) => {
  if (!face.expressions) return 0;
  const { surprised, fearful } = face.expressions;
  return surprised + fearful;
};

// 获取主要情绪
const getMainEmotion = (face) => {
  if (!face.expressions) return '未知';
  const maxExpression = Object.entries(face.expressions)
    .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: 'neutral', value: 0 });
  const emotionMap = {
    neutral: '中性',
    happy: '开心',
    sad: '悲伤',
    angry: '愤怒',
    fearful: '恐惧',
    disgusted: '厌恶',
    surprised: '惊讶'
  };
  return emotionMap[maxExpression.key] || maxExpression.key;
};

// 获取置信度
const getConfidence = (face) => {
  if (!face.expressions) return 0;
  const maxExpression = Object.entries(face.expressions)
    .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: 'neutral', value: 0 });
  return Math.round(maxExpression.value * 100);
};

// 获取情绪类名
const getEmotionClass = (face) => {
  if (!face.expressions) return 'neutral';
  const maxExpression = Object.entries(face.expressions)
    .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: 'neutral', value: 0 });
  return maxExpression.key;
};

// 刷新统计数据
const refreshStats = () => {
  // 模拟刷新统计数据
  faceStore.updateGlobalStats({
    onlineDevices: Math.floor(Math.random() * 10) + 1,
    todayRecognition: Math.floor(Math.random() * 1000) + 100,
    todayAlerts: Math.floor(Math.random() * 50),
    cpuUsage: Math.floor(Math.random() * 50) + 10,
    memoryUsage: Math.floor(Math.random() * 60) + 20,
    uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`
  });
};

// 模拟摄像头列表
const loadCameras = () => {
  cameras.value = [
    { id: 'camera1', name: 'USB摄像头' },
    { id: 'camera2', name: '网络摄像头' },
    { id: 'camera3', name: '内置摄像头' }
  ];
  cameraId.value = cameras.value[0].id;
  faceStore.updateCameras(cameras.value);
  faceStore.setCurrentCamera(cameraId.value);
};

onMounted(() => {
  loadCameras();
  // 初始化系统
  faceStore.loadSystemConfig();
  systemStore.initSystem();
  // 自动开始检测
  startDetection();
});
</script>

<style scoped>
.real-time-recog {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.video-header {
  padding: 15px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-running {
  background: #f0f9eb;
  color: #67c23a;
}

.status-stopped {
  background: #fef0f0;
  color: #f56c6c;
}

.video-container {
  padding: 20px;
  height: 500px;
}

.emotion-trend {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 15px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.face-count {
  font-size: 14px;
  color: #909399;
}

.chart-container {
  padding: 20px;
  height: 300px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.face-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.face-items {
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.face-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.face-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.face-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.face-id {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.confidence {
  font-size: 14px;
  font-weight: 500;
  color: #67c23a;
}

.no-faces {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .real-time-recog {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .video-container {
    height: 300px;
    padding: 10px;
  }
  
  .chart-container {
    height: 250px;
    padding: 10px;
  }
}
</style>