import { ref, onUnmounted } from 'vue';

/**
 * WebSocket连接钩子
 * @param {string} url - WebSocket服务器地址
 * @param {function} onMessage - 消息处理函数
 * @param {function} onError - 错误处理函数
 * @param {function} onOpen - 连接打开处理函数
 * @param {function} onClose - 连接关闭处理函数
 * @returns {object} WebSocket实例和连接状态
 */
export function useWebSocket(url, onMessage, onError, onOpen, onClose) {
  const ws = ref(null);
  const isConnected = ref(false);
  const reconnectTimer = ref(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // 建立连接
  const connect = () => {
    try {
      ws.value = new WebSocket(url);

      ws.value.onopen = (event) => {
        console.log('WebSocket连接已建立');
        isConnected.value = true;
        reconnectAttempts.value = 0;
        if (onOpen) {
          onOpen(event);
        }
      };

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('WebSocket消息解析失败:', error);
          if (onError) {
            onError(error);
          }
        }
      };

      ws.value.onerror = (error) => {
        console.error('WebSocket错误:', error);
        isConnected.value = false;
        if (onError) {
          onError(error);
        }
      };

      ws.value.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event.code, event.reason);
        isConnected.value = false;
        if (onClose) {
          onClose(event);
        }
        // 自动重连
        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnect();
        }
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      isConnected.value = false;
      if (onError) {
        onError(error);
      }
      // 重连
      reconnect();
    }
  };

  // 重连
  const reconnect = () => {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value);
    }

    reconnectAttempts.value++;
    console.log(`WebSocket重连尝试 ${reconnectAttempts.value}/${maxReconnectAttempts}`);

    reconnectTimer.value = setTimeout(() => {
      connect();
    }, reconnectDelay);
  };

  // 发送消息
  const sendMessage = (message) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      try {
        const jsonMessage = typeof message === 'string' ? message : JSON.stringify(message);
        ws.value.send(jsonMessage);
        return true;
      } catch (error) {
        console.error('WebSocket发送消息失败:', error);
        if (onError) {
          onError(error);
        }
        return false;
      }
    } else {
      console.error('WebSocket未连接，无法发送消息');
      return false;
    }
  };

  // 关闭连接
  const close = () => {
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value);
    }

    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }

    isConnected.value = false;
  };

  // 初始化连接
  connect();

  // 组件卸载时关闭连接
  onUnmounted(() => {
    close();
  });

  return {
    ws,
    isConnected,
    sendMessage,
    close,
    reconnect
  };
}