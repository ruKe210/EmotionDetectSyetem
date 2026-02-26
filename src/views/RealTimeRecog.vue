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
  padding: 0;
  animation: fade-up 0.3s ease;
}

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

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #2d3436;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header h2::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, var(--mint), var(--primary));
  border-radius: 4px;
  display: inline-block;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
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
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(108, 142, 240, 0.08);
  border: 1px solid rgba(108, 142, 240, 0.06);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.video-card:hover {
  box-shadow: 0 8px 30px rgba(108, 142, 240, 0.15);
}

.video-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-bottom: 1px solid #eef1ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #2d3436;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-running {
  background: var(--green-light);
  color: var(--green);
}

.status-running::before {
  background: var(--green);
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

.status-stopped {
  background: var(--pink-light);
  color: var(--pink);
}

.status-stopped::before {
  background: var(--pink);
}

.video-container {
  padding: 16px;
  height: 480px;
}

.emotion-trend {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(108, 142, 240, 0.08);
  border: 1px solid rgba(108, 142, 240, 0.06);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-bottom: 1px solid #eef1ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #2d3436;
}

.face-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 3px 10px;
  border-radius: 20px;
}

.chart-container {
  padding: 16px;
  height: 280px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.face-list {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(108, 142, 240, 0.08);
  border: 1px solid rgba(108, 142, 240, 0.06);
  overflow: hidden;
}

.face-items {
  padding: 12px;
  max-height: 380px;
  overflow-y: auto;
}

.face-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1.5px solid #eef1ff;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fafbff;
}

.face-item:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: translateX(2px);
}

.face-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.face-id {
  font-size: 13px;
  font-weight: 700;
  color: #2d3436;
}

.confidence {
  font-size: 13px;
  font-weight: 800;
  color: var(--green);
  background: var(--green-light);
  padding: 2px 8px;
  border-radius: 10px;
}

.no-faces {
  text-align: center;
  padding: 36px 20px;
  color: #b2bec3;
  font-size: 14px;
}

.no-faces::before {
  content: '👤';
  display: block;
  font-size: 32px;
  margin-bottom: 10px;
}

.emotion-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.emotion-tag.neutral { background: #f0f0f0; color: #636e72; }
.emotion-tag.happy { background: #fff9e6; color: #e17055; }
.emotion-tag.sad { background: #eef1ff; color: var(--primary); }
.emotion-tag.angry { background: #fff0f6; color: var(--pink); }
.emotion-tag.fearful { background: #fff8ed; color: var(--yellow); }
.emotion-tag.disgusted { background: var(--lavender-light); color: var(--lavender); }
.emotion-tag.surprised { background: var(--mint-light); color: var(--mint); }

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .real-time-recog { padding: 0; }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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
    height: 220px;
    padding: 10px;
  }

  .sidebar {
    grid-template-columns: 1fr;
  }
}
</style>