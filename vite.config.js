import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    monkey({
      entry: 'src/main.js',
      userscript: {
        "run-at": "document-start",
        namespace: 'ravizhan@hotmail.com',
        name:  '西柚英语辅助脚本',
        author: 'Ravi',
        version: '0.0.1',
        description: '实现功能: 一键获取答案',
        match: [
          'https://student.xiyouyingyu.com/*',
        ],
      },
      build: {
        externalGlobals: {
          vue: ["Vue", 'https://cdn.bootcdn.net/ajax/libs/vue/3.3.4/vue.global.prod.min.js']
        }
      },
    }),
  ],
});
