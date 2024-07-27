export function processResponse(res) {
  let answer = "";
  for (let i of res) {
    if (!(i["questionsName"].includes("模仿朗读"))) {
      for (let question of i["smallList"]) {
        for (let process of question["processList"]) {
          if (process["name"] === "录音作答") {
            let question_text = JSON.parse(process["content"])["showTxt"]
            let question_answer = String(process["oralTypeModel"]["answerTxt"])
            question_answer = question_answer.replaceAll("<blockquote>", "")
            question_answer = question_answer.replaceAll("</blockquote>", "")
            answer += `\n${question_text}\n\n${question_answer}\n`
          }
        }
      }
    }
    if (i["name"].includes("重读训练")) {
      for (let question of i["smallList"]) {
        for (let process of question["processList"]) {
          if (process["name"] === "选项勾选") {
            let data = JSON.parse(process["content"])["textModelList"]
            for (let a of data) {
              if (a["showType"] === "3") {
                let question_text = JSON.parse(a["showTxt"])[0]["text"]
                let question_answer = JSON.parse(a["showTxt"])[0]["answer"]
                answer += `\n${question_text}\n\n${question_answer}\n`
              }
            }
          }
        }
      }
    }
  }
  return answer;
}