import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

/**
 * ECharts图表钩子
 * @param {string|HTMLElement} dom - 图表容器DOM元素或选择器
 * @param {object} options - 图表配置选项
 * @param {boolean} autoResize - 是否自动响应容器大小变化
 * @returns {object} 图表实例和操作方法
 */
export function useEcharts(dom, options = {}, autoResize = true) {
  const chartInstance = ref(null);
  const container = ref(null);

  // 初始化图表
  const initChart = () => {
    // 获取DOM元素
    if (typeof dom === 'string') {
      container.value = document.querySelector(dom);
    } else if (dom instanceof HTMLElement) {
      container.value = dom;
    }

    if (!container.value) {
      console.error('ECharts容器不存在');
      return;
    }

    // 销毁已存在的图表实例
    if (chartInstance.value) {
      chartInstance.value.dispose();
    }

    // 创建新的图表实例
    chartInstance.value = echarts.init(container.value);
    
    // 设置图表选项
    if (options) {
      chartInstance.value.setOption(options);
    }

    console.log('ECharts图表初始化成功');
  };

  // 更新图表选项
  const updateOptions = (newOptions) => {
    if (chartInstance.value) {
      chartInstance.value.setOption(newOptions, true);
      console.log('ECharts图表选项更新成功');
    }
  };

  // 调整图表大小
  const resize = () => {
    if (chartInstance.value) {
      chartInstance.value.resize();
      console.log('ECharts图表大小调整成功');
    }
  };

  // 销毁图表
  const dispose = () => {
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
      console.log('ECharts图表销毁成功');
    }
  };

  // 响应式调整
  const handleResize = () => {
    resize();
  };

  // 监听选项变化
  watch(
    () => options,
    (newOptions) => {
      updateOptions(newOptions);
    },
    { deep: true }
  );

  onMounted(() => {
    initChart();
    
    // 自动调整大小
    if (autoResize) {
      window.addEventListener('resize', handleResize);
    }
  });

  onUnmounted(() => {
    if (autoResize) {
      window.removeEventListener('resize', handleResize);
    }
    dispose();
  });

  return {
    chartInstance,
    initChart,
    updateOptions,
    resize,
    dispose
  };
}