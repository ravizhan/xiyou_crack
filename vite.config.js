import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import monkey from "vite-plugin-monkey";


export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: "src/main.js",
      userscript: {
        "run-at": "document-start",
        namespace: "ravizhan@hotmail.com",
        name: "西柚英语辅助脚本",
        author: "Ravi",
        version: "0.0.3",
        description: "实现功能: 一键获取听说作业、单词选择作业答案。更多功能正在添加～",
        match: [
          "https://student.xiyouyingyu.com/*",
        ],
        license: "AGPL-3.0-only"
      },
      build: {
        externalGlobals: {
          "vue": ["Vue", "https://registry.npmmirror.com/vue/3.3.4/files/dist/vue.global.prod.js"].concat("data:application/javascript," + encodeURIComponent(";window.Vue=Vue;",),
          ),
          "element-plus": ["ElementPlus", "https://registry.npmmirror.com/element-plus/2.4.4/files/dist/index.full.min.js"],
        },
        externalResource: {
          "element-plus/dist/index.css": "https://registry.npmmirror.com/element-plus/2.4.4/files/dist/index.css"
        }
      },
    }),
  ],
});
