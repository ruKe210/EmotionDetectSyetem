<template>
  <div class="face-canvas-container">
    <div class="video-container" ref="videoContainer">
      <!-- 视频流显示 -->
      <img 
        v-if="videoFrame" 
        :src="videoFrame" 
        class="video-stream"
        alt="视频流"
      />
      
      <!-- 人脸检测覆盖层 -->
      <canvas ref="canvas" class="face-canvas"></canvas>
      
      <!-- 加载状态 -->
      <div v-if="!isConnected" class="loading-overlay">
        <div class="loading-spinner"></div>
        <span>正在连接视频流...</span>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error" class="error-overlay">
        <span>{{ error }}</span>
        <el-button type="primary" size="small" @click="reconnect" class="retry-btn">
          重新连接
        </el-button>
      </div>
      
      <!-- 状态信息 -->
      <div class="stream-info">
        <span class="fps">{{ fps }} FPS</span>
        <span class="latency">延迟: {{ latency }}ms</span>
        <span class="faces">人脸: {{ faceCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const props = defineProps({
  cameraId: {
    type: String,
    default: ''
  },
  enableDetection: {
    type: Boolean,
    default: true
  },
  wsUrl: {
    type: String,
    default: 'ws://localhost:8000/ws/video'
  }
});

const emit = defineEmits(['faceDetected', 'detectionError', 'connected', 'disconnected']);

const videoContainer = ref(null);
const canvas = ref(null);
const videoFrame = ref('');
const isConnected = ref(false);
const error = ref('');
const fps = ref(0);
const latency = ref(0);
const faceCount = ref(0);

let ws = null;
let reconnectTimer = null;
let heartbeatTimer = null;
let frameCount = 0;
let lastFpsTime = Date.now();

// 连接WebSocket
const connect = () => {
  if (ws) {
    ws.close();
  }
  
  error.value = '';
  
  try {
    ws = new WebSocket(props.wsUrl);
    
    ws.onopen = () => {
      console.log('视频流WebSocket已连接');
      isConnected.value = true;
      emit('connected');
      
      // 启动心跳
      startHeartbeat();
    };
    
    ws.onmessage = (event) => {
      // 重置心跳计时器
      resetHeartbeat();
      
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'video' && message.frame) {
          // 显示视频帧
          videoFrame.value = `data:image/jpeg;base64,${message.frame}`;
          
          // 计算FPS
          frameCount++;
          const now = Date.now();
          if (now - lastFpsTime >= 1000) {
            fps.value = frameCount;
            frameCount = 0;
            lastFpsTime = now;
          }
          
          // 计算延迟
          if (message.timestamp) {
            const serverTime = new Date(message.timestamp).getTime();
            latency.value = Math.round(now - serverTime);
          }
        }
      } catch (err) {
        console.error('解析消息失败:', err);
      }
    };
    
    ws.onerror = (err) => {
      console.error('WebSocket错误:', err);
      error.value = '连接错误';
      emit('detectionError', 'WebSocket连接错误');
      
      // 停止心跳
      stopHeartbeat();
    };
    
    ws.onclose = () => {
      console.log('视频流WebSocket已断开');
      isConnected.value = false;
      emit('disconnected');
      
      // 停止心跳
      stopHeartbeat();
      
      // 自动重连
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          connect();
        }, 3000);
      }
    };
  } catch (err) {
    console.error('创建WebSocket失败:', err);
    error.value = '创建连接失败';
  }
};

// 心跳机制
const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'ping' }));
      } catch (err) {
        console.error('发送心跳失败:', err);
      }
    }
  }, 30000); // 每30秒发送一次心跳
};

const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

const resetHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    startHeartbeat();
  }
};

// 断开连接
const disconnect = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (heartbeatTimer) {
    stopHeartbeat();
  }
  
  if (ws) {
    ws.close();
    ws = null;
  }
  
  isConnected.value = false;
};

// 重新连接
const reconnect = () => {
  disconnect();
  connect();
};

