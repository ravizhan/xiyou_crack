<template>
  <div class="setting_blank">
    <span style="padding-bottom: 5px">设定自动下一个分数阈值</span>
    <el-input-number
      v-model="score"
      :precision="2"
      :step="0.01"
      :max="100"
      controls-position="right"
    />
    <el-button
      style="margin-top: 5px"
      @click="setting()"
    >
      设定
    </el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      score: 70.00
    }
  },
  mounted() {
    if (localStorage.getItem("next_one_limit") !== null) {
      this.score = localStorage.getItem("next_one_limit")
    }
  },
  methods: {
    setting: function () {
      localStorage.setItem("next_one_limit",this.score)
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
</style>