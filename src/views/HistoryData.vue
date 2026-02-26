<template>
  <div class="history-data">
    <div class="page-header">
      <h2>历史数据</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportData">
          <i class="el-icon-download"></i> 导出数据
        </el-button>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="情绪类型">
          <el-select v-model="filterForm.emotion" placeholder="请选择情绪类型">
            <el-option label="全部" value=""></el-option>
            <el-option label="中性" value="neutral"></el-option>
            <el-option label="开心" value="happy"></el-option>
            <el-option label="悲伤" value="sad"></el-option>
            <el-option label="愤怒" value="angry"></el-option>
            <el-option label="恐惧" value="fearful"></el-option>
            <el-option label="厌恶" value="disgusted"></el-option>
            <el-option label="惊讶" value="surprised"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备">
          <el-select v-model="filterForm.device" placeholder="请选择设备">
            <el-option label="全部" value=""></el-option>
            <el-option label="摄像头 1" value="camera1"></el-option>
            <el-option label="摄像头 2" value="camera2"></el-option>
            <el-option label="摄像头 3" value="camera3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchData">
            <i class="el-icon-search"></i> 查询
          </el-button>
          <el-button @click="resetFilter">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="data-table">
      <el-table
        :data="filteredData"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="device" label="设备" width="120">
          <template #default="scope">
            {{ getDeviceName(scope.row.device) }}
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="emotion" label="情绪" width="100">
          <template #default="scope">
            <span class="emotion-tag" :class="scope.row.emotion">
              {{ getEmotionName(scope.row.emotion) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="scope">
            {{ scope.row.confidence }}%
          </template>
        </el-table-column>
        <el-table-column prop="valence" label="效价" width="80">
          <template #default="scope">
            {{ scope.row.valence?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="arousal" label="唤醒度" width="80">
          <template #default="scope">
            {{ scope.row.arousal?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">
              查看
            </el-button>
            <el-button size="small" type="danger" @click="deleteRecord(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredData.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      title="识别详情"
      width="600px"
    >
      <div v-if="selectedRecord" class="record-detail">
        <div class="detail-item">
          <span class="label">ID:</span>
          <span class="value">{{ selectedRecord.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">设备:</span>
          <span class="value">{{ getDeviceName(selectedRecord.device) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">时间:</span>
          <span class="value">{{ formatTime(selectedRecord.timestamp) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">情绪:</span>
          <span class="value">
            <span class="emotion-tag" :class="selectedRecord.emotion">
              {{ getEmotionName(selectedRecord.emotion) }}
            </span>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">置信度:</span>
          <span class="value">{{ selectedRecord.confidence }}%</span>
        </div>
        <div class="detail-item">
          <span class="label">效价:</span>
          <span class="value">{{ selectedRecord.valence?.toFixed(2) || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">唤醒度:</span>
          <span class="value">{{ selectedRecord.arousal?.toFixed(2) || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">愉悦度:</span>
          <span class="value">{{ selectedRecord.pleasure?.toFixed(2) || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">强度:</span>
          <span class="value">{{ selectedRecord.intensity?.toFixed(2) || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">关注度:</span>
          <span class="value">{{ selectedRecord.attention?.toFixed(2) || '-' }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useFaceStore } from '../store/modules/faceStore';
import { formatTime, formatEmotion } from '../utils/format';

const faceStore = useFaceStore();

const filterForm = reactive({
  dateRange: null,
  emotion: '',
  device: ''
});

const currentPage = ref(1);
const pageSize = ref(10);
const showDetailDialog = ref(false);
const selectedRecord = ref(null);

// 模拟历史数据
const historyData = ref([]);

// 过滤后的数据
const filteredData = computed(() => {
  let data = [...historyData.value];
  
  // 时间范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = new Date(filterForm.dateRange[0]);
    const endDate = new Date(filterForm.dateRange[1]);
    data = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }
  
  // 情绪类型过滤
  if (filterForm.emotion) {
    data = data.filter(item => item.emotion === filterForm.emotion);
  }
  
  // 设备过滤
  if (filterForm.device) {
    data = data.filter(item => item.device === filterForm.device);
  }
  
  return data;
});

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 搜索数据
const searchData = () => {
  // 实际项目中这里会调用API获取数据
  console.log('搜索条件:', filterForm);
};

// 重置筛选
const resetFilter = () => {
  filterForm.dateRange = null;
  filterForm.emotion = '';
  filterForm.device = '';
};

// 导出数据
const exportData = () => {
  // 实际项目中这里会调用API导出数据
  console.log('导出数据');
  ElMessage.success('数据导出成功');
};

// 查看详情
const viewDetail = (record) => {
  selectedRecord.value = record;
  showDetailDialog.value = true;
};

// 删除记录
const deleteRecord = (id) => {
  ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyData.value = historyData.value.filter(item => item.id !== id);
    ElMessage.success('删除成功');
  }).catch(() => {
    // 取消删除
  });
};

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
};

// 处理分页页码变化
const handleCurrentChange = (current) => {
  currentPage.value = current;
};

// 获取设备名称
const getDeviceName = (deviceId) => {
  const deviceMap = {
    'camera1': '摄像头 1',
    'camera2': '摄像头 2',
    'camera3': '摄像头 3'
  };
  return deviceMap[deviceId] || deviceId;
};

// 获取情绪名称
const getEmotionName = (emotion) => {
  return formatEmotion(emotion);
};

// 生成模拟数据
const generateMockData = () => {
  const emotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
  const devices = ['camera1', 'camera2', 'camera3'];
  const data = [];
  
  for (let i = 1; i <= 100; i++) {
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    data.push({
      id: i,
      device: devices[Math.floor(Math.random() * devices.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      emotion: emotion,
      confidence: Math.round(Math.random() * 20) + 80,
      valence: (Math.random() * 2 - 1).toFixed(2),
      arousal: Math.random().toFixed(2),
      pleasure: (Math.random() * 2 - 1).toFixed(2),
      intensity: Math.random().toFixed(2),
      attention: Math.random().toFixed(2)
    });
  }
  
  // 按时间排序
  data.sort((a, b) => b.timestamp - a.timestamp);
  historyData.value = data;
};

onMounted(() => {
  generateMockData();
});
</script>

<style scoped>
.history-data {
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
  background: linear-gradient(135deg, var(--primary), var(--lavender));
  border-radius: 4px;
  display: inline-block;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(108, 142, 240, 0.08);
  border: 1px solid rgba(108, 142, 240, 0.06);
  padding: 20px 22px;
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.data-table {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(108, 142, 240, 0.08);
  border: 1px solid rgba(108, 142, 240, 0.06);
  margin-bottom: 20px;
  overflow: hidden;
}

:deep(.el-table) {
  border-radius: 14px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  color: #636e72;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.el-table tr:hover td) {
  background: #fafbff;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.record-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f8f9ff;
}

.detail-item .label {
  width: 80px;
  font-size: 12px;
  font-weight: 700;
  color: #b2bec3;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.detail-item .value {
  flex: 1;
  color: #2d3436;
  font-size: 14px;
  font-weight: 600;
}

.emotion-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.emotion-tag.neutral { background: #f0f0f0; color: #636e72; }
.emotion-tag.happy { background: #fff9e6; color: #e17055; }
.emotion-tag.sad { background: #eef1ff; color: var(--primary); }
.emotion-tag.angry { background: #fff0f6; color: var(--pink); }
.emotion-tag.fearful { background: #fff8ed; color: var(--yellow); }
.emotion-tag.disgusted { background: var(--lavender-light); color: var(--lavender); }
.emotion-tag.surprised { background: var(--mint-light); color: var(--mint); }

@media (max-width: 768px) {
  .history-data { padding: 0; }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .filter-form {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .filter-form .el-form-item {
    width: 100%;
  }

  .data-table {
    overflow-x: auto;
  }

  .pagination {
    justify-content: center;
  }
}
</style>