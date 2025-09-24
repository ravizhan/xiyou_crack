<template>
  <div class="setting_blank">
    <el-button
        @click="answerDialogVisible=true"
    >
      参考答案
    </el-button>
    <br/>
    <el-button
        @click="autoFinish()"
    >
      一键完成
    </el-button>
    <el-dialog
        v-model="answerDialogVisible"
        align-center
        draggable
        title="参考答案"
        width="40%"
    >
      <div
          class="div-style"
      >
        {{ answer }}
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      answerDialogVisible: false,
      answer: "暂无参考答案"
    }
  },
  mounted() {
  },
  computed: {
    answer() {
      const data = sessionStorage.getItem("translate_answers")
      if (data) {
        return JSON.parse(data).join("\n")
      } else {
        return "暂无参考答案"
      }
    }
  },
  methods: {
    async autoFinish() {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const normalizeText = (text) => text.replace(/\s+/g, " ").trim();

      const raw = sessionStorage.getItem("translate_answers");
      if (!raw) return;
      const data = JSON.parse(raw);

      for (const correctAnswer of data) {
        const visibleQuestion = Array.from(document.querySelectorAll(".word-list"))
            .find(el => el.offsetParent !== null);
        if (!visibleQuestion) break;

        const normalizedCorrect = normalizeText(String(correctAnswer).replace(/^[A-D]\.\s*/, ""));
        const optionElements = visibleQuestion.querySelectorAll(".options .text");
        for (const optionElement of optionElements) {
          const optionText = normalizeText(optionElement.innerText.replace(/^[A-D]\.\s*/, ""));
          if (optionText.includes(normalizedCorrect)) {
            optionElement.click();
            break;
          }
        }

        const nextButton = visibleQuestion.querySelector(".next-btn");
        if (nextButton && nextButton.offsetParent !== null) {
          await sleep(1500);
          nextButton.click();
        }

        await sleep(1500);
      }
    }
  }
}
</script>

<style scoped>
.setting_blank {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.div-style {
  white-space: pre-line;
  overflow: auto;
  height: 300px;
  color: black;
}
</style>