// 监听人脸数据（通过另一个WebSocket）
const setupFaceWebSocket = () => {
  const faceWs = new WebSocket('ws://localhost:8000/ws/face');
  
  faceWs.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'face' && message.data) {
        faceCount.value = message.data.faces ? message.data.faces.length : 0;
        
        // 绘制人脸框
        if (canvas.value && message.data.faces) {
          drawFaceBoxes(message.data.faces);
        }
        
        // 发送给父组件
        emit('faceDetected', message.data.faces || []);
      }
    } catch (err) {
      console.error('解析人脸数据失败:', err);
    }
  };
  
  return faceWs;
};

// 绘制人脸框
const drawFaceBoxes = (faces) => {
  if (!canvas.value || !videoContainer.value) return;

  const ctx = canvas.value.getContext('2d');
  const containerWidth = videoContainer.value.clientWidth;
  const containerHeight = videoContainer.value.clientHeight;

  // 设置canvas尺寸
  canvas.value.width = containerWidth;
  canvas.value.height = containerHeight;

  // 清空画布
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // 绘制每个人脸框
  faces.forEach(face => {
    const box = face.box;
    const color = getEmotionColor(face.dominant_emotion);

    // 绘制人脸框 - 暂时注释掉
    // ctx.strokeStyle = color;
    // ctx.lineWidth = 3;
    // ctx.strokeRect(box.x, box.y, box.width, box.height);

    // 绘制情绪标签 - 暂时注释掉
    // const label = `${getEmotionName(face.dominant_emotion)} ${(face.emotion_confidence * 100).toFixed(0)}%`;
    // ctx.font = 'bold 14px Arial';
    // const textWidth = ctx.measureText(label).width;

    // ctx.fillStyle = color;
    // ctx.fillRect(box.x, box.y - 25, textWidth + 16, 24);

    // ctx.fillStyle = 'white';
    // ctx.textAlign = 'left';
    // ctx.fillText(label, box.x + 8, box.y - 8);

    // 绘制 VA 值 (如果有) - 暂时注释掉
    // if (face.valence !== undefined && face.arousal !== undefined) {
    //   const vaLabel = `V:${face.valence >= 0 ? '+' : ''}${face.valence.toFixed(2)} A:${face.arousal >= 0 ? '+' : ''}${face.arousal.toFixed(2)}`;
    //   ctx.font = '11px monospace';
    //   const vaWidth = ctx.measureText(vaLabel).width;

    //   ctx.fillStyle = 'rgba(0,0,0,0.6)';
    //   ctx.fillRect(box.x, box.y + box.height + 2, vaWidth + 12, 18);

    //   ctx.fillStyle = '#e0e0e0';
    //   ctx.fillText(vaLabel, box.x + 6, box.y + box.height + 15);
    // }
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
    surprised: '惊讶',
    contempt: '蔑视'
  };
  return emotionMap[emotion] || emotion;
};

// 获取情绪颜色
const getEmotionColor = (emotion) => {
  const colorMap = {
    neutral: '#909399',
    happy: '#67c23a',
    sad: '#409eff',
    angry: '#f56c6c',
    fearful: '#e6a23c',
    disgusted: '#8e44ad',
    surprised: '#17c6cf',
    contempt: '#6c5ce7'
  };
  return colorMap[emotion] || '#409eff';
};

let faceWs = null;

onMounted(() => {
  // 连接视频流WebSocket
  connect();
  
  // 连接人脸数据WebSocket
  faceWs = setupFaceWebSocket();
});

onUnmounted(() => {
  disconnect();
  
  if (faceWs) {
    faceWs.close();
  }
});

// 监听enableDetection变化
watch(() => props.enableDetection, (newValue) => {
  if (newValue) {
    if (!isConnected.value) {
      connect();
    }
  } else {
    disconnect();
  }
});
</script>

<style scoped>
.face-canvas-container {
  width: 100%;
  height: 100%;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.face-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 10px;
}

.stream-info {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 15px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 15px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-family: monospace;
}

.stream-info span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.fps {
  color: #67c23a;
}

.latency {
  color: #e6a23c;
}

.faces {
  color: #409eff;
}
</style>
