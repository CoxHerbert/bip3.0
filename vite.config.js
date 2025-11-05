// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import { resolve as pathResolve } from 'path';
import createVitePlugins from './vite/plugins';
import dayjs from 'dayjs';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import versionUpdatePlugin from './src/utils/versionUpdatePlugin';

const require = createRequire(import.meta.url);

// —— 兼容 ESM 的 __dirname —— //
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// —— 从 node_modules 的 package.json 读取版本号 —— //
function getPkgVersion(pkgName) {
  try {
    const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const sanitize = s => s.replace(/[@/\\]+/g, '_').replace(/[^\w-]/g, '_');

export default ({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_BASE_URL, VITE_WEIGHT, VITE_APP_API, VITE_APP_ENV, VITE_APP_BASE } = env;

  const isBuild = command === 'build';
  const isProd = VITE_APP_ENV === 'production';
  const currentTimeVersion = Date.now();

  return defineConfig({
    base: VITE_APP_BASE,
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: true,
      __INTLIFY_PROD_DEVTOOLS__: false,
      'import.meta.env.VITE_APP_VERSION': currentTimeVersion,
    },
    server: {
      port: 2888,
      open: true,
      allowedHosts: ['test.eastwinbip.com', '.eastwinbip.com'],
      proxy: {
        [VITE_APP_API]: {
          target: VITE_APP_BASE_URL,
          changeOrigin: true,
          rewrite: p => p.replace(VITE_APP_API, ''),
        },
        '/graphql/wiki': {
          target: 'https://wiki.eastwinbip.com/graphql',
          changeOrigin: true,
          rewrite: p => p.replace('/graphql/wiki', ''),
        },
        '/weight': {
          target: `${VITE_WEIGHT}/weight`,
          changeOrigin: true,
          // ✅ 确保只替换路径开头
          rewrite: p => p.replace(/^\/weight/, ''),
        },
        '/socket.io': {
          target: `${VITE_WEIGHT}/socket.io`,
          changeOrigin: true,
        },
        '/pdf-printing': {
          target: 'https://www.eastwinbip.com/pdf-printing',
          changeOrigin: true,
        },
        '/onlinePreview': {
          target: 'http://192.168.30.102:30092/onlinePreview',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '~': pathResolve(__dirname, './'),
        '@': pathResolve(__dirname, './src'),
        '~@': pathResolve(__dirname, './src'),
        '@public': pathResolve(__dirname, './public'),
        components: pathResolve(__dirname, './src/components'),
        styles: pathResolve(__dirname, './src/styles'),
        utils: pathResolve(__dirname, './src/utils'),
      },
    },
    plugins: [
      createVitePlugins(env, isBuild),
      versionUpdatePlugin({
        version: currentTimeVersion,
      }),
    ].filter(Boolean),

    // ✅ outDir 正确位置
    build: {
      target: 'esnext',
      minify: isProd ? 'terser' : 'esbuild',
      cssCodeSplit: true, // 确保每个 chunk 的 CSS 独立产出
      outDir: `${dayjs().format('YYYY-MM-DD-HH-mm')}-${VITE_APP_ENV}-dist`,
      rollupOptions: {
        // 如果你要走 CDN，这里再配 external/paths；本例本地打包，所以注释
        // external: Object.keys(esmCdnMap),
        // output: { paths: esmCdnMap, ... }

        output: {
          // 业务入口：带 hash
          entryFileNames: '[name].[hash].js',

          // 第三方（pkg-）chunk：不带 hash；业务 chunk：带 hash
          chunkFileNames(chunkInfo) {
            return chunkInfo.name?.startsWith('pkg-')
              ? 'chunks/[name].js'
              : 'chunks/[name].[hash].js';
          },

          // 静态资源：
          // - 依赖包 CSS（以 pkg- 开头且含版本号） -> 无 hash，便于强缓存
          // - 其他资源 -> 带 hash（业务/公共）
          assetFileNames(assetInfo) {
            const name = assetInfo.name || '';
            const isCss = name.endsWith('.css');
            const isPkgCss = isCss && /^pkg-[\w@-]+-\d/.test(name);
            return isPkgCss
              ? 'assets/[name][extname]' // e.g. assets/pkg-echarts-5.5.1.css
              : 'assets/[name].[hash][extname]'; // 业务/其它：带 hash
          },

          // —— 每个依赖一个独立 chunk + 文件名带版本号 —— //
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // 取出一级包名（支持作用域包）
            const afterNm = id.split('node_modules/')[1];
            const segs = afterNm.split('/');
            const pkgName = segs[0].startsWith('@') ? `${segs[0]}/${segs[1]}` : segs[0];

            const version = getPkgVersion(pkgName);
            const safeName = sanitize(pkgName);
            const safeVer = sanitize(version);

            // e.g. chunks/pkg-echarts-5.5.1.js
            return `pkg-${safeName}-${safeVer}`;
          },
        },
      },
    },

    optimizeDeps: {
      esbuildOptions: { target: 'esnext' },
    },
    css: {
      preprocessorOptions: { scss: { api: 'modern-compiler' } },
      postcss: { plugins: [tailwindcss, autoprefixer] },
    },
  });
};
