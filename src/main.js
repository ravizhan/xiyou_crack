import {processResponse} from "./scripts/parse.js";
import { createApp } from 'vue';
import App from './App.vue';
const hash = window.location.hash;

function show_answer_for_paper() {
  if (localStorage.getItem(window.location.hash.split("&")[0].split("id=")[1]) === null) {
    alert("未找到答案，请重新进入当前页面");
  } else {
    setTimeout(() => {
      createApp(App).mount(
        (() => {
          const app = document.createElement('div');
          document.querySelector("#app > div > div.slider").appendChild(app)
          return app;
        })(),
      );
    },1000)
  }
}

function show_answer_for_chooseTranslate(dict) {
  for (let index = 0; index < dict.data.length; index++) {
    const answer = dict['data'][index]['titleType']['optionsTypeList']
    for (let i = 0; i < 4; i++) {
      if (answer[i]['answer'] === true) {
        console.log(answer[i]["text"])
      }
    }
  }
}

if (hash.includes("paperDetail")) {
  show_answer_for_paper();
}

const originOpen = XMLHttpRequest.prototype.open;
const oldSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open = function (method, url) {
  this._url = url;
  this._method = method;
originOpen.apply(this, arguments);
};
XMLHttpRequest.prototype.send = function(data) {
  if (this._method.toLowerCase() === 'post') {
    if (this._url === "https://app.xiyouyingyu.com/paper/getPaperGroupById") {
      this.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          localStorage.setItem(data.split("groupId=")[1], processResponse(JSON.parse(this.responseText)["data"]));
        }
      });
    }
    if (this._url === "https://app.xiyouyingyu.com/word/findListByIds") {
      this.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          show_answer_for_chooseTranslate(JSON.parse(this.responseText))
          alert("答案解析成功，右键->检查->控制台 即可查看")
        }
      });
    }
  }
  oldSend.apply(this, arguments);
};

let old=history.pushState
history.pushState=function(...arg){
  // console.log(arg[2]);
  if (arg[2].includes("paperDetail")) {
    show_answer_for_paper();
  }
  return old.call(this,...arg);
}