import {createApp} from "vue";
import accent from "../components/accent.vue";
import ElementPlus from "element-plus";

export function show_setting_for_accent() {
    setTimeout(() => {
      createApp(accent).use(ElementPlus).mount(
        (() => {
          const app = document.createElement("div");
          document.querySelector("#app > div > div.container > div.slider > ul").appendChild(app)
          return app;
        })(),
      );
    }, 1000)
}