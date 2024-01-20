<template>
  <button class="btn_style" @click="centerDialogVisible=true">参考答案</button>
  <el-dialog
      v-model="centerDialogVisible"
      title="参考答案"
      width="40%"
      draggable
      align-center
  >
    <div style="
    white-space: pre-line;
    overflow: auto;
    height: 300px;
">{{ answer }}</div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      centerDialogVisible: false
    }
  },
  computed: {
    answer () { return localStorage.getItem(window.location.hash.split("&")[0].split("id=")[1]) },
  }
}
</script>

<style scoped>
.btn_style {
  width: 100%;
  margin-top: 10px;
  cursor: unset;
}
</style>