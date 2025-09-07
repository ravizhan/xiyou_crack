<template>
  <div class="side-blank">
    <span style="text-align: center;color: black">自动修改分数</span>
    <el-button
      id="btn2"
      style="margin-left: 0;margin-top: 20px"
      @click="switch_modify()"
    >
      启用
    </el-button>
    <el-dialog
      v-model="modifyDialogVisible"
      title="设置"
      width="40%"
      draggable
      align-center
    >
      <div style="padding-bottom: 25px;text-align: center">
        自动修改分数设置
      </div>
      <el-row>
        <el-col
          :span="8"
          style="text-align: center"
        >
          <div class="tip-text">
            低于多少分才修改
          </div>
          <el-input-number
            v-model="score"
            :precision="2"
            :step="0.01"
            :max="100"
            controls-position="right"
          />
        </el-col>
        <el-col
          :span="8"
          style="text-align: center"
        >
          <div class="tip-text">
            修改后最低分数百分比
          </div>
          <el-input-number
            v-model="max"
            :precision="1"
            :step="0.1"
            :max="1"
            controls-position="right"
          />
        </el-col>
        <el-col
          :span="8"
          style="text-align: center"
        >
          <div class="tip-text">
            修改后最高分数百分比
          </div>
          <el-input-number
            v-model="min"
            :precision="1"
            :step="0.1"
            :max="1"
            controls-position="right"
          />
        </el-col>
      </el-row>
      <div style="text-align: center;padding-top: 10px">
        <el-button
          @click="setting()"
        >
          设定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {ElNotification} from "element-plus";

export default {
  data() {
    return {
      modifyDialogVisible: false,
      score: 60,
      min: 0.7,
      max: 0.8,
    }
  },
  mounted() {
    if (localStorage.getItem("auto_modify_limit") !== null) {
      const data = JSON.parse(localStorage.getItem("auto_modify_limit"))
      this.score = data.score
      this.min = data.min
      this.max = data.max
    }
    if (localStorage.getItem("modify_switch") == null) {
      localStorage.setItem("modify_switch", "false")
    }
    if (localStorage.getItem("modify_switch") === "true") {
      document.getElementById("btn2").innerText = "禁用"
    } else {
      document.getElementById("btn2").innerText = "启用"
    }
  },
  methods: {
    switch_modify: function () {
      if (document.getElementById("btn2").innerText === "启用") {
        document.getElementById("btn2").innerText = "禁用"
        this.modifyDialogVisible = true
        localStorage.setItem("modify_switch", "true")
      } else {
        document.getElementById("btn2").innerText = "启用"
        localStorage.setItem("modify_switch", "false")
        ElNotification({
          title: "Success",
          duration: 2000,
          message: "分数修改已禁用",
          type: "success",
        })
      }
    },
    setting: function () {
      const data = {
        score: this.score,
        min: this.min,
        max: this.max
      }
      localStorage.setItem("auto_modify_limit", JSON.stringify(data))
      this.modifyDialogVisible = false
      ElNotification({
        title: "Success",
        duration: 2000,
        message: "设置保存成功",
        type: "success",
      })
    }
  },
}
</script>

<style scoped>
.side-blank {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.tip-text {
  padding-bottom: 15px;
}
</style>
