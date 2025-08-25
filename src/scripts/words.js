import {createApp} from "vue";
import word from "../components/word.vue";
import ElementPlus, {ElNotification} from "element-plus";


export function show_answer_for_chooseTranslate(dict) {
  try {
    for (let index = 0; index < dict.data.length; index++) {
      const answer = dict["data"][index]["titleType"]["optionsTypeList"]
      for (let i = 0; i < 4; i++) {
        if (answer[i]["answer"] === true) {
          console.log(answer[i]["text"])
        }
      }
    }
  } catch (e) {
    try {
      const answers = deepsearch(dict, "textBookParaphrase")
      for (let i = 0; i < answers.length; i++) {
        if (answers[i] !== null) {
          console.log(answers[i])
        }
      }
    } catch (e) {
      ElNotification({
        title: "Error",
        message: "答案解析失败，右键->检查->控制台 查看错误详情",
        type: "error",
      })
      console.log(e)
      console.log("脚本出现错误，请粘贴 downloadHAR() 到下方并回车")
      console.log("将下载的 HAR 文件提交至 https://github.com/ravizhan/xiyou_crack/issues")
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

function deepsearch(obj,column) {
  const results = [];
  function traverse(item) {
    if (item === null || typeof item !== 'object') {
      return;
    }
    if (column in item) {
      results.push(item[column]);
    }
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        traverse(item[key]);
      }
    }
  }
  traverse(obj);
  return results;
}