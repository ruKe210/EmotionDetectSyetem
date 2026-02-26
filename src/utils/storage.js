/**
 * 本地存储工具函数
 */

/**
 * localStorage操作
 */
export const localStorageUtil = {
  /**
   * 设置localStorage
   * @param {string} key - 键
   * @param {any} value - 值
   */
  set: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('localStorage设置失败:', error);
    }
  },

  /**
   * 获取localStorage
   * @param {string} key - 键
   * @param {any} defaultValue - 默认值
   * @returns {any} 值
   */
  get: (key, defaultValue = null) => {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('localStorage获取失败:', error);
      return defaultValue;
    }
  },

  /**
   * 删除localStorage
   * @param {string} key - 键
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage删除失败:', error);
    }
  },

  /**
   * 清空localStorage
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('localStorage清空失败:', error);
    }
  },

  /**
   * 检查localStorage是否存在
   * @param {string} key - 键
   * @returns {boolean} 是否存在
   */
  has: (key) => {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('localStorage检查失败:', error);
      return false;
    }
  }
};

/**
 * sessionStorage操作
 */
export const sessionStorageUtil = {
  /**
   * 设置sessionStorage
   * @param {string} key - 键
   * @param {any} value - 值
   */
  set: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('sessionStorage设置失败:', error);
    }
  },

  /**
   * 获取sessionStorage
   * @param {string} key - 键
   * @param {any} defaultValue - 默认值
   * @returns {any} 值
   */
  get: (key, defaultValue = null) => {
    try {
      const serializedValue = sessionStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('sessionStorage获取失败:', error);
      return defaultValue;
    }
  },

  /**
   * 删除sessionStorage
   * @param {string} key - 键
   */
  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('sessionStorage删除失败:', error);
    }
  },

  /**
   * 清空sessionStorage
   */
  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('sessionStorage清空失败:', error);
    }
  },

  /**
   * 检查sessionStorage是否存在
   * @param {string} key - 键
   * @returns {boolean} 是否存在
   */
  has: (key) => {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch (error) {
      console.error('sessionStorage检查失败:', error);
      return false;
    }
  }
};

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  // 用户相关
  USER_TOKEN: 'userToken',
  USER_INFO: 'userInfo',
  
  // 系统配置
  SYSTEM_CONFIG: 'systemConfig',
  EMOTION_DETECTION_CONFIG: 'emotionDetectionConfig',
  
  // 摄像头配置
  DEFAULT_CAMERA: 'defaultCamera',
  CAMERA_LIST: 'cameraList',
  
  // 界面配置
  THEME: 'theme',
  LANGUAGE: 'language',
  
  // 历史记录
  EMOTION_HISTORY: 'emotionHistory',
  ALERT_HISTORY: 'alertHistory',
  
  // 临时数据
  TEMP_DATA: 'tempData'
};

/**
 * 安全存储操作
 * @param {string} key - 键
 * @param {any} value - 值
 * @param {boolean} session - 是否使用sessionStorage
 */
export function setStorage(key, value, session = false) {
  if (session) {
    sessionStorageUtil.set(key, value);
  } else {
    localStorageUtil.set(key, value);
  }
}

/**
 * 安全获取存储
 * @param {string} key - 键
 * @param {any} defaultValue - 默认值
 * @param {boolean} session - 是否使用sessionStorage
 * @returns {any} 值
 */
export function getStorage(key, defaultValue = null, session = false) {
  if (session) {
    return sessionStorageUtil.get(key, defaultValue);
  } else {
    return localStorageUtil.get(key, defaultValue);
  }
}

/**
 * 安全删除存储
 * @param {string} key - 键
 * @param {boolean} session - 是否使用sessionStorage
 */
export function removeStorage(key, session = false) {
  if (session) {
    sessionStorageUtil.remove(key);
  } else {
    localStorageUtil.remove(key);
  }
}

/**
 * 安全清空存储
 * @param {boolean} session - 是否使用sessionStorage
 */
export function clearStorage(session = false) {
  if (session) {
    sessionStorageUtil.clear();
  } else {
    localStorageUtil.clear();
  }
}

/**
 * 检查存储是否存在
 * @param {string} key - 键
 * @param {boolean} session - 是否使用sessionStorage
 * @returns {boolean} 是否存在
 */
export function hasStorage(key, session = false) {
  if (session) {
    return sessionStorageUtil.has(key);
  } else {
    return localStorageUtil.has(key);
  }
}