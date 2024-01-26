<template>
  <div class="setting_blank">
    <span style="padding-bottom: 5px">设定自动分数阈值</span>
    <el-input-number v-model="num" :precision="2" :step="0.01" :max="100" controls-position="right"/>
    <el-button style="margin-top: 5px" @click="setting()">设定</el-button>
  </div>

</template>

<script>
export default {
  data() {
    return {
      num: 70.00
    }
  },
  methods: {
    setting: function () {
      localStorage.setItem("next_one_limit",this.num)
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