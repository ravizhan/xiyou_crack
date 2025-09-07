import {processResponse} from "./scripts/parse.js";
import {show_answer_for_paper} from "./scripts/paper.js";
import {show_setting_for_accent} from "./scripts/accent.js";
import {show_answer_for_written} from "./scripts/written.js";
import {
  show_answer_for_chooseTranslate,
  show_answer_for_chooseTranslateV2,
  show_setting_for_word
} from "./scripts/words.js";
import {harRecorder} from "./scripts/har-recorder.js";
import "element-plus/dist/index.css"
import {ElNotification} from "element-plus"
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
  this._requestHeaders = {};

  const originalSetRequestHeader = this.setRequestHeader;
  this.setRequestHeader = function (name, value) {
    this._requestHeaders[name] = value;
    return originalSetRequestHeader.call(this, name, value);
  };

  originOpen.apply(this, arguments);
};

XMLHttpRequest.prototype.send = function (data) {
  const self = this;

  this.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      // 记录原始响应数据到HAR
      harRecorder.recordRequest(
        self._method,
        self._url,
        self._requestHeaders,
        data,
        this.status,
        self.parseResponseHeaders(self.getAllResponseHeaders()),
        this.responseText
      );

      if (self._method.toLowerCase() === "post") {
        try {
          if (self._url === "https://app.xiyouyingyu.com/paper/getPaperGroupById") {
            localStorage.setItem(data.split("groupId=")[1], processResponse(JSON.parse(this.responseText)["data"], 1));
          } else if (self._url === "https://app.xiyouyingyu.com/write/selectByPrimaryKey") {
            localStorage.setItem(data.split("examId=")[1], processResponse(JSON.parse(this.responseText)["data"], 2));
          } else if (self._url === "https://app.xiyouyingyu.com/word/findListByIds" || self._url === "https://app.xiyouyingyu.com/word/getWordPush") {
            try {
              show_answer_for_chooseTranslate(JSON.parse(this.responseText));
            } catch (e) {
              show_answer_for_chooseTranslateV2(JSON.parse(this.responseText));
            }
          } else if (self._url === "https://app.xiyouyingyu.com/entrance/moduleListNew") {
            const response = JSON.parse(this.responseText);
            if (Array.isArray(response["data"]["common"])) {
              for (let i = 0; i < response["data"]["common"].length; i++) {
                if (response["data"]["common"][i]["isLock"] === 1) {
                  response["data"]["common"][i]["isLock"] = 0;
                }
              }
            }
            if (Array.isArray(response["data"]["special"])) {
              for (let i = 0; i < response["data"]["special"].length; i++) {
                if (response["data"]["special"][i]["isLock"] === 1) {
                  response["data"]["special"][i]["isLock"] = 0;
                }
              }
            }
            Object.defineProperty(this, "responseText", {
              get: function () {
                return JSON.stringify(response);
              }
            });
          } else if (self._url === "https://app.xiyouyingyu.com/entrance/getModulesByPid") {
            const response = JSON.parse(this.responseText);
            for (let i = 0; i < response["moduleList"].length; i++) {
              if (response["moduleList"][i]["isLock"] === 1) {
                response["moduleList"][i]["isLock"] = 0;
              }
            }
            Object.defineProperty(this, "responseText", {
              get: function () {
                return JSON.stringify(response);
              }
            });
          } else if (self._url === "https://app.xiyouyingyu.com/paperAnswerCount/userPracticeInfo") {
            const response = JSON.parse(this.responseText);
            if (response["data"]["expire"] === "1") {
              response["data"]["expire"] = "0";
              response["data"]["expireAt"] = "2099-12-31 23:59:59";
            }
            if (response["data"]["hasVipCard"] === 0) {
              response["data"]["hasVipCard"] = 1;
            }
            Object.defineProperty(this, "responseText", {
              get: function () {
                return JSON.stringify(response);
              }
            });
          }else if (self._url === "https://app.xiyouyingyu.com/user/login/account") {
            const response = JSON.parse(this.responseText);
            if (response["data"]["userInfo"]["expire"] === "1") {
              response["data"]["userInfo"]["expire"] = "0";
              response["data"]["userInfo"]["expireAt"] = "2099-12-31 23:59:59";
            }
            if (response["data"]["hasVipCard"] === 0) {
              response["data"]["hasVipCard"] = 1;
            }
            Object.defineProperty(this, "responseText", {
              get: function () {
                return JSON.stringify(response);
              }
            });
          } else if (self._url === "https://app.xiyouyingyu.com/user/getVipCard") {
            let response = JSON.parse(this.responseText);
            if (response["data"].length === 0) {
              function randomCode() {
                let t = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
                  a = t.length,
                  n = "";
                for (let i = 0; i < 8; i++) n += t.charAt(Math.floor(Math.random() * a));
                return n
              }
              response = {
                "data":[
                  {
                    "code":randomCode(),
                    "bigGrayPhoto":"http://image.xiyouyingyu.com/product/software/app/21F6D8F15912466AB0D068A4487F2EBE.png",
                    "city":"-1",
                    "photo":"http://image.xiyouyingyu.com/product/software/app/1C2AD0043E8F4AC38C56FDF072FD00EB.png",
                    "remark":"1. 试题权限：此学习卡开放广东高中试题。\n\n2. 有效期：自激活日起730内有效，到期自动失效。\n\n3. 此学习卡为电子资源，一旦激活，不可退回。\n\n4. 学习卡权益仅限本人使用，不可转让，出借或售卖。\n\n5. 在使用过程中有任何问题可在上班期间致电客服电话，我们将会优先处理您的需求。\n\n6. 在使用过程中有任何问题可在APP内提交反馈，您的意见对我们很重要，感谢支持！",
                    "type":"31062",
                    "bigPhoto":"http://image.xiyouyingyu.com/product/software/app/50B8A89D27EA4E1CAE24446E29C0466E.png",
                    "vipExpireDateStr":"2099-12-31",
                    "grayPhoto":"http://image.xiyouyingyu.com/product/software/app/09BE3A1319A441C185A207F86C5BDC8A.png",
                    "vipExpireDate":"2099-12-31",
                    "province":"440000",
                    "scope":"广东高中",
                    "grade":"8",
                    "expire":"0",
                    "name":"广东高中VIP学习卡",
                    "shortName":"VIP学习卡",
                    "status":"1"
                  }
                ],
                "state":"11"
              }
            }
            Object.defineProperty(this, "responseText", {
              get: function () {
                return JSON.stringify(response);
              }
            });
          } else {
            // 扫描剩余所有请求
            show_answer_for_chooseTranslateV2(JSON.parse(this.responseText));
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
    }
  });

  oldSend.apply(this, arguments);
};

// 添加解析响应头的辅助方法
XMLHttpRequest.prototype.parseResponseHeaders = function (headerStr) {
  const headers = {};
  if (!headerStr) return headers;

  const headerPairs = headerStr.split("\u000d\u000a");
  for (let i = 0; i < headerPairs.length; i++) {
    const headerPair = headerPairs[i];
    const index = headerPair.indexOf("\u003a\u0020");
    if (index > 0) {
      const key = headerPair.substring(0, index);
      headers[key] = headerPair.substring(index + 2);
    }
  }
  return headers;
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
            console.log("分数修改成功\n修改前: " + old.toString() + "\n修改后: " + data["result"]["overall"].toString())
            ElNotification({
              title: "Success",
              duration: 3000,
              message: "分数修改成功\n修改前: " + old.toString() + "\n修改后: " + data["result"]["overall"].toString(),
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

// 添加HAR记录功能到全局作用域
window.harRecorder = harRecorder;
