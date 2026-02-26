import { ref } from 'vue';

/**
 * 人脸框点击事件钩子
 * @param {HTMLElement} canvas - Canvas元素
 * @param {function} onFaceClick - 人脸点击回调函数
 * @returns {object} 点击状态和操作方法
 */
export function useFaceClick(canvas, onFaceClick) {
  const isClicking = ref(false);
  const lastClickTime = ref(0);
  const clickThreshold = 300; // 点击时间阈值，防止双击

  // 计算点击位置相对于Canvas的坐标
  const getCanvasCoordinates = (event) => {
    if (!canvas.value) return null;

    const rect = canvas.value.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // 检查点击是否命中人脸框
  const checkFaceHit = (clickPos, faceBox) => {
    if (!clickPos || !faceBox) return false;

    const { x, y, width, height } = faceBox;
    return (
      clickPos.x >= x &&
      clickPos.x <= x + width &&
      clickPos.y >= y &&
      clickPos.y <= y + height
    );
  };

  // 处理点击事件
  const handleClick = (event, faces) => {
    const now = Date.now();
    
    // 防止双击
    if (now - lastClickTime.value < clickThreshold) {
      return;
    }

    lastClickTime.value = now;
    isClicking.value = true;

    try {
      const clickPos = getCanvasCoordinates(event);
      if (!clickPos) return;

      // 检查是否命中人脸
      for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        if (face.detection && face.detection.box) {
          const faceBox = face.detection.box;
          if (checkFaceHit(clickPos, faceBox)) {
            if (onFaceClick) {
              onFaceClick(face, i);
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error('人脸点击处理失败:', error);
    } finally {
      isClicking.value = false;
    }
  };

  // 添加点击事件监听器
  const addClickListener = () => {
    if (canvas.value) {
      canvas.value.addEventListener('click', (event) => {
        handleClick(event, []); // 默认空数组，实际使用时需要传入当前帧的人脸数据
      });
    }
  };

  // 移除点击事件监听器
  const removeClickListener = () => {
    if (canvas.value) {
      canvas.value.removeEventListener('click', handleClick);
    }
  };

  // 手动触发点击检查
  const checkClick = (event, faces) => {
    handleClick(event, faces);
  };

  return {
    isClicking,
    addClickListener,
    removeClickListener,
    checkClick,
    getCanvasCoordinates,
    checkFaceHit
  };
}