<template>
  <div class="video-player">
    <div class="video-container" ref="videoContainer">
      <video
        ref="video"
        :src="videoSrc"
        :autoplay="autoplay"
        :muted="muted"
        :playsinline="playsinline"
        @loadedmetadata="onVideoLoaded"
        @error="onVideoError"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
      ></video>
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-if="error" class="error-overlay">
        <span>{{ error }}</span>
      </div>
      <div class="video-controls" v-if="showControls">
        <div class="controls-left">
          <button class="control-btn" @click="togglePlay">
            <i :class="isPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>
          </button>
          <div class="progress-container">
            <el-slider
              v-model="currentTime"
              :min="0"
              :max="duration"
              :format-tooltip="formatTime"
              @change="seek"
            ></el-slider>
            <div class="time-display">
              <span>{{ formatTime(currentTime) }}</span>
              <span>/</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>
        </div>
        <div class="controls-right">
          <button class="control-btn" @click="toggleMute">
            <i :class="isMuted ? 'el-icon-mute' : 'el-icon-microphone'"></i>
          </button>
          <el-select v-model="resolution" size="small" @change="changeResolution">
            <el-option label="480p" value="480"></el-option>
            <el-option label="720p" value="720"></el-option>
            <el-option label="1080p" value="1080"></el-option>
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  videoSrc: {
    type: String,
    default: ''
  },
  cameraId: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  muted: {
    type: Boolean,
    default: true
  },
  playsinline: {
    type: Boolean,
    default: true
  },
  showControls: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['play', 'pause', 'ended', 'error', 'timeupdate']);

const video = ref(null);
const videoContainer = ref(null);
const loading = ref(true);
const error = ref('');
const isPlaying = ref(false);
const isMuted = ref(props.muted);
const duration = ref(0);
const currentTime = ref(0);
const resolution = ref('720');
const updateInterval = ref(null);

// 视频加载完成
const onVideoLoaded = () => {
  if (video.value) {
    duration.value = video.value.duration || 0;
    isPlaying.value = !video.value.paused;
    isMuted.value = video.value.muted;
  }
  loading.value = false;
};

// 视频错误
const onVideoError = () => {
  loading.value = false;
  error.value = '视频加载失败';
  emit('error', '视频加载失败');
};

// 播放
const onPlay = () => {
  isPlaying.value = true;
  emit('play');
};

// 暂停
const onPause = () => {
  isPlaying.value = false;
  emit('pause');
};

// 结束
const onEnded = () => {
  isPlaying.value = false;
  emit('ended');
};

// 切换播放/暂停
const togglePlay = () => {
  if (video.value) {
    if (video.value.paused) {
      video.value.play();
    } else {
      video.value.pause();
    }
  }
};

// 切换静音
const toggleMute = () => {
  if (video.value) {
    video.value.muted = !video.value.muted;
    isMuted.value = video.value.muted;
  }
};

// 跳转
const seek = (value) => {
  if (video.value) {
    video.value.currentTime = value;
  }
};

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 改变分辨率
const changeResolution = (value) => {
  // 这里可以实现切换视频分辨率的逻辑
  console.log('切换分辨率到:', value);
  // 实际实现中可能需要重新加载视频源
};

// 更新当前时间
const updateCurrentTime = () => {
  if (video.value && !video.value.paused) {
    currentTime.value = video.value.currentTime;
    emit('timeupdate', currentTime.value);
  }
};

// 监听视频源变化
watch(() => props.videoSrc, (newValue) => {
  loading.value = true;
  error.value = '';
  if (video.value) {
    video.value.src = newValue;
  }
});

// 监听摄像头ID变化
watch(() => props.cameraId, async (newValue) => {
  if (newValue) {
    loading.value = true;
    error.value = '';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: newValue ? { exact: newValue } : undefined,
          width: parseInt(resolution.value),
          height: parseInt(resolution.value) * 9 / 16
        }
      });
      if (video.value) {
        video.value.srcObject = stream;
      }
    } catch (err) {
      console.error('获取摄像头失败:', err);
      error.value = '获取摄像头失败';
      emit('error', '获取摄像头失败');
      loading.value = false;
    }
  }
});

onMounted(() => {
  // 定期更新当前时间
  updateInterval.value = setInterval(updateCurrentTime, 1000);
  
  // 如果是摄像头，获取摄像头流
  if (props.cameraId) {
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: props.cameraId ? { exact: props.cameraId } : undefined,
        width: 1280,
        height: 720
      }
    }).then(stream => {
      if (video.value) {
        video.value.srcObject = stream;
      }
    }).catch(err => {
      console.error('获取摄像头失败:', err);
      error.value = '获取摄像头失败';
      emit('error', '获取摄像头失败');
      loading.value = false;
    });
  }
});

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
  // 释放摄像头
  if (video.value && video.value.srcObject) {
    video.value.srcObject.getTracks().forEach(track => track.stop());
  }
});
</script>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
}

.video-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.video-container video {
  width: 100%;
  height: auto;
  display: block;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 15px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-container:hover .video-controls {
  opacity: 1;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.progress-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.time-display {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

/* 自定义滑块样式 */
:deep(.el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-slider__bar) {
  background-color: #409eff;
}

:deep(.el-slider__button) {
  border-color: #409eff;
}

/* 自定义选择器样式 */
:deep(.el-select) {
  width: 80px;
}

:deep(.el-select .el-input__inner) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

:deep(.el-select .el-input__icon) {
  color: white;
}

@media (max-width: 768px) {
  .video-controls {
    padding: 10px;
  }
  
  .controls-left {
    gap: 10px;
  }
  
  .controls-right {
    gap: 10px;
  }
  
  .control-btn {
    padding: 6px;
    font-size: 14px;
  }
  
  .time-display {
    font-size: 10px;
  }
  
  :deep(.el-select) {
    width: 70px;
  }
}
</style>