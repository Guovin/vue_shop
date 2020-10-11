<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只能为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="cateSelectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isDisable"
            >添加参数</el-button
          >
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only"
          ><el-button type="primary" size="mini" :disabled="isDisable"
            >添加属性</el-button
          ></el-tab-pane
        >
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      cateList: [],

      // 级联选择器配置参数
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器选中的id数组
      cateSelectedKeys: [],

      // 标签页当前显示标签
      activeName: 'many',

      // 动态参数数据列表
      manyTableData: [],
      // 静态参数数据列表
      onlyTableData: []
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      this.cateList = res.data
    },

    // 级联选择器发送变化触发的事件
    handleChange() {
      // 如果选中的数组长度不等于3则清空选中数组直接返回
      if (this.cateSelectedKeys.length !== 3) {
        this.cateSelectedKeys = []
        return false
      }
      this.getParamsData()
    },

    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData() {
      // 根据选中分类id与标签名称获取参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.catId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    isDisable() {
      if (this.cateSelectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 获取当前级联选择器选中的id
    catId() {
      if (this.cateSelectedKeys.length === 3) {
        return this.cateSelectedKeys[2]
      }
      return null
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin-top: 15px;
}
</style>
