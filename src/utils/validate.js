/**
 * 校验工具函数
 */

/**
 * 校验人脸ID
 * @param {string|number} faceId - 人脸ID
 * @returns {boolean} 是否有效
 */
export function validateFaceId(faceId) {
  if (!faceId) return false;
  const idStr = String(faceId);
  return /^[a-zA-Z0-9_-]{1,50}$/.test(idStr);
}

/**
 * 校验摄像头ID
 * @param {string|number} cameraId - 摄像头ID
 * @returns {boolean} 是否有效
 */
export function validateCameraId(cameraId) {
  if (!cameraId) return false;
  const idStr = String(cameraId);
  return /^[a-zA-Z0-9_-]{1,50}$/.test(idStr);
}

/**
 * 校验设备ID
 * @param {string|number} deviceId - 设备ID
 * @returns {boolean} 是否有效
 */
export function validateDeviceId(deviceId) {
  if (!deviceId) return false;
  const idStr = String(deviceId);
  return /^[a-zA-Z0-9_-]{1,50}$/.test(idStr);
}

/**
 * 校验告警ID
 * @param {string|number} alertId - 告警ID
 * @returns {boolean} 是否有效
 */
export function validateAlertId(alertId) {
  if (!alertId) return false;
  const idStr = String(alertId);
  return /^[a-zA-Z0-9_-]{1,50}$/.test(idStr);
}

/**
 * 校验用户名
 * @param {string} username - 用户名
 * @returns {boolean} 是否有效
 */
export function validateUsername(username) {
  if (!username) return false;
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

/**
 * 校验密码
 * @param {string} password - 密码
 * @returns {boolean} 是否有效
 */
export function validatePassword(password) {
  if (!password) return false;
  // 至少8位，包含大小写字母和数字
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

/**
 * 校验邮箱
 * @param {string} email - 邮箱
 * @returns {boolean} 是否有效
 */
export function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 校验IP地址
 * @param {string} ip - IP地址
 * @returns {boolean} 是否有效
 */
export function validateIP(ip) {
  if (!ip) return false;
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

/**
 * 校验MAC地址
 * @param {string} mac - MAC地址
 * @returns {boolean} 是否有效
 */
export function validateMAC(mac) {
  if (!mac) return false;
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

/**
 * 校验URL
 * @param {string} url - URL
 * @returns {boolean} 是否有效
 */
export function validateURL(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 校验数字范围
 * @param {number} value - 数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {boolean} 是否在范围内
 */
export function validateNumberRange(value, min, max) {
  if (isNaN(value)) return false;
  const num = Number(value);
  return num >= min && num <= max;
}

/**
 * 校验字符串长度
 * @param {string} value - 字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean} 是否在范围内
 */
export function validateStringLength(value, min, max) {
  if (!value) return false;
  const length = String(value).length;
  return length >= min && length <= max;
}

/**
 * 校验数组长度
 * @param {array} array - 数组
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean} 是否在范围内
 */
export function validateArrayLength(array, min, max) {
  if (!Array.isArray(array)) return false;
  const length = array.length;
  return length >= min && length <= max;
}

/**
 * 校验对象是否为空
 * @param {object} obj - 对象
 * @returns {boolean} 是否为空
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * 校验数据是否为null或undefined
 * @param {any} value - 数据
 * @returns {boolean} 是否为null或undefined
 */
export function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * 校验数据是否为空
 * @param {any} value - 数据
 * @returns {boolean} 是否为空
 */
export function isEmpty(value) {
  if (isNullOrUndefined(value)) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return isEmptyObject(value);
  return false;
}

/**
 * 校验人脸数据是否完整
 * @param {object} faceData - 人脸数据
 * @returns {boolean} 是否完整
 */
export function validateFaceData(faceData) {
  if (!faceData) return false;
  return (
    validateFaceId(faceData.id) &&
    faceData.expressions &&
    typeof faceData.expressions === 'object'
  );
}

/**
 * 校验系统配置是否完整
 * @param {object} config - 系统配置
 * @returns {boolean} 是否完整
 */
export function validateSystemConfig(config) {
  if (!config) return false;
  return (
    config.emotionModel &&
    typeof config.confidenceThreshold === 'number' &&
    typeof config.detectionInterval === 'number'
  );
}

/**
 * 校验摄像头数据是否完整
 * @param {object} camera - 摄像头数据
 * @returns {boolean} 是否完整
 */
export function validateCameraData(camera) {
  if (!camera) return false;
  return (
    validateCameraId(camera.id) &&
    camera.name &&
    camera.type
  );
}