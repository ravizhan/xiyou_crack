import {createApp} from "vue";
import paper from "../components/paper.vue";
import ElementPlus from "element-plus";

export function show_answer_for_paper() {
  if (localStorage.getItem(window.location.hash.split("&")[0].split("id=")[1]) === null) {
    alert("未找到答案，请重新进入当前页面");
  } else {
    setTimeout(() => {
      createApp(paper).use(ElementPlus).mount(
        (() => {
          const app = document.createElement("div");
          document.querySelector("#app > div > div.slider").appendChild(app)
          return app;
        })(),
      );
    }, 1000)
  }
}