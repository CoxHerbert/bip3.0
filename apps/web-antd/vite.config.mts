import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        host: '0.0.0.0', // 允许外部访问（必配）
        cors: true, // 开启跨域（必配）
        // 核心修复：添加允许的主机白名单
        allowedHosts: [
          'localhost',
          '127.0.0.1',
          'test.eastwinbip.com', // 你的穿透域名，加在这里
        ],
        proxy: {
          '/admin-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/admin-api/, ''),
            // mock代理目标地址
            // target: 'http://192.168.60.39:48080/admin-api',
            target: 'http://192.168.1.182:30080/admin-api',
            // target: 'http://192.168.60.106:48080/admin-api',
            // target: 'http://test.eastwinbip.com/admin-api',
            ws: true,
          },
        },
      },
    },
  };
});
