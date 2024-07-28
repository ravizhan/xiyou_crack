import {processResponse} from "./scripts/parse.js";
import {show_answer_for_paper} from "./scripts/paper.js";
import {show_setting_for_accent} from "./scripts/accent.js";
import {show_answer_for_written} from "./scripts/written.js";
import {show_answer_for_chooseTranslate, show_setting_for_word} from "./scripts/words.js";
import "element-plus/dist/index.css"
import { ElNotification } from "element-plus"
import {unsafeWindow} from "$";

const hash = window.location.hash;
// 跳转页面时从此调用
let old = history.pushState
history.pushState = function (...arg) {
  // console.log(arg[2]);
  if (arg[2].includes("paperDetail")) {
    show_answer_for_paper();
  }
  if (arg[2].includes("readingLoudly")) {
    show_setting_for_word();
  }
  if (arg[2].includes("accentDetail")) {
    show_setting_for_accent();
  }
  if (arg[2].includes("writtenDetail")) {
    show_answer_for_written();
  }
  return old.call(this, ...arg);
}

// 进入页面时从此调用
if (hash.includes("chooseTranslate")) {
  ElNotification({
    title: "Error",
    message: "答案解析失败，请返回后重试",
    type: "error",
  })
}
if (hash.includes("readingLoudly")) {
  show_setting_for_word();
}
if (hash.includes("paperDetail")) {
  show_answer_for_paper();
}
if (hash.includes("accentDetail")) {
  show_setting_for_accent();
}
if (hash.includes("writtenDetail")) {
  show_answer_for_written();
}

// XHR劫持
const originOpen = XMLHttpRequest.prototype.open;
const oldSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open = function (method, url) {
  this._url = url;
  this._method = method;
  originOpen.apply(this, arguments);
};
XMLHttpRequest.prototype.send = function (data) {
  if (this._method.toLowerCase() === "post") {
    if (this._url === "https://app.xiyouyingyu.com/paper/getPaperGroupById") {
      this.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          localStorage.setItem(data.split("groupId=")[1], processResponse(JSON.parse(this.responseText)["data"],1));
        }
      });
    }
    if (this._url === "https://app.xiyouyingyu.com/write/selectByPrimaryKey") {
      this.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          localStorage.setItem(data.split("examId=")[1], processResponse(JSON.parse(this.responseText)["data"],2));
        }
      });
    }
    if (this._url === "https://app.xiyouyingyu.com/word/findListByIds" || this._url === "https://app.xiyouyingyu.com/word/getWordPush") {
      this.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          show_answer_for_chooseTranslate(JSON.parse(this.responseText))
        }
      });
    }
  }
  oldSend.apply(this, arguments);
};

// Websocket劫持
// 来源: https://learn.scriptcat.org/docs/middle/WebSocket%E6%8F%90%E4%BA%A4%E8%BF%94%E5%9B%9E%E5%8A%AB%E6%8C%81/
const originSocket = unsafeWindow.WebSocket;
unsafeWindow.WebSocket = function (...args) {
  let callback = undefined;
  const ws = new originSocket(...args);
  ws.onmessage = function (evt) {
    const proxyEvent = new Proxy(evt, {
      get: function (target, prop) {
        let data = target[prop];
        if (prop === "data") {
          // console.log(data)
          data = JSON.parse(data)
          if (JSON.stringify(data).includes("tokenId") && localStorage.getItem("modify_switch") === "true") {
            let auto_modify_limit = JSON.parse(localStorage.getItem("auto_modify_limit"))
            const old = data["result"]["overall"]
            const min = data["result"]["rank"] * auto_modify_limit["min"];
            const max = data["result"]["rank"] * auto_modify_limit["max"];
            if (old > auto_modify_limit["score"]) {
              return JSON.stringify(data);
            }
            data["result"]["overall"] = (Math.random() * (max - min) + min).toPrecision(2);
            console.log("分数修改成功\n修改前: "+old.toString()+"\n修改后: "+data["result"]["overall"].toString())
            ElNotification({
              title: "Success",
              duration: 3000,
              message: "分数修改成功\n修改前: "+old.toString()+"\n修改后: "+data["result"]["overall"].toString(),
              type: "success",
            })
            return JSON.stringify(data);
          }
          return JSON.stringify(data);
        }
        return JSON.stringify(data);
      },
    });
    callback && callback(proxyEvent);
  };
  Object.defineProperty(ws, "onmessage", {
    get: () => {
      return callback;
    },
    set: (setCall) => {
      callback = setCall;
    },
  });
  return ws;
};
