import { defineStore } from 'pinia';

// 人脸相关状态管理
export const useFaceStore = defineStore('face', {
  state: () => ({
    // 当前帧人脸数据
    currentFaces: [],
    // 选中的人脸ID
    selectedFaceId: null,
    // 全局统计数据
    globalStats: {
      onlineDevices: 0,
      currentFaces: 0,
      todayRecognition: 0,
      todayAlerts: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      uptime: '0h 0m',
      emotionDistribution: {
        happy: 0,
        sad: 0,
        angry: 0,
        neutral: 0,
        fearful: 0,
        surprised: 0,
        disgusted: 0
      }
    },
    // 历史情绪数据
    emotionHistory: [],
    // 情绪事件记录
    emotionEvents: [],
    // 检测状态
    detectionStatus: {
      isRunning: false,
      error: null,
      lastDetectionTime: null
    },
    // 摄像头列表
    cameras: [],
    // 当前使用的摄像头ID
    currentCameraId: '',
    // 系统配置
    systemConfig: {
      emotionModel: 'discrete',
      confidenceThreshold: 0.85,
      detectionInterval: 100,
      brightness: 1.0,
      contrast: 1.2,
      noiseReduction: 1,
      modelPath: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/',
      resolution: '1280x720',
      frameRate: 30,
      videoFormat: 'MP4',
      storagePath: '/data/emotion',
      storagePeriod: 30,
      emotionChangeThreshold: 0.3,
      maxHistoryLength: 1000
    }
  }),
  
  getters: {
    // 获取当前选中的人脸
    selectedFace: (state) => {
      return state.currentFaces.find(face => face.id === state.selectedFaceId) || null;
    },
    
    // 获取主要情绪分布
    topEmotions: (state) => {
      return Object.entries(state.globalStats.emotionDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key, value]) => ({
          emotion: key,
          count: value
        }));
    },
    
    // 检测是否有错误
    hasError: (state) => {
      return state.detectionStatus.error !== null;
    },
    
    // 获取检测状态文本
    detectionStatusText: (state) => {
      if (state.detectionStatus.error) {
        return `错误: ${state.detectionStatus.error}`;
      }
      return state.detectionStatus.isRunning ? '运行中' : '已停止';
    }
  },
  
  actions: {
    // 更新当前帧人脸数据
    updateCurrentFaces(faces) {
      this.currentFaces = faces;
      this.globalStats.currentFaces = faces.length;
      
      // 更新情绪分布
      this.updateEmotionDistribution(faces);
    },
    
    // 更新情绪分布
    updateEmotionDistribution(faces) {
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
      
      this.globalStats.emotionDistribution = distribution;
    },
    
    // 选择人脸
    selectFace(faceId) {
      this.selectedFaceId = faceId;
    },
    
    // 清除选择
    clearSelection() {
      this.selectedFaceId = null;
    },
    
    // 更新全局统计数据
    updateGlobalStats(stats) {
      this.globalStats = { ...this.globalStats, ...stats };
    },
    
    // 添加情绪历史记录
    addEmotionHistory(record) {
      this.emotionHistory.push(record);
      // 限制历史记录长度
      if (this.emotionHistory.length > this.systemConfig.maxHistoryLength) {
        this.emotionHistory = this.emotionHistory.slice(-this.systemConfig.maxHistoryLength);
      }
    },
    
    // 添加情绪事件
    addEmotionEvent(event) {
      this.emotionEvents.push(event);
    },
    
    // 更新检测状态
    updateDetectionStatus(status) {
      this.detectionStatus = { ...this.detectionStatus, ...status };
    },
    
    // 开始检测
    startDetection() {
      this.updateDetectionStatus({ isRunning: true, error: null });
    },
    
    // 停止检测
    stopDetection() {
      this.updateDetectionStatus({ isRunning: false });
    },
    
    // 记录检测错误
    setDetectionError(error) {
      this.updateDetectionStatus({ error });
    },
    
    // 更新摄像头列表
    updateCameras(cameras) {
      this.cameras = cameras;
    },
    
    // 设置当前摄像头
    setCurrentCamera(cameraId) {
      this.currentCameraId = cameraId;
    },
    
    // 更新系统配置
    updateSystemConfig(config) {
      this.systemConfig = { ...this.systemConfig, ...config };
      // 保存到本地存储
      localStorage.setItem('emotionDetectionConfig', JSON.stringify(this.systemConfig));
    },
    
    // 加载系统配置
    loadSystemConfig() {
      const savedConfig = localStorage.getItem('emotionDetectionConfig');
      if (savedConfig) {
        try {
          this.systemConfig = JSON.parse(savedConfig);
        } catch (error) {
          console.error('加载配置失败:', error);
        }
      }
    },
    
    // 重置系统配置
    resetSystemConfig() {
      this.systemConfig = {
        emotionModel: 'discrete',
        confidenceThreshold: 0.85,
        detectionInterval: 100,
        brightness: 1.0,
        contrast: 1.2,
        noiseReduction: 1,
        modelPath: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/',
        resolution: '1280x720',
        frameRate: 30,
        videoFormat: 'MP4',
        storagePath: '/data/emotion',
        storagePeriod: 30,
        emotionChangeThreshold: 0.3,
        maxHistoryLength: 1000
      };
      localStorage.removeItem('emotionDetectionConfig');
    }
  }
});