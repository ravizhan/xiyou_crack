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

export function show_answer_for_chooseTranslateV2(dict) {
  try {
    const answers = extractTextbookFromData(dict)
    if (answers === null) {
      throw new Error("未找到课文数据")
    }
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

// author: @awaxiaoyu
function extractTextbookFromData(data) {
  if (!data || typeof data !== 'object') return null;
  let result = null;
  // 递归查找包含textBookParaphrase的数组
  function findTextbookArrays(obj, path = '') {
    if (Array.isArray(obj)) {
      // 检查数组中的元素是否包含textBookParaphrase
      const hasTextbook = obj.some(item =>
        item && typeof item === 'object' && item.textBookParaphrase !== undefined
      );

      if (hasTextbook) {
        log(`发现课文数据数组: ${path || 'root'}, 长度: ${obj.length}`);
        result = extractAndOutput(obj);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        findTextbookArrays(value, `${path}.${key}`.replace(/^\./, ''));
      }
    }
  }

  findTextbookArrays(data);
  return result;
}

// author: @awaxiaoyu
function extractAndOutput(textbookArray) {
  if (!Array.isArray(textbookArray)) return null;

  // 提取关键字段
  const extracted = textbookArray.map((item, index) => {
    return {
      index: index,
      textBookParaphrase: item.textBookParaphrase || null,
      textBookParaphraseCn: item.textBookParaphraseCn || null,
      textBookParaphraseEn: item.textBookParaphraseEn || null,
      originalText: item.originalText || null,
      translation: item.translation || null,
      id: item.id || null,
      unitId: item.unitId || null,
      lessonId: item.lessonId || null
    };
  }).filter(item => item.textBookParaphrase !== null);

  if (extracted.length > 0) {
    // 在控制台输出数组
    console.log('=== 课文数据提取完成 ===');
    console.log('提取结果数组:', extracted);
    console.log('数组长度:', extracted.length);
    return extracted;
  }
}