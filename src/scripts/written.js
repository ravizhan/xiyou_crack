import {createApp} from "vue";
import written from "../components/written.vue";
import ElementPlus from "element-plus";

export function show_answer_for_written() {
  if (localStorage.getItem(window.location.hash.split("&")[0].split("id=")[1]) === null) {
    alert("未找到答案，请重新进入当前页面");
  } else {
    setTimeout(() => {
      createApp(written).use(ElementPlus).mount(
        (() => {
          const app = document.createElement("div");
          document.querySelector("#app > div > div.card > div.main").appendChild(app)
          return app;
        })(),
      );
    }, 1000)
  }
}