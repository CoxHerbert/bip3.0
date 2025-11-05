// hooks/useResponsiveResize.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useResponsiveResize(designWidth = 1920, designHeight = 1080) {
  const scale = ref(1);

  const calculateScale = () => {
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;
    const widthScale = clientWidth / designWidth;
    const heightScale = clientHeight / designHeight;

    // 使用较小的缩放比例，确保内容能完整显示
    scale.value = Math.min(widthScale, heightScale);

    // 限制最小缩放比例，避免内容过小
    if (scale.value < 0.5) {
      scale.value = 0.5;
    }

    // 限制最大缩放比例，避免内容过大
    if (scale.value > 1.5) {
      scale.value = 1.5;
    }
  };

  const handleResize = () => {
    calculateScale();
  };

  // 自动启动监听
  onMounted(() => {
    calculateScale(); // 初始化时计算一次
    window.addEventListener('resize', handleResize);
  });

  // 自动停止监听
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    scale,
  };
}
