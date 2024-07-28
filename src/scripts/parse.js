export function processResponse(res,mode) {
  let answer = "";
  if (mode === 1) {
    for (let i of res) {
      console.log(i)
      if (i["name"] !== "模仿朗读" || i["name"] !== "单词或句子朗读") {
        for (let question of i["smallList"]) {
          for (let process of question["processList"]) {
            if (process["name"] === "录音作答") {
              let question_text = JSON.parse(process["content"])["showTxt"]
              let question_answer = String(process["oralTypeModel"]["answerTxt"])
              question_answer = question_answer.replaceAll("<blockquote>", "")
              question_answer = question_answer.replaceAll("</blockquote>", "")
              answer += `\n${question_text}\n\n${question_answer}\n`
            }
            if (process["name"] === "选项勾选") {
              let data = JSON.parse(process["content"])["textModelList"]
              for (let a of data) {
                if (a["showType"] === "3" || a["showType"] === "4") {
                  for (let b of JSON.parse(a["showTxt"])) {
                    let question_text = b["text"]
                    let question_answer = b["answer"]
                    answer += `\n${question_text}\n\n${question_answer}\n`
                  }
                }
                if (a["showType"] === "5") {
                  for (let b of JSON.parse(a["showTxt"])) {
                    let question_text = b["text"]
                    let question_answer = b["answers"][0]
                    answer += `\n${question_text}\n\n${question_answer}\n`
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (mode === 2) {
    for (let i of res["titleList"]) {
      if (["单项选择","重点词汇听写"].includes(i["questionsTypeName"])) {
        for (let question of i["writtenList"]) {
          let question_text = question["libList"][0]["titleType"]["text"]
          let question_answer = question["libList"][0]["titleType"]["answer"]
          answer += `\n${question_text}\n\n${question_answer}\n`
        }
      }
    }
  }
  return answer;
}