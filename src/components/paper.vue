<template>
  <div class="side-blank">
    <el-button
      @click="centerDialogVisible=true"
    >
      参考答案
    </el-button>
    <el-button
      style="margin-left: 0;margin-top: 5px"
      @click="switch_mute()"
    >
      模仿朗读开启/关闭声音
    </el-button>
    <el-dialog
      v-model="centerDialogVisible"
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
      centerDialogVisible: false
    }
  },
  computed: {
    answer () { return localStorage.getItem(window.location.hash.split("&")[0].split("id=")[1]) }
  },
  methods: {
    switch_mute: function () {
      const dom = document.querySelector("#app > div > div.paper-detail-container > div.content > div > div > div.substance > div > video");
      dom.muted = dom.muted === false;
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