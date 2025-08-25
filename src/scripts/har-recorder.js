// HAR 记录器模块 - 精简版
export class HARRecorder {
  constructor() {
    this.entries = [];
    this.startTime = new Date().toISOString();
    this.isRecording = false;
  }

  startRecording() {
    this.isRecording = true;
    this.entries = [];
    this.startTime = new Date().toISOString();
    console.log("HAR recording started");
  }

  stopRecording() {
    this.isRecording = false;
    console.log("HAR recording stopped");
  }

  recordRequest(method, url, requestHeaders, requestBody, status, responseHeaders, responseBody) {
    if (!this.isRecording) return;

    const startTime = new Date().toISOString();
    const entry = {
      startedDateTime: startTime,
      time: 100, // 简化时间计算
      request: {
        method: method,
        url: url,
        httpVersion: "HTTP/1.1",
        headers: this.formatHeaders(requestHeaders || {}),
        queryString: this.parseQueryString(url),
        headersSize: -1,
        bodySize: requestBody ? requestBody.length : 0
      },
      response: {
        status: status,
        statusText: "OK",
        httpVersion: "HTTP/1.1",
        headers: this.formatHeaders(responseHeaders || {}),
        content: {
          size: responseBody ? responseBody.length : 0,
          mimeType: "application/json",
          text: responseBody || ""
        },
        headersSize: -1,
        bodySize: responseBody ? responseBody.length : 0
      },
      cache: {},
      timings: {
        blocked: -1,
        dns: -1,
        connect: -1,
        send: 0,
        wait: 100,
        receive: 0,
        ssl: -1
      },
      pageref: "page_1"
    };

    // 添加请求体
    if (requestBody) {
      entry.request.postData = {
        mimeType: "application/x-www-form-urlencoded",
        text: requestBody
      };
    }

    this.entries.push(entry);
  }

  formatHeaders(headers) {
    if (Array.isArray(headers)) return headers;
    return Object.keys(headers).map(name => ({
      name: name,
      value: headers[name]
    }));
  }

  parseQueryString(url) {
    try {
      const urlObj = new URL(url);
      const params = [];
      urlObj.searchParams.forEach((value, name) => {
        params.push({ name, value });
      });
      return params;
    } catch (e) {
      return [];
    }
  }

  generateHAR() {
    return JSON.stringify({
      log: {
        version: "1.2",
        creator: {
          name: "Xiyou Crack HAR Recorder",
          version: "1.0"
        },
        pages: [{
          startedDateTime: this.startTime,
          id: "page_1",
          title: "Xiyou English App Requests",
          pageTimings: { onContentLoad: -1, onLoad: -1 }
        }],
        entries: this.entries
      }
    }, null, 2);
  }

  downloadHAR() {
    this.stopRecording();
    const harData = this.generateHAR();
    const blob = new Blob([harData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `xiyou-requests-${new Date().toISOString().replace(/[:.]/g, "-")}.har`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    console.log("HAR file downloaded and recording stopped");
  }

  getRecordedEntries() {
    return this.entries;
  }
}

// 创建全局实例并自动开始记录
export const harRecorder = new HARRecorder();
harRecorder.startRecording();
console.log("HAR recording started automatically. Use downloadHAR() in console to stop and download.");

// 暴露全局函数
window.downloadHAR = function() {
  harRecorder.downloadHAR();
};
