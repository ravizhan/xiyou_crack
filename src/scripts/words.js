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
    // 当文档加载完成后执行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => extractWordLists(answers));
    } else {
      // 如果文档已经加载完成，直接执行
      setTimeout(() => extractWordLists(answers), 1000); // 延迟1秒执行，确保所有元素都已渲染
    }
    ElNotification({
      title: "Success",
      message: "答案解析成功，右键->检查->控制台 即可查看",
      type: "success",
    })
  } catch (e) {}
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
        console.log(`发现课文数据数组: ${path || 'root'}, 长度: ${obj.length}`);
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

// author: @awaxiaoyu
function extractWordLists(textbookData) {
  console.log('开始提取单词列表...');

  // 使用XPath定位到指定路径的父元素: /html/body/div[1]/div/div[2]/div[2]/div/div/div[2]
  const xpath = '/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]';
  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const parentElement = result.singleNodeValue;

  if (!parentElement) {
    console.error(`未找到指定XPath路径的父元素: ${xpath}`);
    return;
  }

  // 在父元素下获取所有类名包含word-list的div元素(忽略data-v属性)
  const wordLists = parentElement.querySelectorAll('div[class*="word-list"]');

  if (wordLists.length === 0) {
    console.log('在指定路径下未找到类名包含word-list的div元素');
    return;
  }

  console.log(`找到 ${wordLists.length} 个类名包含word-list的div元素`);

  // 存储索引结果
  const indexedResults = [];
  // 存储正确选项
  const correctOptions = [];

  // 遍历每个匹配的div元素
  wordLists.forEach((wordList, listIndex) => {
    // 初始化当前word-list的索引对象
    const listItem = {
      index: listIndex,
      element: wordList,
      bottomOptions: []
    };

    // 查找类名为bottom的元素
    const bottomElement = wordList.querySelector('.bottom');

    if (bottomElement) {
      // 查找bottom中类名为options的元素
      const options = bottomElement.querySelectorAll('.options');

      // 取前四个选项
      const topFourOptions = Array.from(options).slice(0, 4);

      // 为选项建立索引
      topFourOptions.forEach((option, optionIndex) => {
        listItem.bottomOptions.push({
          index: optionIndex,
          text: option.textContent.trim(),
          element: option
        });
      });
    } else {
      console.error(`div.word-list[${listIndex}] 中未找到类名为bottom的元素`);
    }

    indexedResults.push(listItem);
  });

  // 遍历所有索引结果，对比正确答案
  indexedResults.forEach((listItem, listIndex) => {
    if (listIndex < textbookData.length) {
      const textbookItem = textbookData[listIndex];
      const targetPhrase = textbookItem.textBookParaphrase;

      if (targetPhrase) {
        // 查找匹配的选项
        listItem.bottomOptions.forEach(option => {
          if (option.text.includes(targetPhrase)) {
            option.isCorrect = true;
            correctOptions.push({
              wordListIndex: listIndex,
              optionIndex: option.index,
              text: option.text
            });
          }
        });
      } else {
        console.error(`textbookData[${listIndex}].textBookParaphrase不存在`);
      }
    } else {
      console.error(`word-list[${listIndex}] 没有对应的textbookData项`);
    }
  });

  // 在控制台输出结果
  console.log('=== 单词列表索引完成 ===');
  console.log('索引结果:', indexedResults);
  console.log('总共有 ' + indexedResults.length + ' 个类名包含word-list的div元素');

  // 输出正确选项
  console.log('\n=== 正确选项 ===');
  if (correctOptions.length > 0) {
    correctOptions.forEach(item => {
      console.log(`word-list[${item.wordListIndex}] 选项[${item.optionIndex}]: ${item.text}`);
    });
  } else {
    console.log('未找到匹配的正确选项');
  }

  // 输出更友好的格式化结果
  console.log('\n=== 格式化索引结果 ===');
  indexedResults.forEach(item => {
    console.log(`word-list[${item.index}]`);
    item.bottomOptions.forEach(option => {
      console.log(`  选项[${option.index}]: ${option.text}`);
    });
  });
}