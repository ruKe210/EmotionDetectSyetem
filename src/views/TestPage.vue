<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fa fa-video-camera"></i>
        </div>
        <div class="stat-content">
          <h4>在线设备</h4>
          <p id="onlineDevices">0</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fa fa-smile-o"></i>
        </div>
        <div class="stat-content">
          <h4>今日识别次数</h4>
          <p id="todayRecognition">0</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fa fa-bell"></i>
        </div>
        <div class="stat-content">
          <h4>今日告警数</h4>
          <p id="todayAlerts">0</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fa fa-line-chart"></i>
        </div>
        <div class="stat-content">
          <h4>识别准确率</h4>
          <p id="accuracy">0%</p>
        </div>
      </div>
    </div>

    <!-- 实时监控 -->
    <div class="card">
      <div class="card-header">
        <h4>实时监控</h4>
      </div>
      <div class="card-body">
        <div class="video-grid">
          <div class="video-card">
            <div class="video-header">
              <h5>摄像头 1</h5>
              <span class="badge bg-success">在线</span>
            </div>
            <div class="video-content">
              <div class="video-preview">
                <video autoplay muted playsinline></video>
                <div class="video-overlay">实时检测</div>
              </div>
              <div class="emotion-result">
                <div class="emotion-label">中性</div>
                <div class="emotion-confidence">置信度: 85.2%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 情绪分布 -->
    <div class="card">
      <div class="card-header">
        <h4>今日情绪分布</h4>
      </div>
      <div class="card-body">
        <div class="chart-container">
          <canvas id="emotionDistributionChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 控制台页面
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.video-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.video-header {
  padding: 15px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.video-content {
  padding: 15px;
}

.video-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.video-preview video {
  width: 100%;
  border-radius: 8px;
}

.video-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
}

.emotion-result {
  text-align: center;
  padding: 10px;
  background: #f0f4f8;
  border-radius: 8px;
  margin-bottom: 15px;
}

.emotion-label {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
}

.emotion-confidence {
  font-size: 14px;
  color: #718096;
}

.chart-container {
  position: relative;
  height: 400px;
  margin-top: 20px;
}

.badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge.bg-success {
  background-color: #48bb78;
  color: white;
}
</style>