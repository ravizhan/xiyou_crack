function processResponse(res) {
  let answer = "";
  for (let i of res) {
    if (i["name"] !== "模仿朗读") {
      for (let question of i["smallList"]) {
        for (let process of question["processList"]) {
          if (process["name"] === "录音作答") {
            let question_text = JSON.parse(process["content"])["showTxt"];
            let question_answer = String(process["oralTypeModel"]["answerTxt"]);
            question_answer = question_answer.replaceAll("<blockquote>", "");
            question_answer = question_answer.replaceAll("</blockquote>", "");
            answer += `\n${question_text}\n\n${question_answer}\n`;
          }
        }
      }
    }
  }
  return answer;
}

export { processResponse };