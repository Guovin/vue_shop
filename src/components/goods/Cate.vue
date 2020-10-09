<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary">添加分类</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据的数组
      cateList: [],
      // 总数据条数
      total: 0
    }
  },

  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      // console.log(res.data)
      this.cateList = res.data.result
      this.total = res.data.total
    }
  },

  created() {
    this.getCateList()
  }
}
</script>

<style scoped>

</style>
