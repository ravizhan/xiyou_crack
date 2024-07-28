<template>
  <div class="side-blank">
    <el-button
      @click="answerDialogVisible=true"
    >
      参考答案
    </el-button>
    <el-dialog
      v-model="answerDialogVisible"
      title="参考答案"
      width="40%"
      draggable
      align-center
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
    }
  },
  computed: {
    answer() {
      return localStorage.getItem(window.location.hash.split("&")[0].split("id=")[1])
    }
  }
}
</script>

<style scoped>
.side-blank {
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
