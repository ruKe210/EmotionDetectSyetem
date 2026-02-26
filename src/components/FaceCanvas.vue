<template>
  <div class="face-canvas-container">
    <div class="video-container" ref="videoContainer">
      <video
        ref="video"
        :src="videoSrc"
        autoplay
        muted
        playsinline
        @loadedmetadata="onVideoLoaded"
        @error="onVideoError"
      ></video>
      <canvas ref="canvas" class="face-canvas"></canvas>
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-if="error" class="error-overlay">
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as faceapi from 'face-api.js';

const props = defineProps({
  videoSrc: {
    type: String,
    default: ''
  },
  cameraId: {
    type: String,
    default: ''
  },
  enableDetection: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['faceDetected', 'detectionError']);

const video = ref(null);
const canvas = ref(null);
const videoContainer = ref(null);
const loading = ref(true);
const error = ref('');
const detectionInterval = ref(null);

// 加载模型
const loadModels = async () => {
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/'),
      faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/')
    ]);
    console.log('模型加载成功');
  } catch (err) {
    console.error('模型加载失败:', err);
    error.value = '模型加载失败';
    emit('detectionError', '模型加载失败');
  }
};

// 视频加载完成
const onVideoLoaded = () => {
  loading.value = false;
  if (props.enableDetection) {
    startDetection();
  }
};

// 视频错误
const onVideoError = () => {
  loading.value = false;
  error.value = '视频加载失败';
  emit('detectionError', '视频加载失败');
};

// 开始检测
const startDetection = () => {
  if (!video.value || !canvas.value) return;
  
  // 设置canvas尺寸
  const resizeCanvas = () => {
    if (videoContainer.value) {
      canvas.value.width = videoContainer.value.clientWidth;
      canvas.value.height = videoContainer.value.clientHeight;
    }
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // 检测循环
  detectionInterval.value = setInterval(async () => {
    if (!props.enableDetection) return;
    
    try {
      const displaySize = {
        width: canvas.value.width,
        height: canvas.value.height
      };
      
      // 检测人脸
      const detections = await faceapi.detectAllFaces(
        video.value,
        new faceapi.TinyFaceDetectorOptions({ confidenceThreshold: 0.5 })
      ).withFaceExpressions();
      
      // 绘制结果
      const ctx = canvas.value.getContext('2d');
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
      
      if (detections.length > 0) {
        // 调整检测结果到canvas尺寸
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // 绘制人脸框和表情
        resizedDetections.forEach((detection, index) => {
          const { x, y, width, height } = detection.detection.box;
          
          // 绘制人脸框
          ctx.strokeStyle = '#409eff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          
          // 绘制表情标签
          if (detection.expressions) {
            const expressions = detection.expressions;
            const maxExpression = Object.entries(expressions)
              .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: 'neutral', value: 0 });
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x, y - 20, width, 20);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${getEmotionName(maxExpression.key)}: ${(maxExpression.value * 100).toFixed(1)}%`, x + width / 2, y - 5);
          }
        });
        
        // 发送检测结果
        emit('faceDetected', resizedDetections);
      } else {
        emit('faceDetected', []);
      }
    } catch (err) {
      console.error('检测错误:', err);
      emit('detectionError', '检测过程中出错');
    }
  }, 100);
};

// 停止检测
const stopDetection = () => {
  if (detectionInterval.value) {
    clearInterval(detectionInterval.value);
    detectionInterval.value = null;
  }
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

// 监听enableDetection变化
watch(() => props.enableDetection, (newValue) => {
  if (newValue) {
    startDetection();
  } else {
    stopDetection();
  }
});

onMounted(async () => {
  await loadModels();
  
  // 如果是摄像头，获取摄像头流
  if (props.cameraId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: props.cameraId ? { exact: props.cameraId } : undefined,
          width: 1280,
          height: 720
        }
      });
      if (video.value) {
        video.value.srcObject = stream;
      }
    } catch (err) {
      console.error('获取摄像头失败:', err);
      error.value = '获取摄像头失败';
      emit('detectionError', '获取摄像头失败');
      loading.value = false;
    }
  }
});

onUnmounted(() => {
  stopDetection();
  // 释放摄像头
  if (video.value && video.value.srcObject) {
    video.value.srcObject.getTracks().forEach(track => track.stop());
  }
});
</script>

<style scoped>
.face-canvas-container {
  width: 100%;
  height: 100%;
}

.face-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>