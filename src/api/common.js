import service from './request';

// 通用接口
export const commonApi = {
  // 获取摄像头列表
  getCameraList: () => {
    return service.get('/camera/list');
  },
  
  // 获取系统配置
  getSystemConfig: () => {
    return service.get('/config');
  },
  
  // 保存系统配置
  saveSystemConfig: (config) => {
    return service.post('/config', config);
  },
  
  // 导出Excel数据
  exportExcel: (params) => {
    return service.get('/export/excel', {
      params,
      responseType: 'blob'
    });
  },
  
  // 导出JSON数据
  exportJson: (params) => {
    return service.get('/export/json', { params });
  },
  
  // 获取系统运行状态
  getSystemStatus: () => {
    return service.get('/system/status');
  },
  
  // 测试模型连接
  testModelConnection: (modelPath) => {
    return service.post('/model/test', { modelPath });
  },
  
  // 更新模型
  updateModel: (modelPath) => {
    return service.post('/model/update', { modelPath });
  }
};

// 导出别名函数，以匹配SystemConfig.vue中的导入
export const getCameras = commonApi.getCameraList;
export const updateSystemConfig = commonApi.saveSystemConfig;