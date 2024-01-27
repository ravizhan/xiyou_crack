import {createApp} from "vue";
import word from "../components/word.vue";
import ElementPlus, {ElNotification} from "element-plus";


export function show_answer_for_chooseTranslate(dict) {
  for (let index = 0; index < dict.data.length; index++) {
    const answer = dict["data"][index]["titleType"]["optionsTypeList"]
    for (let i = 0; i < 4; i++) {
      if (answer[i]["answer"] === true) {
        console.log(answer[i]["text"])
      }
    }
  }
  ElNotification({
    title: "Success",
    message: "答案解析成功，右键->检查->控制台 即可查看",
    type: "success",
  })
}

export function show_setting_for_word() {
  if (localStorage.getItem("next_one_limit") === "undefined") {
    localStorage.setItem("next_one_limit", "70.00")
  }
  setTimeout(() => {
    createApp(word).use(ElementPlus).mount(
      (() => {
        const app = document.createElement("div");
        app.setAttribute("style", "text-align: center")
        document.querySelector("#app > div > div.left-menu").appendChild(app)
        return app;
      })(),
    );
  }, 1000)
  let old_score = null
  setInterval(() => {
    const num = document.querySelector("#app > div > div.read-container > div.ant-spin-nested-loading > div > div > div.top > div:nth-child(1)").innerHTML.split("/")[0]
    const score = document.querySelector("#app > div > div.read-container > div.ant-spin-nested-loading > div > div > div.ul > div:nth-child(" + num + ") > div.user > div > div.score")
    if (score) {
      if (parseFloat(score.innerHTML) === old_score) {
        console.log("stop")
      } else {
        if (parseFloat(score.innerHTML) >= localStorage.getItem("next_one_limit")) {
          old_score = parseFloat(score.innerHTML)
          console.log("next")
          document.querySelector("#app > div > div.read-container > div.ant-spin-nested-loading > div > div > div.tool > div.right > div:nth-child(2)").click()
        }
      }
    }
  }, 1000)
}