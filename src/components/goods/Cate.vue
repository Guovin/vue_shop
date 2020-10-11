<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary" @click="setCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <table-tree
        class="table_tree"
        :data="cateList"
        :columns="columns"
        show-index
        :show-row-hover="false"
        border
        :selection-type="false"
        :expand-type="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editCateDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </table-tree>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="setCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <el-form
          ref="setCateRef"
          :model="cateForm"
          :rules="setCateRules"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="cateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="cascaderChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑分类对话框 -->
      <el-dialog
        title="编辑分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
      >
        <el-form
          ref="editCateRef"
          :model="editCateForm"
          :rules="setCateRules"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
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
      total: 0,

      // 第三方树形表格数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],

      // 控制添加分类对话框显示与隐藏
      setCateDialogVisible: false,
      // 添加分类的数据表单
      cateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加分类的表单规则
      setCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },

      // 父级分类数据
      parentCateList: [],
      // 级联选择器保存选中的id数组
      selectedKeys: [],
      // 级联选择器显示的参数
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },

      // 编辑分类对话框显示与隐藏
      editCateDialogVisible: false,
      // 编辑分类提交参数
      editCateForm: {
        cat_name: ''
      }
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
    },

    // 监听分页的条数改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    // 监听当前页数改变的事件
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },

    // 监听添加分类点击事件
    setCateDialog() {
      this.getParentCateList()
      this.setCateDialogVisible = true
    },

    // 获取父级分类数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      this.parentCateList = res.data
    },

    // 监听级联选择器改变事件
    cascaderChange() {
      // 选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 分类父id
        this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 分类当前等级
        this.cateForm.cat_level = this.selectedKeys.length
      } else {
        // 未选状态
        // 分类父id
        this.cateForm.cat_pid = 0
        // 分类当前等级
        this.cateForm.cat_level = 0
      }
    },
    // 监听添加分类对话框确认按钮
    submitCate() {
      // 表单预校验
      this.$refs.setCateRef.validate(async valid => {
        // 这里其实只是验证了分类名称是否填写，级联选择器有没有选择未验证
        // 未选择级联选择器默认添加一级分类
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post('categories', this.cateForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.setCateDialogVisible = false
      })
    },

    // 监听添加分类对话框关闭事件，清空表单数据
    addCateDialogClosed() {
      // 清空分类名称
      this.$refs.setCateRef.resetFields()
      // 清空级联选择器内容
      this.selectedKeys = []
      this.cateForm.cat_pid = 0
      this.cateForm.cat_level = 0
    },

    // 监听编辑分类点击按钮
    editCateDialog(row) {
      this.editCateForm.id = row.cat_id
      this.editCateForm.cat_name = row.cat_name
      this.editCateDialogVisible = true
    },

    // 编辑分类
    editCate() {
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.id}`,
          {
            cat_name: this.editCateForm.cat_name
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败！')
        }
        this.$message.success('更新分类成功！')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },

    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作！')
      }
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.$message.success('删除分类成功！')
      this.getCateList()
      this.editCateDialogVisible = false
    }
  },

  created() {
    this.getCateList()
  }
}
</script>

<style scoped>
.table_tree {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
